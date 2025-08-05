from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate 
from rest_framework import serializers
from student.models import Student, Feedback

class MentorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    accepted_terms = serializers.BooleanField(write_only=True)
    
    class Meta:
        model = Mentor
        fields = ('email', 'name', 'password', 'accepted_terms')
    
    def validate_password(self, value):
        from django.core.exceptions import ValidationError
        from django.contrib.auth.password_validation import validate_password
        if not isinstance(value, str):
            raise serializers.ValidationError("Password must be a string.")
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
    
    def create(self, validated_data):
        accepted_terms = validated_data.pop('accepted_terms', False)
        mentor = Mentor.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            accepted_terms=accepted_terms
        )
        return mentor

# mentor/serializers.py
class MentorLoginSerializer(serializers.Serializer):
    mentor_id = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        mentor_id = data.get('mentor_id')
        password = data.get('password')
        if not isinstance(password, str):
            raise serializers.ValidationError({"password": "Password must be a string."})
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
    
    def to_internal_value(self, data):
        if isinstance(data, dict):
            name = data.get('name')
        else:
            name = data
        skill, _ = Skill.objects.get_or_create(name=name)
        return skill

# Serializer for Profession
class ProfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profession
        fields = ('title',)

    def to_internal_value(self, data):
        if isinstance(data, dict):
            title = data.get('title')
        else:
            title = data
        profession, _ = Profession.objects.get_or_create(title=title)
        return profession



# Serializer for MentorDetail
class MentorDetailSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)
    professions = ProfessionSerializer(many=True)
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = MentorDetail
        fields = (
            'first_name', 'last_name', 'dob', 'age', 'gender', 'email', 'phone_number',
            'college', 'cgpa', 'batch', 'professions', 'skills', 'fees', 'about',
            'availability_timings', 'profile_photo', 'cv', 'is_approved', 'total_students',
            'total_sessions', 'average_rating', 'years_of_experience', 'linkedin_url',
            'github_url', 'portfolio_url', 'key_achievements', 'services', 'availability_day_wise', 'languages', 'is_online'
        )

    def get_is_online(self, obj):
        return obj.mentor.is_currently_online()

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
    details = MentorDetailSerializer()
    auth_token = MentorTokenSerializer(read_only=True)
    earnings = EarningSerializer(many=True, read_only=True)
    messages = MentorMessageSerializer(many=True, read_only=True)
    meetings = MeetingSerializer(many=True, read_only=True)
    feedback_count = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = (
            'mentor_id', 'email', 'name', 'is_staff', 'is_active', 'is_superuser',
            'details', 'auth_token', 'earnings', 'messages', 'meetings', 'feedback_count'
        )
    
    def get_feedback_count(self, obj):
        from student.models import Feedback
        return Feedback.objects.filter(mentor=obj, is_approved=True).count()

    def update(self, instance, validated_data):
        details_data = validated_data.pop('details', {})

        # Update mentor fields (name, email, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update MentorDetails fields
        mentor_details = instance.details
        skills_data = details_data.pop('skills', [])
        professions_data = details_data.pop('professions', [])

        # Update simple fields
        for attr, value in details_data.items():
            setattr(mentor_details, attr, value)
        mentor_details.save()

        # Update ManyToMany: skills and professions
        if skills_data:
            skill_objs = []
            for skill in skills_data:
                if isinstance(skill, Skill):
                    obj = skill
                else:
                    obj, _ = Skill.objects.get_or_create(name=skill.get('name'))
                skill_objs.append(obj)
            mentor_details.skills.set(skill_objs)


        if professions_data:
            profession_objs = []
            for prof in professions_data:
                if isinstance(prof, Profession):
                    obj = prof
                else:
                    obj, _ = Profession.objects.get_or_create(title=prof.get('title'))
                profession_objs.append(obj)
            mentor_details.professions.set(profession_objs)


        return instance






class MentorNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorNote
        fields = ['id', 'mentor', 'title', 'content', 'created_at']
        read_only_fields = ['id', 'created_at', 'mentor']

class MentorFeedbackSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    meeting_title = serializers.CharField(source='meeting.title', read_only=True)
    meeting_id = serializers.CharField(source='meeting.meeting_id', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    
    class Meta:
        model = Feedback  # Import Feedback model from student app
        fields = [
            'id', 'student_name', 'student_id', 'meeting_title', 'meeting_id',
            'rating', 'rating_display', 'feedback_text', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = [
            'id', 'mentor', 'amount', 'request_date', 'processed_date', 
            'status', 'payment_method', 'bank_details', 'admin_notes', 
            'transaction_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'request_date', 'processed_date', 'transaction_id', 'created_at', 'updated_at', 'mentor']


class PublicMentorSerializer(serializers.ModelSerializer):
    details = MentorDetailSerializer()
    feedback_count = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Mentor
        fields = (
            'mentor_id', 'email', 'name', 'details', 'feedback_count', 'reviews'
        )

    def get_feedback_count(self, obj):
        from student.models import Feedback
        return Feedback.objects.filter(mentor=obj, is_approved=True).count()

    def get_reviews(self, obj):
        from student.models import Feedback
        feedbacks = Feedback.objects.filter(mentor=obj, is_approved=True).order_by('-created_at')[:10]
        return [
            {
                'id': feedback.id,
                'student_name': feedback.student.name,
                'student_role': feedback.student.details.college if hasattr(feedback.student, 'details') and feedback.student.details else 'Student',
                'rating': feedback.rating,
                'feedback_text': feedback.feedback_text,
                'created_at': feedback.created_at.isoformat() if feedback.created_at else None
            }
            for feedback in feedbacks
        ]