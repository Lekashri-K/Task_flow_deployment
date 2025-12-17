from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
import time
from tasks.views import FrontendAppView

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': time.time(),
        'service': 'django'
    })

def cors_test(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'CORS test endpoint',
        'method': request.method
    })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Test endpoints
    path('health/', health_check, name='health'),
    path('cors-test/', cors_test, name='cors-test'),
    
    # API endpoints under /api/
    path('api/', include('tasks.urls')),
    
    # Frontend catch-all (MUST BE LAST)
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
