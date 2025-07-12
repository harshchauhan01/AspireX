#!/usr/bin/env python
"""
Simple test script to check backend functionality
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from mentor.models import Mentor, MentorToken
from student.models import Student
from chat.models import Conversation, Message

def test_database_connection():
    """Test if database connection is working"""
    try:
        # Test if we can query the database
        mentor_count = Mentor.objects.count()
        student_count = Student.objects.count()
        conversation_count = Conversation.objects.count()
        message_count = Message.objects.count()
        
        print("✅ Database connection successful!")
        print(f"   Mentors: {mentor_count}")
        print(f"   Students: {student_count}")
        print(f"   Conversations: {conversation_count}")
        print(f"   Messages: {message_count}")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_models():
    """Test if models are working correctly"""
    try:
        # Test Mentor model
        if Mentor.objects.exists():
            mentor = Mentor.objects.first()
            print(f"✅ Mentor model working: {mentor.mentor_id}")
        
        # Test Student model
        if Student.objects.exists():
            student = Student.objects.first()
            print(f"✅ Student model working: {student.student_id}")
        
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def test_imports():
    """Test if all imports are working"""
    try:
        from rest_framework import status
        from rest_framework.test import APIClient
        from django.urls import reverse
        print("✅ All imports successful!")
        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing AspireX Backend...")
    print("=" * 40)
    
    # Run tests
    tests = [
        ("Import Test", test_imports),
        ("Database Connection", test_database_connection),
        ("Model Test", test_models),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name}...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n🎉 All tests passed! Backend is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
    
    sys.exit(0 if all_passed else 1) 