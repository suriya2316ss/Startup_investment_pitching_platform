from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.urls import path, include

from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.routers import DefaultRouter

from .models import UserProfile, Connection
from .serializers import UserProfileSerializer, UserSerializer, ConnectionSerializer


# User Registration API
class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_serializer = UserSerializer(data=request.data)

        if user_serializer.is_valid():
            user = user_serializer.save()

            profile_data = {
                'user_type': request.data.get('user_type', 'entrepreneur'),
                'bio': request.data.get('bio', ''),
            }

            profile = user.profile
            profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)

            if profile_serializer.is_valid():
                profile_serializer.save()

                return Response({
                    'user': user_serializer.data,
                    'profile': profile_serializer.data,
                    'message': 'User registered successfully'
                }, status=status.HTTP_201_CREATED)

            user.delete()
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# User Login API
class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# User Logout API
class UserLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


# User Profile View
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


# User Connection View
class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_connection(self, request, pk=None):
        connection = self.get_object()
        # Add logic to accept the connection
        return Response({'message': f'Connection {pk} accepted.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_connection(self, request, pk=None):
        connection = self.get_object()
        # Add logic to reject the connection
        return Response({'message': f'Connection {pk} rejected.'}, status=status.HTTP_200_OK)


# CSRF Token API
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user-profile')

urlpatterns = [
    path('api/', include(router.urls)),
]


