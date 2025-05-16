from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate 
from rest_framework import serializers

class MentorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Mentor
        fields = ('email', 'name', 'password')
    
    def create(self, validated_data):
        return Mentor.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )

# mentor/serializers.py
class MentorLoginSerializer(serializers.Serializer):
    mentor_id = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        mentor_id = data.get('mentor_id')
        password = data.get('password')
        
        if mentor_id and password:
            mentor = authenticate(mentor_id=mentor_id, password=password)
            if mentor:
                if not mentor.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['mentor'] = mentor
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'mentor_id' and 'password'.")
        
        return data

# class MentorSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Mentor
#         fields = ('mentor_id', 'email', 'name','first_name')




# Serializer for Skill
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('name',)

# Serializer for Profession
class ProfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profession
        fields = ('title',)



# Serializer for MentorDetail
class MentorDetailSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    professions = ProfessionSerializer(many=True, read_only=True)

    class Meta:
        model = MentorDetail
        fields = (
            'first_name', 'last_name', 'dob', 'age', 'gender', 'email', 'phone_number',
            'college', 'cgpa', 'batch', 'professions', 'skills', 'fees', 'about',
            'availability_timings', 'profile_photo', 'cv', 'is_approved',
            'total_students', 'average_rating', 'years_of_experience',
            'linkedin_url', 'github_url', 'portfolio_url','total_students'
        )

# Serializer for MentorToken
class MentorTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorToken
        fields = ('key', 'created')

# Serializer for Earning
class EarningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Earning
        fields = (
            'amount', 'date', 'source', 'transaction_id', 'status', 'notes',
            'created_at', 'updated_at'
        )

# Serializer for MentorMessage
class MentorMessageSerializer(serializers.ModelSerializer):
    admin_sender = serializers.StringRelatedField()  # Display admin's string representation

    class Meta:
        model = MentorMessage
        fields = ('subject', 'message', 'sent_at', 'is_read', 'admin_sender','message_id')

# Serializer for Meeting
class MeetingSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()  # Display student's string representation

    class Meta:
        model = Meeting
        fields = (
            'meeting_id', 'title', 'description', 'scheduled_time', 'duration',
            'meeting_link', 'status', 'notes', 'created_at', 'updated_at', 'student'
        )

# Main Mentor Serializer
class MentorSerializer(serializers.ModelSerializer):
    details = MentorDetailSerializer(read_only=True)
    auth_token = MentorTokenSerializer(read_only=True)
    earnings = EarningSerializer(many=True, read_only=True)
    messages = MentorMessageSerializer(many=True, read_only=True)
    meetings = MeetingSerializer(many=True, read_only=True)

    class Meta:
        model = Mentor
        fields = (
            'mentor_id', 'email', 'name', 'is_staff', 'is_active', 'is_superuser',
            'details', 'auth_token', 'earnings', 'messages', 'meetings'
        )




