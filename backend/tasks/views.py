from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.utils.timezone import now

from .models import CustomUser, Project, Task
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer

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
    queryset = Project.objects.all().order_by('-created_at')  # Newest first
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            assigned_to_id = request.data.get('assigned_to')
            if not assigned_to_id:
                return Response({'message': 'Manager assignment is required'}, status=status.HTTP_400_BAD_REQUEST)

            assigned_to = CustomUser.objects.filter(id=assigned_to_id, role='manager').first()
            if not assigned_to:
                return Response({'message': 'Invalid manager ID provided'}, status=status.HTTP_400_BAD_REQUEST)

            project = Project.objects.create(
                name=request.data.get('name'),
                description=request.data.get('description', ''),
                created_by=request.user,
                assigned_to=assigned_to,
                deadline=request.data.get('deadline')
            )

            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SuperManagerTaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')  # Newest first
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'supermanager':
            return super().get_queryset()
        return Task.objects.none()

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


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