from rest_framework import serializers
from .models import Conversation, Message
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



