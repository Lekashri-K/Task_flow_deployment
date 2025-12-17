from django.urls import path, include, re_path
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import time
from .views import (
    LoginView, 
    UserView,
    SuperManagerDashboardStats,
    SuperManagerUserViewSet,
    SuperManagerProjectViewSet,
    SuperManagerTaskViewSet,
    RecentActivityView,
    ManagerProjectViewSet,
    ManagerTaskViewSet,
    ManagerEmployeeListView,
    ManagerDashboardStats,
    EmployeeTaskViewSet,
    ReportView,
    FrontendAppView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'supermanager/users', SuperManagerUserViewSet, basename='supermanager-users')
router.register(r'supermanager/projects', SuperManagerProjectViewSet, basename='supermanager-projects')
router.register(r'supermanager/tasks', SuperManagerTaskViewSet, basename='supermanager-tasks')
router.register(r'manager/projects', ManagerProjectViewSet, basename='manager-projects')
router.register(r'manager/tasks', ManagerTaskViewSet, basename='manager-tasks')
router.register(r'employee/tasks', EmployeeTaskViewSet, basename='employee-tasks')

# Health check endpoint
def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': time.time(),
        'service': 'django',
        'message': 'Server is running'
    })

# Simple test endpoint for debugging
def test_endpoint(request):
    return JsonResponse({
        'message': 'Test endpoint works',
        'method': request.method,
        'path': request.path,
    })

urlpatterns = [
    # Wrap all API endpoints in the 'api/' prefix
    path('api/', include([
        path('health/', health_check, name='health'),
        path('test/', test_endpoint, name='test'),
      path('login/', LoginView.as_view(), name='login'),

        path('user/', UserView.as_view(), name='user'),
        path('supermanager-dashboard-stats/', SuperManagerDashboardStats.as_view(), name='supermanager-dashboard-stats'),
        path('manager-dashboard-stats/', ManagerDashboardStats.as_view(), name='manager-dashboard-stats'),
        path('manager/employees/', ManagerEmployeeListView.as_view(), name='manager-employees'),
        path('recent-activity/', RecentActivityView.as_view(), name='recent-activity'),
        path('reports/', ReportView.as_view(), name='reports'),
        path('', include(router.urls)),
    ])),
    
    # REACT FRONTEND - Catch all other routes
    # This remains OUTSIDE the api/ prefix
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
