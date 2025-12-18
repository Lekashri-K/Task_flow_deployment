from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'supermanager/users', views.SuperManagerUserViewSet, basename='supermanager-users')
router.register(r'supermanager/projects', views.SuperManagerProjectViewSet, basename='supermanager-projects')
router.register(r'supermanager/tasks', views.SuperManagerTaskViewSet, basename='supermanager-tasks')
router.register(r'manager/projects', views.ManagerProjectViewSet, basename='manager-projects')
router.register(r'manager/tasks', views.ManagerTaskViewSet, basename='manager-tasks')
router.register(r'employee/tasks', views.EmployeeTaskViewSet, basename='employee-tasks')

urlpatterns = [
    # Public endpoints
    path('', views.HealthCheckView.as_view(), name='health-check'),
    path('login/', views.LoginView.as_view(), name='login'),
    
    # Protected endpoints
    path('user/', views.UserView.as_view(), name='user'),
    path('supermanager-dashboard-stats/', views.SuperManagerDashboardStats.as_view(), name='supermanager-dashboard-stats'),
    path('manager/employees/', views.ManagerEmployeeListView.as_view(), name='manager-employees'),
    path('manager-dashboard-stats/', views.ManagerDashboardStats.as_view(), name='manager-dashboard-stats'),
    path('recent-activity/', views.RecentActivityView.as_view(), name='recent-activity'),
    path('reports/', views.ReportView.as_view(), name='reports'),
    path('', include(router.urls)),
]

# IMPORTANT: This catch-all should ONLY be in the main urls.py, not here
