from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from accounts.views import UserProfileViewSet
from pitches.views import home  # Import the home view
from startup_pitch_platform.views import *
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('pitches/', include('pitches.urls')),  # Include pitches app URLs
    path('api/accounts/', include('accounts.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('', views.home_view, name='home'),  # Home page
    path('pitches/', views.pitches_view, name='pitches'),  # Pitches page
    path('investors/', views.investors_view, name='investors'),  # Investors page
    path('about/', views.about_view, name='about'),  # About page
    path('login/', views.login_view, name='login'),  # Login page
    path('register/', views.register_view, name='register'),  # Register page
]

# Serve static and media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
