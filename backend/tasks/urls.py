from django.urls import path, include
from rest_framework.permissions import AllowAny
from .views import (
    LoginView, UserView, SuperManagerDashboardStats,
    SuperManagerUserViewSet, SuperManagerProjectViewSet,
    SuperManagerTaskViewSet, RecentActivityView,
    ManagerProjectViewSet, ManagerTaskViewSet,
    ManagerEmployeeListView, ManagerDashboardStats,
    EmployeeTaskViewSet, ReportView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'supermanager/users', SuperManagerUserViewSet, basename='supermanager-users')
router.register(r'supermanager/projects', SuperManagerProjectViewSet, basename='supermanager-projects')
router.register(r'supermanager/tasks', SuperManagerTaskViewSet, basename='supermanager-tasks')
router.register(r'manager/projects', ManagerProjectViewSet, basename='manager-projects')
router.register(r'manager/tasks', ManagerTaskViewSet, basename='manager-tasks')
router.register(r'employee/tasks', EmployeeTaskViewSet, basename='employee-tasks')

urlpatterns = [
    # Authentication
    path('login/', LoginView.as_view(permission_classes=[AllowAny]), name='login'),
    path('user/', UserView.as_view(), name='user'),
    
    # Dashboard stats
    path('supermanager-dashboard-stats/', SuperManagerDashboardStats.as_view(), name='supermanager-dashboard-stats'),
    path('manager-dashboard-stats/', ManagerDashboardStats.as_view(), name='manager-dashboard-stats'),
    
    # Manager endpoints
    path('manager/employees/', ManagerEmployeeListView.as_view(), name='manager-employees'),
    
    # Activity & Reports
    path('recent-activity/', RecentActivityView.as_view(), name='recent-activity'),
    path('reports/', ReportView.as_view(), name='reports'),
    
    # API routes
    path('', include(router.urls)),
]
