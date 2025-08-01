import requests
import json
import pytest
from django.utils import timezone
from datetime import timedelta
from backend.student.models import Booking, Student
from backend.mentor.models import Mentor, Meeting

def test_dashboard_feedback():
    print("Testing Feedback Duplicate Prevention in Dashboard and Sessions")
    print("=" * 60)
    
    url = "http://localhost:8000/api/student/feedback/"
    
    data = {
        'mentor_id': 'M000001',
        'meeting_id': 'MTG-250712-19E2',
        'rating': 5,
        'feedback_text': 'Test feedback for dashboard duplicate prevention'
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        print("1. First feedback submission:")
        response1 = requests.post(url, json=data, headers=headers)
        print(f"   Status Code: {response1.status_code}")
        
        if response1.status_code == 201:
            print("   ✅ SUCCESS: First feedback submitted successfully!")
        else:
            print(f"   ❌ FAILED: {response1.text}")
            return
        
        print("\n2. Second feedback submission (should fail):")
        response2 = requests.post(url, json=data, headers=headers)
        print(f"   Status Code: {response2.status_code}")
        print(f"   Response: {response2.text}")
        
        if response2.status_code == 400:
            print("   ✅ SUCCESS: Duplicate feedback correctly prevented!")
        else:
            print("   ❌ FAILED: Duplicate feedback was not prevented")
        
        print("\n3. Testing feedback status check endpoint:")
        check_url = f"http://localhost:8000/api/student/feedback/check/{data['meeting_id']}/"
        response3 = requests.get(check_url, headers=headers)
        print(f"   Status Code: {response3.status_code}")
        print(f"   Response: {response3.text}")
        
        if response3.status_code == 200:
            print("   ✅ SUCCESS: Feedback status check working!")
        else:
            print("   ❌ FAILED: Feedback status check not working")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Make sure the Django server is running on localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")

@pytest.mark.django_db
def test_meeting_booking_creates_jitsi_link():
    # Create test student and mentor
    student = Student.objects.create(student_id='teststudent', email='teststudent@example.com', name='Test Student', password='testpass')
    mentor = Mentor.objects.create(mentor_id='testmentor', email='testmentor@example.com', name='Test Mentor', password='testpass')

    # Book a meeting 5 minutes from now
    booking = Booking.objects.create(
        student=student,
        mentor=mentor,
        subject='Test Subject',
        time_slot=(timezone.now() + timedelta(minutes=5)).strftime('%Y-%m-%d %H:%M'),
        is_paid=True
    )

    # Meeting should be created automatically by signal
    meeting = Meeting.objects.filter(student=student, mentor=mentor, title='Test Subject').first()
    assert meeting is not None, 'Meeting was not created.'
    assert meeting.meeting_link.startswith('https://meet.jit.si/'), f'Meeting link is not a Jitsi link: {meeting.meeting_link}'
    assert 'your-meeting-platform.com' not in meeting.meeting_link, 'Old placeholder link was used.'
    print('Meeting created:', meeting.meeting_link)

if __name__ == "__main__":
    test_dashboard_feedback() 