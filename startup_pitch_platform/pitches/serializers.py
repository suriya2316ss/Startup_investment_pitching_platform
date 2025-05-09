from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Pitch, PitchAttachment, PitchLike, PitchComment, PitchQuestion
from accounts.serializers import UserSerializer


class PitchAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PitchAttachment
        fields = ('id', 'title', 'file', 'file_type', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class PitchCommentSerializer(serializers.ModelSerializer):
    user_data = UserSerializer(source='user', read_only=True)

    class Meta:
        model = PitchComment
        fields = ('id', 'pitch', 'user', 'user_data', 'content', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PitchQuestionSerializer(serializers.ModelSerializer):
    user_data = UserSerializer(source='user', read_only=True)

    class Meta:
        model = PitchQuestion
        fields = ('id', 'pitch', 'user', 'user_data', 'question', 'answer', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PitchSerializer(serializers.ModelSerializer):
    attachments = PitchAttachmentSerializer(many=True, read_only=True)
    user_data = UserSerializer(source='user', read_only=True)
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Pitch
        fields = (
            'id', 'user', 'user_data', 'title', 'tagline', 'description',
            'company_name', 'logo', 'cover_image', 'website', 'video_url',
            'problem', 'solution', 'business_model', 'market_size', 'competition', 'traction',
            'funding_stage', 'funding_amount', 'valuation', 'revenue', 'revenue_model',
            'status', 'views_count', 'likes_count', 'attachments', 'liked_by_user',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'views_count', 'likes_count', 'created_at', 'updated_at')

    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PitchLike.objects.filter(pitch=obj, user=request.user).exists()
        return False

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PitchDetailSerializer(PitchSerializer):
    comments = PitchCommentSerializer(many=True, read_only=True)
    questions = PitchQuestionSerializer(many=True, read_only=True)

    class Meta(PitchSerializer.Meta):
        fields = PitchSerializer.Meta.fields + ('comments', 'questions')
