from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from mentor.models import Mentor
from student.models import Student
from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
from mentor.views import MentorTokenAuthentication
from chat.authentication import DualTokenAuthentication


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    authentication_classes = [DualTokenAuthentication]

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if isinstance(user, Mentor):
            return Conversation.objects.filter(mentor=user)
        elif isinstance(user, Student):
            return Conversation.objects.filter(student=user)
        return Conversation.objects.none()


    def perform_create(self, serializer):
        user = self.request.user
        if isinstance(user, Mentor):
            student_id = self.request.data.get('student_id')
            student = get_object_or_404(Student, student_id=student_id)
            serializer.save(mentor=user, student=student)
        elif isinstance(user, Student):
            mentor_id = self.request.data.get('mentor_id')
            mentor = get_object_or_404(Mentor, mentor_id=mentor_id)
            serializer.save(mentor=mentor, student=user)


    def create(self, request, *args, **kwargs):
        user = request.user
        if isinstance(user, Student):
            student = user
            mentor_id = request.data.get('mentor_id')
            mentor = get_object_or_404(Mentor, mentor_id=mentor_id)
        elif isinstance(user, Mentor):
            mentor = user
            student_id = request.data.get('student_id')
            student = get_object_or_404(Student, student_id=student_id)
        else:
            return Response({"detail": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Check if conversation already exists
        conversation = Conversation.objects.filter(student=student, mentor=mentor).first()

        if conversation:
            serializer = self.get_serializer(conversation, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If not exists, create new
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student, mentor=mentor)

        full_serializer = self.get_serializer(serializer.instance, context={'request': request})
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)



class MessageCreateView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_id')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        user = self.request.user

        # Determine sender type
        sender_type = 'mentor' if isinstance(user, Mentor) else 'student'

        # Save message with sender_type and conversation
        message = serializer.save(conversation=conversation, sender_type=sender_type)

        # ✅ Update conversation's last_message_time
        conversation.last_message_time = message.timestamp
        conversation.save()


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Mark unread messages as read when mentor views them
        user = self.request.user
        if isinstance(user, Mentor):
            Message.objects.filter(
                conversation=conversation,
                sender_type='student',
                read=False
            ).update(read=True)

        
        return Message.objects.filter(conversation=conversation).order_by('timestamp')
    





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from mentor.views import MentorTokenAuthentication  # your custom one
from student.models import Student
from mentor.models import Mentor


class GetUserInfoView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if isinstance(user, Mentor):
            return Response({
                "id": user.mentor_id,
                "user_type": "mentor"
            })
        elif isinstance(user, Student):
            return Response({
                "id": user.student_id,
                "user_type": "student"
            })
        return Response({"detail": "Unrecognized user"}, status=400)
