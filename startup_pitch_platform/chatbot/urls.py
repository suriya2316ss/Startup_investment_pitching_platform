from django.urls import path
from . import views
from . import consumers

urlpatterns = [
    path('message/', views.ChatbotAPI.as_view(), name='chatbot_message'),
    path('sessions/', views.ChatSessionView.as_view(), name='chat_sessions'),
    path('sessions/<str:session_id>/', views.ChatSessionView.as_view(), name='chat_session_detail'),
]
