# tasks/urls.py - Update with minimal changes

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# KEEP ALL YOUR EXISTING router.register() calls exactly as they are
router.register(r'supermanager/users', views.SuperManagerUserViewSet, basename='supermanager-users')
router.register(r'supermanager/projects', views.SuperManagerProjectViewSet, basename='supermanager-projects')
router.register(r'supermanager/tasks', views.SuperManagerTaskViewSet, basename='supermanager-tasks')
router.register(r'manager/projects', views.ManagerProjectViewSet, basename='manager-projects')
router.register(r'manager/tasks', views.ManagerTaskViewSet, basename='manager-tasks')
router.register(r'employee/tasks', views.EmployeeTaskViewSet, basename='employee-tasks')

urlpatterns = [
    # Add health check as the FIRST endpoint
    path('', views.HealthCheckView.as_view(), name='health-check'),
    
    # KEEP ALL YOUR EXISTING paths exactly as they are, just reorder
    path('login/', views.LoginView.as_view(), name='login'),
    path('user/', views.UserView.as_view(), name='user'),
    path('supermanager-dashboard-stats/', views.SuperManagerDashboardStats.as_view(), name='supermanager-dashboard-stats'),
    path('manager/employees/', views.ManagerEmployeeListView.as_view(), name='manager-employees'),
    path('manager-dashboard-stats/', views.ManagerDashboardStats.as_view(), name='manager-dashboard-stats'),
    path('recent-activity/', views.RecentActivityView.as_view(), name='recent-activity'),
    path('reports/', views.ReportView.as_view(), name='reports'),
    
    # Include router URLs
    path('', include(router.urls)),
    
    # KEEP the frontend catch-all route at the END
    re_path(r'^.*$', views.FrontendAppView.as_view(), name='frontend'),
]

# IMPORTANT: Make sure FrontendAppView is defined in views.py
