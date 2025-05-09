import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import ChatSession, ChatMessage
from openai import OpenAI


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        # Get or create chat session
        chat_session = await self.get_or_create_session()

        # Send chat history
        messages = await self.get_chat_history(chat_session)
        for message in messages:
            await self.send(text_data=json.dumps({
                'role': message.role,
                'content': message.content,
                'timestamp': message.timestamp.isoformat()
            }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')

        if not message:
            await self.send(text_data=json.dumps({
                'error': 'Message is required'
            }))
            return

        # Get chat session
        chat_session = await self.get_or_create_session()

        # Save user message
        await self.save_message(chat_session, 'user', message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'role': 'user',
                'content': message
            }
        )

        # Get AI response
        try:
            ai_response = await self.get_ai_response(chat_session)

            # Save AI message
            await self.save_message(chat_session, 'assistant', ai_response)

            # Send AI response to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'role': 'assistant',
                    'content': ai_response
                }
            )
        except Exception as e:
            # Send error message
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'role': 'system',
                    'content': f"Error: {str(e)}"
                }
            )

    async def chat_message(self, event):
        role = event['role']
        content = event['content']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'role': role,
            'content': content
        }))

    @database_sync_to_async
    def get_or_create_session(self):
        user = self.scope.get('user', None)
        user_instance = None

        if user and user.is_authenticated:
            user_instance = user

        # Try to get existing session
        try:
            return ChatSession.objects.get(session_id=self.session_id)
        except ChatSession.DoesNotExist:
            # Create new session
            return ChatSession.objects.create(
                session_id=self.session_id,
                user=user_instance
            )

    @database_sync_to_async
    def get_chat_history(self, chat_session):
        return list(chat_session.messages.all())

    @database_sync_to_async
    def save_message(self, chat_session, role, content):
        return ChatMessage.objects.create(
            session=chat_session,
            role=role,
            content=content
        )

    @database_sync_to_async
    def get_ai_response(self, chat_session):
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

        # Use GPT to generate a response
        client = OpenAI(api_key="your-openai-api-key")  # Replace with your API key or environment variable

        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        ai_message = response.choices[0].message.content
        return ai_message
