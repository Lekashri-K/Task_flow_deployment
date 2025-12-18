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
    # 1. Admin Panel
    path('admin/', admin.site.urls),
    
    # 2. All API endpoints (Tasks, Login, etc.)
    # All routes inside tasks.urls should NOT have 'api/' prefix inside them
    # because it is defined here.
    path('api/', include('tasks.urls')),
]

# 3. Serve static files (CSS, JS, Images)
# This MUST come before the catch-all re_path
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# 4. The Catch-all route for React
# This sends any URL that doesn't match the above to the React FrontendAppView
urlpatterns += [
    re_path(r'^.*$', FrontendAppView.as_view(), name='frontend'),
]
