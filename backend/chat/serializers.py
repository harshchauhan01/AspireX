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
    mentor = serializers.PrimaryKeyRelatedField(read_only=True)   # 🔧 Add this
    student = serializers.PrimaryKeyRelatedField(read_only=True)  # 🔧 And this
    messages = MessageSerializer(many=True, read_only=True)
    other_person_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'mentor', 'student', 'created_at', 'updated_at', 'messages', 'other_person_name']
    
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



