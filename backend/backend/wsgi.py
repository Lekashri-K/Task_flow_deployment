"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()

# Add CORS headers at WSGI level as backup
def cors_application(environ, start_response):
    # Add CORS headers
    def cors_start_response(status, headers, exc_info=None):
        headers.append(('Access-Control-Allow-Origin', '*'))
        headers.append(('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'))
        headers.append(('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With'))
        headers.append(('Access-Control-Max-Age', '86400'))
        return start_response(status, headers, exc_info)
    
    return application(environ, cors_start_response)

# Use the CORS-wrapped application
application = cors_application
