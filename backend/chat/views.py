from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Conversation, Message, ContactMessage, CustomerServiceMessage, CustomerServiceReply, Notification
from .serializers import ConversationSerializer, MessageSerializer, ContactMessageSerializer, CustomerServiceMessageSerializer, CustomerServiceReplySerializer
from mentor.models import Mentor
from student.models import Student
from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
from mentor.views import MentorTokenAuthentication
from chat.authentication import DualTokenAuthentication
from django.contrib.contenttypes.models import ContentType


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    authentication_classes = [DualTokenAuthentication]

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if isinstance(user, Mentor):
            return Conversation.objects.filter(mentor=user).select_related('student')
        elif isinstance(user, Student):
            return Conversation.objects.filter(student=user).select_related('mentor')
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


class ConversationPinView(generics.UpdateAPIView):
    serializer_class = ConversationSerializer
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if isinstance(user, Mentor):
            return Conversation.objects.filter(mentor=user)
        elif isinstance(user, Student):
            return Conversation.objects.filter(student=user)
        return Conversation.objects.none()

    def update(self, request, *args, **kwargs):
        conversation = self.get_object()
        conversation.pinned = True
        conversation.save()
        serializer = self.get_serializer(conversation, context={'request': request})
        return Response(serializer.data)


class ConversationUnpinView(generics.UpdateAPIView):
    serializer_class = ConversationSerializer
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if isinstance(user, Mentor):
            return Conversation.objects.filter(mentor=user)
        elif isinstance(user, Student):
            return Conversation.objects.filter(student=user)
        return Conversation.objects.none()

    def update(self, request, *args, **kwargs):
        conversation = self.get_object()
        conversation.pinned = False
        conversation.save()
        serializer = self.get_serializer(conversation, context={'request': request})
        return Response(serializer.data)



class MessageCreateView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('id')
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
        conversation_id = self.kwargs.get('id')
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


class ContactMessageAPIView(APIView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Message sent successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerServiceMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerServiceMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [DualTokenAuthentication]

    def get_queryset(self):
        user = self.request.user
        content_type = ContentType.objects.get_for_model(user.__class__)
        return CustomerServiceMessage.objects.filter(user_content_type=content_type, user_object_id=str(user.pk)).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user = self.request.user
        user_type = 'mentor' if hasattr(user, 'mentor_id') else 'student'
        serializer.save(user=user, user_type=user_type)

class CustomerServiceReplyCreateView(generics.CreateAPIView):
    serializer_class = CustomerServiceReplySerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = CustomerServiceReply.objects.all()

    def perform_create(self, serializer):
        message_id = self.request.data.get('message_id')
        message = CustomerServiceMessage.objects.get(id=message_id)
        replied_by = self.request.user.username if self.request.user.is_staff else 'admin'
        serializer.save(message=message, replied_by=replied_by)
        CustomerServiceMessage.objects.filter(id=message_id).update(is_resolved=True)

class CustomerServiceMessageAdminListView(generics.ListAPIView):
    serializer_class = CustomerServiceMessageSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = CustomerServiceMessage.objects.all().order_by('-created_at')


class UserNotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if hasattr(user, 'student_id'):
            notifications = Notification.objects.filter(
                recipient_type='student',
                recipient_formal_id=user.student_id
            ).order_by('-created_at')
        elif hasattr(user, 'mentor_id'):
            notifications = Notification.objects.filter(
                recipient_type='mentor',
                recipient_formal_id=user.mentor_id
            ).order_by('-created_at')
        else:
            return Response({'detail': 'Unknown user type'}, status=400)
        data = [
            {
                'id': n.id,
                'message': n.message,
                'created_at': n.created_at,
                'is_email_sent': n.is_email_sent,
            }
            for n in notifications
        ]
        return Response(data)



