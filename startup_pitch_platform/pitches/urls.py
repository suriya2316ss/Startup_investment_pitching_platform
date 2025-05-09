from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404, render
from django.urls import path, include
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter

from .models import Pitch, PitchAttachment, PitchComment, PitchQuestion
from .serializers import (
    PitchSerializer,
    PitchAttachmentSerializer,
    PitchCommentSerializer,
    PitchQuestionSerializer
)
from .views import pitches_view  # Ensure views are correctly imported


class PitchViewSet(viewsets.ModelViewSet):
    queryset = Pitch.objects.all()
    serializer_class = PitchSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PitchAttachmentViewSet(viewsets.ModelViewSet):
    queryset = PitchAttachment.objects.all()
    serializer_class = PitchAttachmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PitchCommentViewSet(viewsets.ModelViewSet):
    serializer_class = PitchCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        pitch_id = self.kwargs['pitch_id']
        return PitchComment.objects.filter(pitch_id=pitch_id)

    def perform_create(self, serializer):
        pitch_id = self.kwargs['pitch_id']
        pitch = get_object_or_404(Pitch, id=pitch_id)
        serializer.save(pitch=pitch, user=self.request.user)


class PitchQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = PitchQuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        pitch_id = self.kwargs['pitch_id']
        return PitchQuestion.objects.filter(pitch_id=pitch_id)

    def perform_create(self, serializer):
        pitch_id = self.kwargs['pitch_id']
        pitch = get_object_or_404(Pitch, id=pitch_id)
        serializer.save(pitch=pitch, user=self.request.user)

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        question = self.get_object()
        answer = request.data.get('answer')

        if not answer:
            return Response({'error': 'Answer is required.'}, status=status.HTTP_400_BAD_REQUEST)

        question.answer = answer
        question.save()
        return Response({'status': 'Answer saved successfully'})


def home(request):
    return render(request, 'index.html')


# Router for ViewSets
router = DefaultRouter()
router.register(r'pitches', PitchViewSet, basename='pitch')
router.register(r'attachments', PitchAttachmentViewSet, basename='pitch-attachment')
router.register(r'pitches/(?P<pitch_id>[^/.]+)/comments', PitchCommentViewSet, basename='pitch-comment')
router.register(r'pitches/(?P<pitch_id>[^/.]+)/questions', PitchQuestionViewSet, basename='pitch-question')

# URL Patterns
urlpatterns = [
    path('', pitches_view, name='pitches'),  # Render pitches.html
]





