from rest_framework import serializers
from .models import Student
from django.contrib.auth import authenticate 

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
from django.contrib.auth import authenticate

class StudentLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            student = authenticate(username=email, password=password)  # default `username` param maps to `email` in custom user
            if student:
                if not student.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['student'] = student
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")
        
        return data

    
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ('student_id', 'email', 'name')