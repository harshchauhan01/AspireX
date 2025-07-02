from django.shortcuts import render

# Create your views here.
# chat/views.py
from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from rest_framework.permissions import IsAuthenticated

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['other_user_id']
        return Message.objects.filter(
            sender__id__in=[user.id, other_user_id],
            receiver__id__in=[user.id, other_user_id]
        )
