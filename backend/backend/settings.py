
# import os
# from pathlib import Path
# from datetime import timedelta

# # Build paths inside the project
# BASE_DIR = Path(__file__).resolve().parent.parent

# # SECURITY
# SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-change-this')
# DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# # On Render, specify your domain. 
# # Using '*' is okay for testing but specific is better.
# ALLOWED_HOSTS = ['task-flow-deployment.onrender.com', 'localhost', '127.0.0.1']

# # Application definition
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',
#     'tasks',
#     'rest_framework',
#     'rest_framework_simplejwt',
#     'corsheaders',
#     'whitenoise.runserver_nostatic', # Optional: helps in local dev
# ]

# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'whitenoise.middleware.WhiteNoiseMiddleware',  # MUST be after SecurityMiddleware
#     'corsheaders.middleware.CorsMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]

# ROOT_URLCONF = 'backend.urls'

# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',
#         # Look for index.html in your build folder
#         'DIRS': [os.path.join(BASE_DIR, 'frontend_build')],
#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]

# WSGI_APPLICATION = 'backend.wsgi.application'

# # Database (SQLite for demo/Render)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# # Internationalization
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True

# AUTH_USER_MODEL = 'tasks.CustomUser'

# # REST Framework
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ],
# }

# SIMPLE_JWT = {
#     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
#     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
#     'ROTATE_REFRESH_TOKENS': False,
#     'ALGORITHM': 'HS256',
#     'SIGNING_KEY': SECRET_KEY,
#     'AUTH_HEADER_TYPES': ('Bearer',),
# }

# # CORS - Allow everything for demo or restrict to your render URL
# CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOW_CREDENTIALS = True

# # CSRF - Critical for Render login
# CSRF_TRUSTED_ORIGINS = [
#     "https://task-flow-deployment.onrender.com",
# ]

# # STATIC FILES CONFIGURATION
# STATIC_URL = '/static/'

# # 1. Where collectstatic will put all files for Render to serve
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# # 2. Where Django looks for additional static files (your React build)
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'frontend_build', 'static'),
# ]

# # 3. Use WhiteNoise to serve compressed/cached files
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# # Security settings for Render production
# if not DEBUG:
#     SECURE_SSL_REDIRECT = True
#     SESSION_COOKIE_SECURE = True
#     CSRF_COOKIE_SECURE = True
import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project
# This assumes settings.py is in backend/backend/settings.py
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-4uh2u-5nbjl$dldev*2z3e+o7*8+b+&km71#^@xmg8f!5auw*_')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# On Render, specify your domain for security
ALLOWED_HOSTS = ['task-flow-deployment.onrender.com', 'localhost', '127.0.0.1', '*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'tasks',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # MUST stay right here
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # Where index.html is located
        'DIRS': [os.path.join(BASE_DIR, 'frontend_build')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database (Using SQLite as per your request)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom user model
AUTH_USER_MODEL = 'tasks.CustomUser'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# This configuration is the fix for the MIME type error
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_DIRS = [
    # This points to the static folder inside your React build
    os.path.join(BASE_DIR, 'frontend_build', 'static'),
]

# Use WhiteNoise to serve compressed/cached static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Fix for SPA (Single Page Application) routing
WHITENOISE_INDEX_FILE = True

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# CSRF Settings - Required for Django on Render (HTTPS)
CSRF_TRUSTED_ORIGINS = [
    "https://task-flow-deployment.onrender.com",
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Production Security
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
