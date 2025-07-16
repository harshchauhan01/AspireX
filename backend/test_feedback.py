#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from student.models import Student, Feedback
from mentor.models import Mentor, Meeting
from django.utils import timezone

def test_feedback_api():
    # Create test data
    try:
        # Get or create a student
        student, created = Student.objects.get_or_create(
            student_id='S000001',
            defaults={
                'email': 'test@student.com',
                'name': 'Test Student'
            }
        )
        
        # Get or create a mentor
        mentor, created = Mentor.objects.get_or_create(
            mentor_id='M000001',
            defaults={
                'email': 'test@mentor.com',
                'name': 'Test Mentor'
            }
        )
        
        # Create a test meeting
        meeting = Meeting.objects.create(
            mentor=mentor,
            student=student,
            title='Test Meeting',
            description='Test meeting for feedback',
            scheduled_time=timezone.now(),
            duration=60,
            status='completed'
        )
        
        # Create API client
        client = APIClient()
        
        # Test data
        test_data = {
            'mentor_id': mentor.mentor_id,
            'meeting_id': meeting.meeting_id,
            'rating': 5,
            'feedback_text': 'Great session!'
        }
        
        print("Test data:", test_data)
        
        # Make the API request
        response = client.post('/api/student/feedback/', test_data, format='json')
        
        print("Response status:", response.status_code)
        print("Response data:", response.data)
        
        if response.status_code == 201:
            print("✅ Feedback created successfully!")
        else:
            print("❌ Error creating feedback")
            print("Error details:", response.data)
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_feedback_api() 