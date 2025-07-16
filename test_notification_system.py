#!/usr/bin/env python
"""
Test script to verify the notification system is working
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from student.models import Student, StudentMessage
from mentor.models import Mentor, MentorMessage

def test_notification_system():
    print("🧪 Testing Notification System...")
    
    # Check if admin user exists (using Student model since it's the AUTH_USER_MODEL)
    admin_user = Student.objects.filter(is_superuser=True).first()
    if admin_user:
        print(f"✅ Admin user found: {admin_user.name}")
    else:
        print("❌ No admin user found")
        return
    
    # Check existing messages
    student_messages = StudentMessage.objects.all()
    mentor_messages = MentorMessage.objects.all()
    
    print(f"📧 Current Student Messages: {student_messages.count()}")
    print(f"📧 Current Mentor Messages: {mentor_messages.count()}")
    
    # List recent messages
    if student_messages.exists():
        print("\n📨 Recent Student Messages:")
        for msg in student_messages[:3]:
            print(f"  - To: {msg.student.name} | Subject: {msg.subject} | Read: {msg.is_read}")
    
    if mentor_messages.exists():
        print("\n📨 Recent Mentor Messages:")
        for msg in mentor_messages[:3]:
            print(f"  - To: {msg.mentor.name} | Subject: {msg.subject} | Read: {msg.is_read}")
    
    # Check if signals are properly connected
    print("\n🔍 Checking signal connections...")
    
    # Try to create a test student to trigger the signal
    try:
        print("  Creating test student...")
        test_student = Student.objects.create(
            email='test@example.com',
            name='Test Student',
            password='testpass123'
        )
        print(f"  ✅ Test student created: {test_student.name}")
        
        # Check if welcome message was created
        print("  Checking for welcome message...")
        welcome_msg = StudentMessage.objects.filter(
            student=test_student,
            subject__icontains='Welcome'
        ).first()
        
        if welcome_msg:
            print(f"  ✅ Welcome message created: {welcome_msg.subject}")
            print(f"  📝 Message content preview: {welcome_msg.message[:100]}...")
        else:
            print("  ❌ Welcome message not created")
            print("  🔍 Checking all messages for this student:")
            all_msgs = StudentMessage.objects.filter(student=test_student)
            for msg in all_msgs:
                print(f"    - Subject: {msg.subject}")
        
        # Clean up test student
        print("  Cleaning up test student...")
        test_student.delete()
        print("  🧹 Test student cleaned up")
        
    except Exception as e:
        print(f"  ❌ Error creating test student: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🎯 Notification System Test Complete!")

if __name__ == "__main__":
    test_notification_system() 