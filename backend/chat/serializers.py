from rest_framework import serializers
from .models import Conversation, Message, ContactMessage, CustomerServiceMessage, CustomerServiceReply
from mentor.models import Mentor
from student.models import Student

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender_type', 'content', 'timestamp', 'read']
        read_only_fields = ['id', 'sender_type', 'timestamp', 'read']

class ConversationSerializer(serializers.ModelSerializer):
    mentor = serializers.PrimaryKeyRelatedField(read_only=True)
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    other_person_name = serializers.SerializerMethodField()
    other_user_id = serializers.SerializerMethodField()
    other_user_type = serializers.SerializerMethodField()
    last_message_content = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'mentor', 'student', 'created_at', 'updated_at', 'messages', 'other_person_name', 'other_user_id', 'other_user_type', 'pinned', 'last_message_content', 'last_message_time']
    
    def get_other_person_name(self, obj):
        request = self.context.get('request')
        user = request.user if request else None

        if not isinstance(obj, Conversation) or not user:
            return "Unknown"

        if isinstance(user, Mentor):
            return getattr(obj.student, 'name', 'Student')
        elif isinstance(user, Student):
            return getattr(obj.mentor, 'name', 'Mentor')
        
        return "Unknown"
    
    def get_other_user_id(self, obj):
        request = self.context.get('request')
        user = request.user if request else None

        if not isinstance(obj, Conversation) or not user:
            return None

        if isinstance(user, Mentor):
            # Access the actual Student instance
            student = obj.student
            return student.student_id if student else None
        elif isinstance(user, Student):
            # Access the actual Mentor instance
            mentor = obj.mentor
            return mentor.mentor_id if mentor else None
        
        return None
    
    def get_other_user_type(self, obj):
        request = self.context.get('request')
        user = request.user if request else None

        if not isinstance(obj, Conversation) or not user:
            return None

        if isinstance(user, Mentor):
            return 'student'
        elif isinstance(user, Student):
            return 'mentor'
        
        return None

    def get_last_message_content(self, obj):
        last_message = obj.messages.last()
        return last_message.content if last_message else None

    def get_last_message_time(self, obj):
        last_message = obj.messages.last()
        return last_message.timestamp if last_message else None

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'query', 'created_at']

class CustomerServiceReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerServiceReply
        fields = ['id', 'reply', 'replied_by', 'created_at']
        read_only_fields = ['id', 'created_at']

class CustomerServiceMessageSerializer(serializers.ModelSerializer):
    replies = CustomerServiceReplySerializer(many=True, read_only=True)
    user_type = serializers.CharField(read_only=True)
    user_object_id = serializers.CharField(read_only=True)
    user_content_type = serializers.CharField(read_only=True)
    class Meta:
        model = CustomerServiceMessage
        fields = ['id', 'user_type', 'user_content_type', 'user_object_id', 'subject', 'message', 'is_resolved', 'created_at', 'replies']
        read_only_fields = ['id', 'created_at', 'replies', 'is_resolved', 'user_type', 'user_content_type', 'user_object_id']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        from django.contrib.contenttypes.models import ContentType
        if hasattr(user, 'mentor_id'):
            user_type = 'mentor'
        else:
            user_type = 'student'
        content_type = ContentType.objects.get_for_model(user.__class__)
        validated_data['user_type'] = user_type
        validated_data['user_content_type'] = content_type
        validated_data['user_object_id'] = str(user.pk)
        return super().create(validated_data)



