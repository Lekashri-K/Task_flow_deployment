from django.contrib import admin
from django.urls import path, include, re_path
from tasks.views import FrontendAppView  # import the new view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),

    # Catch-all for React frontend
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
