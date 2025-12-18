# backend/urls.py (main project urls)

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),  # All your API endpoints under /api/
]
