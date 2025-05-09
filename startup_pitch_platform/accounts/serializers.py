from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Connection


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'date_joined')
        read_only_fields = ('id', 'date_joined')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'user_type', 'bio', 'profile_picture',
                  'linkedin_url', 'twitter_url', 'website', 'company_name',
                  'position', 'investment_focus', 'investment_range_min',
                  'investment_range_max', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class ConnectionSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Connection
        fields = ('id', 'sender', 'receiver', 'sender_name', 'receiver_name', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'sender', 'status', 'created_at', 'updated_at')
