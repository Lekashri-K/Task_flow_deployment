
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Q, Count, F, Case, When, FloatField
from django.db.models.functions import Coalesce
from .models import CustomUser, Project, Task
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer
from django.db.models.functions import TruncDate
class SuperManagerDashboardStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'supermanager':
            return Response({'error': 'Unauthorized'}, status=403)

        stats = {
            'total_users': CustomUser.objects.count(),
            'active_projects': Project.objects.count(),
            'pending_tasks': Task.objects.filter(status='pending').count(),
            'in_progress_tasks': Task.objects.filter(status='in_progress').count(),
            'completed_tasks': Task.objects.filter(status='completed').count()
        }
        return Response(stats)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SuperManagerUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'supermanager':
            return CustomUser.objects.all().order_by('-date_joined')  # Newest first
        return CustomUser.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # For the dashboard, return only active users
        if request.query_params.get('dashboard') == 'true':
            queryset = queryset.filter(is_active=True)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SuperManagerProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            # Ensure the request user is a supermanager
            if request.user.role != 'supermanager':
                return Response(
                    {'message': 'Only supermanagers can create projects'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Set the created_by field to the current user
            serializer.save(created_by=request.user)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# class SuperManagerTaskViewSet(viewsets.ModelViewSet):
#     serializer_class = TaskSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         if self.request.user.role != 'supermanager':
#             return Task.objects.none()
            
#         queryset = Task.objects.all().order_by('-created_at')
        
#         project_id = self.request.query_params.get('project')
#         if project_id:
#             queryset = queryset.filter(project_id=project_id)
            
#         return queryset

#     def perform_create(self, serializer):
#         serializer.save(assigned_by=self.request.user)

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context['request'] = self.request
#         return context
class SuperManagerTaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'supermanager':
            return Task.objects.none()
            
        queryset = Task.objects.select_related(
            'assigned_to', 'assigned_by', 'project'
        ).order_by('-created_at')
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get tasks and projects that were updated or created recently
        task_qs = Task.objects.filter(
            Q(created_at__gte=now() - timedelta(days=30)) | Q(updated_at__gte=now() - timedelta(days=30))
        ).select_related('assigned_by', 'assigned_to', 'project')

        project_qs = Project.objects.filter(
            Q(created_at__gte=now() - timedelta(days=30)) | Q(updated_at__gte=now() - timedelta(days=30))
        ).select_related('created_by', 'assigned_to')

        activities = []

        for task in task_qs:
            action = "updated" if task.updated_at != task.created_at else "created"
            activities.append({
                "id": task.id,
                "type": "task",
                "title": task.title,
                "description": task.description,
                "timestamp": task.updated_at if action == "updated" else task.created_at,
                "user": task.assigned_by.full_name or task.assigned_by.username,
                "user_role": task.assigned_by.role,
                "status": task.status,
                "action": action
            })

        for project in project_qs:
            action = "updated" if project.updated_at != project.created_at else "created"
            activities.append({
                "id": project.id,
                "type": "project",
                "title": project.name,
                "description": project.description,
                "timestamp": project.updated_at if action == "updated" else project.created_at,
                "user": project.created_by.full_name or project.created_by.username,
                "user_role": project.created_by.role,
                "status": "active",
                "action": action
            })

        # Sort by timestamp descending and limit to 10 most recent
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(activities[:10])


class ReportView(APIView):
    def get(self, request):
        project_id = request.query_params.get('project')
        
        # Get all projects for the filter dropdown
        all_projects = Project.objects.all()
        
        # Base queryset with optional project filter
        tasks_queryset = Task.objects.all()
        if project_id:
            tasks_queryset = tasks_queryset.filter(project_id=project_id)
        
        # Calculate basic statistics
        total_tasks = tasks_queryset.count()
        completed_tasks = tasks_queryset.filter(status='completed').count()
        pending_tasks = tasks_queryset.filter(status='pending').count()
        in_progress_tasks = tasks_queryset.filter(status='in_progress').count()
        overdue_tasks = tasks_queryset.filter(
            Q(due_date__lt=timezone.now().date()) & 
            ~Q(status='completed')
        ).count()
        
        # Status distribution for chart
        status_labels = ['Pending', 'In Progress', 'Completed', 'Overdue']
        status_data = [
            pending_tasks,
            in_progress_tasks,
            completed_tasks,
            overdue_tasks
        ]
        
        # Projects progress
        projects_queryset = Project.objects.all()
        if project_id:
            projects_queryset = projects_queryset.filter(id=project_id)
            
        projects_progress = []
        for project in projects_queryset:
            project_tasks = project.tasks.all()
            total = project_tasks.count()
            completed = project_tasks.filter(status='completed').count()
            
            progress = 0
            if total > 0:
                progress = (completed / total) * 100
                
            projects_progress.append({
                'id': project.id,
                'name': project.name,
                'progress': progress,
                'total_tasks': total,
                'completed_tasks': completed
            })
        
        response_data = {
            'stats': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': pending_tasks,
                'in_progress_tasks': in_progress_tasks,
                'overdue_tasks': overdue_tasks,
            },
            'statusDistribution': {
                'labels': status_labels,
                'data': status_data
            },
            'projectsProgress': projects_progress,
            'allProjects': [{'id': p.id, 'name': p.name} for p in all_projects],
        }
        
        return Response(response_data)