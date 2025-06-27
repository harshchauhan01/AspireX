from rest_framework import serializers
from .models import Student
from django.contrib.auth import authenticate 
from .models import SuccessStory
class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Student
        fields = ('email', 'name', 'password')
    
    def create(self, validated_data):
        return Student.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )



# mentor/serializers.py
class StudentLoginSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        student_id = data.get('student_id')
        password = data.get('password')
        
        if student_id and password:
            student = authenticate(student_id=student_id, password=password)
            if student:
                if not student.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['student'] = student
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'student_id' and 'password'.")
        
        return data
    
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ('student_id', 'email', 'name')
        
        
   
   
    #  this is for success story
from rest_framework import serializers
from .models import SuccessStory

class SuccessStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SuccessStory
        fields = '__all__'
        read_only_fields = ['is_approved']