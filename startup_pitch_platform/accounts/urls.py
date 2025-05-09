from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .views import (
    UserRegisterView,
    UserLoginView,
    UserLogoutView,
    UserProfileViewSet,
    ConnectionViewSet,
    get_csrf_token,
)

# Create a router and register the ViewSets
router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='profile')
router.register(r'connections', ConnectionViewSet, basename='connection')

# Define urlpatterns
urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('connections/<int:connection_id>/accept/', ConnectionViewSet.accept_connection, name='accept-connection'),
    path('connections/<int:connection_id>/reject/', ConnectionViewSet.reject_connection, name='reject-connection'),
    path('csrf-token/', get_csrf_token, name='csrf-token'),  # Add CSRF token endpoint
    path('', include(router.urls)),  # Include all router-generated URLs
]
