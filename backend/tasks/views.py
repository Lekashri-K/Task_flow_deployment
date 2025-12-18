import os
from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Q, Count, F, Case, When, FloatField
from django.db.models.functions import Coalesce
from .models import CustomUser, Project, Task
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer
# Add this as the FIRST view in your tasks/views.py
class BuildDebugView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        import os
        import subprocess
        
        # Find all build directories
        find_cmd = "find /opt/render/project -name 'build' -type d 2>/dev/null"
        result = subprocess.run(find_cmd, shell=True, capture_output=True, text=True)
        
        builds = []
        for build_dir in result.stdout.strip().split('\n'):
            if build_dir and os.path.exists(build_dir):
                builds.append({
                    'path': build_dir,
                    'has_index': os.path.exists(os.path.join(build_dir, 'index.html')),
                    'files': os.listdir(build_dir) if os.path.exists(build_dir) else []
                })
        
        return Response({
            'base_dir': str(settings.BASE_DIR),
            'current_dir': os.getcwd(),
            'all_build_directories': builds,
            'frontend_directory_exists': os.path.exists('/opt/render/project/src/frontend'),
            'frontend_build_exists': os.path.exists('/opt/render/project/src/frontend/build'),
        })
class FileSystemDebugView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        import os
        import sys
        
        # Get current paths
        current_dir = os.getcwd()
        base_dir = str(settings.BASE_DIR)
        
        # Walk through directory structure
        def list_dir(path, depth=0, max_depth=3):
            result = []
            if depth >= max_depth:
                return result
            try:
                items = os.listdir(path)
                for item in items:
                    full_path = os.path.join(path, item)
                    result.append("  " * depth + f"├── {item}")
                    if os.path.isdir(full_path):
                        result.extend(list_dir(full_path, depth + 1, max_depth))
            except:
                pass
            return result
        
        structure = list_dir(current_dir)
        
        info = {
            "python_version": sys.version,
            "current_working_directory": current_dir,
            "django_base_dir": base_dir,
            "manage_py_exists": os.path.exists(os.path.join(base_dir, "manage.py")),
            "frontend_build_in_base": os.path.exists(os.path.join(base_dir, "frontend_build")),
            "directory_structure": structure[:100],  # First 100 lines
            "environment_variables": {
                "PWD": os.environ.get("PWD", "Not set"),
                "HOME": os.environ.get("HOME", "Not set"),
                "RENDER": os.environ.get("RENDER", "Not set"),
            }
        }
        
        return Response(info)
# ========== FrontendAppView with DEBUGGING ==========
class FrontendAppView(View):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        import os
        
        # Try these locations IN ORDER
        locations = [
            # 1. Where build.sh SHOULD put it
            '/opt/render/project/src/frontend_build/index.html',
            
            # 2. In the React build directory (if not copied)
            '/opt/render/project/src/frontend/build/index.html',
            
            # 3. In backend/frontend_build
            '/opt/render/project/src/backend/frontend_build/index.html',
            
            # 4. Current directory
            os.path.join(os.getcwd(), 'frontend_build', 'index.html'),
            
            # 5. Base directory
            os.path.join(settings.BASE_DIR, 'frontend_build', 'index.html'),
        ]
        
        for location in locations:
            if os.path.exists(location):
                try:
                    with open(location, 'r', encoding='utf-8') as f:
                        return HttpResponse(f.read())
                except Exception as e:
                    print(f"Error reading {location}: {e}")
                    continue
        
        # If not found, create a simple test page
        return HttpResponse(f"""
        <html>
        <head><title>TaskFlow - Debug</title></head>
        <body>
            <h1>Debug Info</h1>
            <p>BASE_DIR: {settings.BASE_DIR}</p>
            <p>Current dir: {os.getcwd()}</p>
            <h2>Checked locations:</h2>
            <ul>
                {"".join([f'<li>{loc} - {"✓" if os.path.exists(loc) else "✗"}</li>' for loc in locations])}
            </ul>
            <h2>Directory listing of /opt/render/project/src:</h2>
            <ul>
                {"".join([f'<li>{f}</li>' for f in os.listdir('/opt/render/project/src')])}
            </ul>
            <p><a href="/api/build-debug/">More debug info</a></p>
        </body>
        </html>
        """)
# ========== HealthCheckView with path info ==========
class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        import os
        return Response({
            'status': 'healthy',
            'message': 'TaskFlow API is running',
            'timestamp': timezone.now(),
            'version': '1.0.0',
            'paths': {
                'base_dir': str(settings.BASE_DIR),
                'current_dir': os.getcwd(),
                'frontend_build_exists': os.path.exists(os.path.join(settings.BASE_DIR, 'frontend_build')),
                'frontend_index_exists': os.path.exists(os.path.join(settings.BASE_DIR, 'frontend_build', 'index.html')),
            }
        })

# ========== Path Debug View ==========
class PathDebugView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        import os
        import sys
        
        info = {
            'python_version': sys.version,
            'current_directory': os.getcwd(),
            'base_directory': str(settings.BASE_DIR),
            'frontend_build_path': os.path.join(settings.BASE_DIR, 'frontend_build'),
            'frontend_build_exists': os.path.exists(os.path.join(settings.BASE_DIR, 'frontend_build')),
            'files_in_current_dir': os.listdir('.'),
            'files_in_base_dir': os.listdir(settings.BASE_DIR) if os.path.exists(settings.BASE_DIR) else [],
            'environment': {
                'DEBUG': settings.DEBUG,
                'ALLOWED_HOSTS': settings.ALLOWED_HOSTS,
            }
        }
        
        # Check for frontend_build in parent directories
        parent_dirs = []
        current_path = settings.BASE_DIR
        for i in range(3):
            parent = os.path.dirname(current_path) if i > 0 else current_path
            frontend_path = os.path.join(parent, 'frontend_build')
            parent_dirs.append({
                'path': frontend_path,
                'exists': os.path.exists(frontend_path),
                'has_index': os.path.exists(os.path.join(frontend_path, 'index.html')) if os.path.exists(frontend_path) else False
            })
            current_path = parent
        
        info['parent_directory_checks'] = parent_dirs
        
        return Response(info)

# ========== SuperManagerDashboardStats ==========
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

# ========== LoginView ==========
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

# ========== UserView ==========
class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# ========== SuperManagerUserViewSet ==========
class SuperManagerUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'supermanager':
            return CustomUser.objects.all().order_by('-date_joined')
        return CustomUser.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        if request.query_params.get('dashboard') == 'true':
            queryset = queryset.filter(is_active=True)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# ========== SuperManagerProjectViewSet ==========
class SuperManagerProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            if request.user.role != 'supermanager':
                return Response(
                    {'message': 'Only supermanagers can create projects'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            serializer.save(created_by=request.user)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# ========== SuperManagerTaskViewSet ==========
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

# ========== RecentActivityView ==========
class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.GET.get('limit', 10))
        
        task_qs = Task.objects.filter(
            Q(created_at__gte=now() - timedelta(days=30)) | 
            Q(updated_at__gte=now() - timedelta(days=30))
        ).select_related('assigned_by', 'assigned_to', 'project')

        project_qs = Project.objects.filter(
            Q(created_at__gte=now() - timedelta(days=30)) | 
            Q(updated_at__gte=now() - timedelta(days=30))
        ).select_related('created_by')

        user_qs = CustomUser.objects.filter(
            date_joined__gte=now() - timedelta(days=30)
        )

        activities = []

        for task in task_qs:
            if task.created_at >= now() - timedelta(days=1):
                activities.append({
                    "id": f"task_{task.id}_created",
                    "type": "task",
                    "title": f"Task created: {task.title}",
                    "description": f"Assigned to {task.assigned_to.full_name or task.assigned_to.username}",
                    "timestamp": task.created_at,
                    "user": task.assigned_by.full_name or task.assigned_by.username,
                    "user_role": task.assigned_by.role,
                    "status": task.status,
                    "action": "created",
                    "task_title": task.title,
                    "project_name": task.project.name if task.project else "No Project",
                    "assigned_to": task.assigned_to.full_name or task.assigned_to.username
                })
            
            if (task.status == 'completed' and 
                task.updated_at >= now() - timedelta(days=1) and
                task.updated_at != task.created_at):
                
                activities.append({
                    "id": f"task_{task.id}_completed",
                    "type": "task",
                    "title": f"Task completed: {task.title}",
                    "description": f"Completed by team under {task.assigned_by.full_name or task.assigned_by.username}",
                    "timestamp": task.updated_at,
                    "user": task.assigned_by.full_name or task.assigned_by.username,
                    "user_role": task.assigned_by.role,
                    "status": "completed",
                    "action": "completed",
                    "task_title": task.title,
                    "project_name": task.project.name if task.project else "No Project",
                    "completed_by": task.assigned_to.full_name or task.assigned_to.username
                })

        for project in project_qs:
            action = "updated" if project.updated_at != project.created_at else "created"
            activities.append({
                "id": f"project_{project.id}",
                "type": "project",
                "title": f"Project {action}: {project.name}",
                "description": project.description,
                "timestamp": project.updated_at if action == "updated" else project.created_at,
                "user": project.created_by.full_name or project.created_by.username,
                "user_role": project.created_by.role,
                "status": "active",
                "action": action,
                "project_name": project.name
            })

        for user in user_qs:
            activities.append({
                "id": f"user_{user.id}",
                "type": "user",
                "title": f"User created: {user.full_name or user.username}",
                "description": f"New {user.role} account created",
                "timestamp": user.date_joined,
                "user": "System",
                "user_role": "supermanager",
                "status": "active" if user.is_active else "inactive",
                "action": "created",
                "target_user": user.full_name or user.username,
                "user_role_created": user.role
            })

        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(activities[:limit])

# ========== ReportView ==========
class ReportView(APIView):
    def get(self, request):
        project_id = request.query_params.get('project')
        
        all_projects = Project.objects.all()
        
        tasks_queryset = Task.objects.all()
        if project_id:
            tasks_queryset = tasks_queryset.filter(project_id=project_id)
        
        total_tasks = tasks_queryset.count()
        completed_tasks = tasks_queryset.filter(status='completed').count()
        pending_tasks = tasks_queryset.filter(status='pending').count()
        in_progress_tasks = tasks_queryset.filter(status='in_progress').count()
        overdue_tasks = tasks_queryset.filter(
            Q(due_date__lt=timezone.now().date()) & 
            ~Q(status='completed')
        ).count()
        
        status_labels = ['Pending', 'In Progress', 'Completed', 'Overdue']
        status_data = [
            pending_tasks,
            in_progress_tasks,
            completed_tasks,
            overdue_tasks
        ]
        
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

# ========== ManagerProjectViewSet ==========
class ManagerProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'manager':
            return Project.objects.filter(assigned_to=self.request.user)
        return Project.objects.none()

# ========== ManagerTaskViewSet ==========
class ManagerTaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'manager':
            project_id = self.request.query_params.get('project')
            
            if project_id:
                if not Project.objects.filter(
                    id=project_id, 
                    assigned_to=self.request.user
                ).exists():
                    return Task.objects.none()
                return Task.objects.filter(project_id=project_id)
            
            manager_projects = Project.objects.filter(assigned_to=self.request.user)
            return Task.objects.filter(project__in=manager_projects)
        return Task.objects.none()

# ========== ManagerEmployeeListView ==========
class ManagerEmployeeListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'manager':
            return CustomUser.objects.filter(role='employee')
        return CustomUser.objects.none()

# ========== ManagerDashboardStats ==========
class ManagerDashboardStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'manager':
            return Response({'error': 'Unauthorized'}, status=403)

        projects = Project.objects.filter(assigned_to=request.user)
        project_ids = projects.values_list('id', flat=True)
        tasks = Task.objects.filter(project__in=project_ids)

        stats = {
            'total_projects': projects.count(),
            'active_projects': projects.filter(deadline__gte=timezone.now()).count(),
            'pending_tasks': tasks.filter(status='pending').count(),
            'in_progress_tasks': tasks.filter(status='in_progress').count(),
            'completed_tasks': tasks.filter(status='completed').count(),
            'overdue_tasks': tasks.filter(
                Q(due_date__lt=timezone.now().date()) & ~Q(status='completed')
            ).count()
        }

        return Response(stats)

# ========== EmployeeTaskViewSet ==========
class EmployeeTaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'employee':
            return Task.objects.filter(assigned_to=self.request.user)
        return Task.objects.none()

    def perform_create(self, serializer):
        serializer.save(assigned_to=self.request.user)
