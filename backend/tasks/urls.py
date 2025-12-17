from django.urls import path, include, re_path
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import time
from .views import (
    LoginView, UserView, SuperManagerDashboardStats, 
    SuperManagerUserViewSet, SuperManagerProjectViewSet, 
    SuperManagerTaskViewSet, RecentActivityView, 
    ManagerProjectViewSet, ManagerTaskViewSet, 
    ManagerEmployeeListView, ManagerDashboardStats, 
    EmployeeTaskViewSet, ReportView, FrontendAppView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'supermanager/users', SuperManagerUserViewSet, basename='supermanager-users')
router.register(r'supermanager/projects', SuperManagerProjectViewSet, basename='supermanager-projects')
router.register(r'supermanager/tasks', SuperManagerTaskViewSet, basename='supermanager-tasks')
router.register(r'manager/projects', ManagerProjectViewSet, basename='manager-projects')
router.register(r'manager/tasks', ManagerTaskViewSet, basename='manager-tasks')
router.register(r'employee/tasks', EmployeeTaskViewSet, basename='employee-tasks')

def health_check(request):
    return JsonResponse({
        'status': 'ok', 
        'timestamp': time.time(),
        'service': 'django',
        'message': 'Server is running'
    })

def cors_test(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({"status": "preflight ok"})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response
    
    return JsonResponse({
        "status": "ok",
        "message": "CORS test successful"
    })

urlpatterns = [
    # Test endpoints (outside /api/)
    path('health/', health_check, name='health'),
    path('cors-test/', cors_test, name='cors-test'),
    
    # API endpoints under /api/
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/user/', UserView.as_view(), name='user'),
    path('api/supermanager-dashboard-stats/', SuperManagerDashboardStats.as_view(), name='supermanager-dashboard-stats'),
    path('api/manager-dashboard-stats/', ManagerDashboardStats.as_view(), name='manager-dashboard-stats'),
    path('api/manager/employees/', ManagerEmployeeListView.as_view(), name='manager-employees'),
    path('api/recent-activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('api/reports/', ReportView.as_view(), name='reports'),
    path('api/', include(router.urls)),
    
    # React frontend (CATCH ALL - MUST BE LAST)
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
