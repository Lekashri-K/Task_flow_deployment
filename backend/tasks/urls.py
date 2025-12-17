from django.urls import path, include, re_path
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
import time

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': time.time(),
        'service': 'django'
    })

def cors_test(request):
    """Direct CORS test endpoint"""
    return JsonResponse({
        'status': 'ok',
        'message': 'CORS test endpoint',
        'method': request.method
    })

urlpatterns = [
    # Test endpoints (no /api/ prefix)
    path('health/', health_check, name='health'),
    path('cors-test/', cors_test, name='cors-test'),
    
    # API endpoints
    path('api/login/', LoginView.as_view(permission_classes=[AllowAny]), name='login'),
    path('api/user/', UserView.as_view(), name='user'),
    path('api/supermanager-dashboard-stats/', SuperManagerDashboardStats.as_view(), name='supermanager-dashboard-stats'),
    path('api/manager-dashboard-stats/', ManagerDashboardStats.as_view(), name='manager-dashboard-stats'),
    path('api/manager/employees/', ManagerEmployeeListView.as_view(), name='manager-employees'),
    path('api/recent-activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('api/reports/', ReportView.as_view(), name='reports'),
    path('api/', include(router.urls)),
    
    # Frontend catch-all (LAST)
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
