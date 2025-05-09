from django.shortcuts import get_object_or_404, render
from django.db.models import F
from rest_framework import status, permissions, viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Pitch, PitchAttachment, PitchLike, PitchComment, PitchQuestion
from .serializers import (
    PitchSerializer, PitchDetailSerializer,
    PitchAttachmentSerializer, PitchCommentSerializer, PitchQuestionSerializer
)


class IsPitchOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a pitch to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.user == request.user


class IsQuestionOwnerOrPitchOwner(permissions.BasePermission):
    """
    Custom permission to only allow pitch owners to answer questions
    and question owners to edit their questions.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Question owner can only edit the question
        if request.user == obj.user and not request.data.get('answer'):
            return True

        # Pitch owner can only answer the question
        if request.user == obj.pitch.user and request.data.get('answer'):
            return True

        return False


class PitchViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsPitchOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['funding_stage', 'status']
    search_fields = ['title', 'tagline', 'description', 'company_name']
    ordering_fields = ['created_at', 'likes_count', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        if self.request.query_params.get('user'):
            return Pitch.objects.filter(user_id=self.request.query_params.get('user'))
        elif self.request.query_params.get('status') == 'draft' and self.request.user.is_authenticated:
            return Pitch.objects.filter(user=self.request.user)
        else:
            return Pitch.objects.exclude(status='draft')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PitchDetailSerializer
        return PitchSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Increment view count if this is not the owner
        if instance.user != request.user:
            instance.views_count = F('views_count') + 1
            instance.save(update_fields=['views_count'])
            instance.refresh_from_db()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        pitch = self.get_object()
        user = request.user

        # Check if already liked
        like, created = PitchLike.objects.get_or_create(pitch=pitch, user=user)

        if created:
            # Update like count
            pitch.likes_count = F('likes_count') + 1
            pitch.save(update_fields=['likes_count'])
            pitch.refresh_from_db()
            return Response({'status': 'pitch liked'})
        else:
            return Response({'status': 'pitch already liked'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        pitch = self.get_object()
        user = request.user

        # Find and delete like
        like = get_object_or_404(PitchLike, pitch=pitch, user=user)
        like.delete()

        # Update like count
        pitch.likes_count = F('likes_count') - 1
        pitch.save(update_fields=['likes_count'])
        pitch.refresh_from_db()

        return Response({'status': 'pitch unliked'})


class PitchAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = PitchAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PitchAttachment.objects.filter(pitch__user=self.request.user)

    def perform_create(self, serializer):
        pitch_id = self.request.data.get('pitch')
        pitch = get_object_or_404(Pitch, id=pitch_id)

        # Ensure user owns the pitch
        if pitch.user != self.request.user:
            return Response(
                {'error': 'You do not have permission to add attachments to this pitch'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save(pitch=pitch)


class PitchCommentViewSet(viewsets.ModelViewSet):
    serializer_class = PitchCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsPitchOwnerOrReadOnly]

    def get_queryset(self):
        return PitchComment.objects.filter(pitch_id=self.kwargs.get('pitch_id'))

    def perform_create(self, serializer):
        pitch = get_object_or_404(Pitch, id=self.kwargs.get('pitch_id'))
        serializer.save(user=self.request.user, pitch=pitch)


class PitchQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = PitchQuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsQuestionOwnerOrPitchOwner]

    def get_queryset(self):
        return PitchQuestion.objects.filter(pitch_id=self.kwargs.get('pitch_id'))

    def perform_create(self, serializer):
        pitch = get_object_or_404(Pitch, id=self.kwargs.get('pitch_id'))
        serializer.save(user=self.request.user, pitch=pitch)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def answer(self, request, pk=None, pitch_id=None):
        question = self.get_object()

        # Ensure user is the pitch owner
        if question.pitch.user != request.user:
            return Response(
                {'error': 'Only the pitch owner can answer questions'},
                status=status.HTTP_403_FORBIDDEN
            )

        answer = request.data.get('answer')
        if not answer:
            return Response(
                {'error': 'Answer is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        question.answer = answer
        question.status = 'answered'
        question.save()

        serializer = self.get_serializer(question)
        return Response(serializer.data)
class PitchCommentViewSet(viewsets.ModelViewSet):
    serializer_class = PitchCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return PitchComment.objects.filter(pitch_id=self.kwargs['pitch_id'])

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, pitch_id=self.kwargs['pitch_id'])


class PitchQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = PitchQuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsQuestionOwnerOrPitchOwner]

    def get_queryset(self):
        return PitchQuestion.objects.filter(pitch_id=self.kwargs['pitch_id'])

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, pitch_id=self.kwargs['pitch_id'])

    @action(detail=True, methods=['post'])
    def answer(self, request, pitch_id=None, pk=None):
        question = self.get_object()
        answer = request.data.get('answer')
        if not answer:
            return Response({'error': 'Answer is required.'}, status=status.HTTP_400_BAD_REQUEST)
        question.answer = answer
        question.save()
        return Response({'status': 'Answer submitted successfully.'})


def home(request):
    return render(request, 'index.html')


def pitches_view(request):
    return render(request, 'pitches.html')



