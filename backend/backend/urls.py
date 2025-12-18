# from django.contrib import admin
# from django.urls import path, include, re_path
# from django.conf import settings
# from django.conf.urls.static import static
# from tasks.views import FrontendAppView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include('tasks.urls')),  # All API endpoints
    
#     # Catch-all route for React frontend - MUST BE LAST
#     re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from tasks.views import FrontendAppView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
]

# Serve static files in both development and production.
# This line must come BEFORE the catch-all route.
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# The catch-all route for React MUST BE LAST.
urlpatterns += [
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
