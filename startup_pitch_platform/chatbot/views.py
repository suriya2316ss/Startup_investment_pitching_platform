import json
import uuid
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

import openai
from openai import OpenAI

from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer


class ChatbotAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        session_id = request.data.get('session_id')
        message = request.data.get('message')

        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create chat session
        if session_id:
            try:
                chat_session = ChatSession.objects.get(session_id=session_id)
            except ChatSession.DoesNotExist:
                chat_session = ChatSession.objects.create(
                    session_id=session_id,
                    user=request.user if request.user.is_authenticated else None
                )
        else:
            session_id = str(uuid.uuid4())
            chat_session = ChatSession.objects.create(
                session_id=session_id,
                user=request.user if request.user.is_authenticated else None
            )

        # Save user message
        ChatMessage.objects.create(
            session=chat_session,
            role='user',
            content=message
        )

        # Get conversation history
        messages = []

        # Add system message for context
        messages.append({
            "role": "system",
            "content": "You are an AI assistant for a startup investment platform. Help users with questions about startups, investment, pitching, and provide guidance on fundraising, business models, and investor relations."
        })

        # Add conversation history
        for msg in chat_session.messages.all():
            messages.append({
                "role": msg.role,
                "content": msg.content
            })

        try:
            # Use GPT to generate a response
            client = OpenAI(api_key="your-openai-api-key")  # Replace with your API key or environment variable

            response = client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            ai_message = response.choices[0].message.content

            # Save assistant message
            ChatMessage.objects.create(
                session=chat_session,
                role='assistant',
                content=ai_message
            )

            return Response({
                'session_id': session_id,
                'message': ai_message
            })

        except Exception as e:
            # Fallback response if API fails
            fallback_message = "I'm sorry, I'm having trouble connecting to my knowledge base at the moment. Please try again in a moment."

            # Save fallback message
            ChatMessage.objects.create(
                session=chat_session,
                role='assistant',
                content=fallback_message
            )

            return Response({
                'session_id': session_id,
                'message': fallback_message,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id=None):
        if session_id:
            try:
                session = ChatSession.objects.get(session_id=session_id)
                serializer = ChatSessionSerializer(session)
                return Response(serializer.data)
            except ChatSession.DoesNotExist:
                return Response({'error': 'Chat session not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            if request.user.is_authenticated:
                sessions = ChatSession.objects.filter(user=request.user)
                serializer = ChatSessionSerializer(sessions, many=True)
                return Response(serializer.data)
            else:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
