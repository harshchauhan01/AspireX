from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from student.models import Booking, Student, StudentDetail, StudentMessage
from mentor.models import Meeting, MentorMessage
from datetime import timedelta
from student.models import StudentMessage

@receiver(post_save, sender=Student)
def create_student_detail(sender, instance, created, **kwargs):
    """Create StudentDetail when a Student is created"""
    if created:
        StudentDetail.objects.create(
            student=instance,
            email=instance.email,  # Copy email from student
            first_name=instance.name.split()[0] if instance.name else "",
            last_name=" ".join(instance.name.split()[1:]) if instance.name and len(instance.name.split()) > 1 else ""
        )

@receiver(post_save, sender=Student)
def create_welcome_message(sender, instance, created, **kwargs):
    """Create welcome notification message from admin after student registration"""
    if created:
        # Get or create admin user (using Student model since it's the AUTH_USER_MODEL)
        try:
            admin_user = Student.objects.filter(is_superuser=True).first()
            if not admin_user:
                # Create a default admin user if none exists
                admin_user = Student.objects.create_superuser(
                    student_id='admin',
                    email='admin@aspirex.com',
                    name='Admin User',
                    password='admin123'
                )
        except Exception as e:
            print(f"Error creating admin user: {e}")
            return

        # Create welcome message
        welcome_message = StudentMessage.objects.create(
            student=instance,
            subject="🎉 Welcome to AspireX - Your Learning Journey Begins!",
            message=f"""Dear {instance.name},

Welcome to AspireX! 🚀 We're excited to have you join our community of learners and mentors.

🌟 **Complete Your Profile**
Take a moment to complete your profile by adding:
• Your educational background
• Skills you want to develop
• Profile photo and CV
• Areas of interest
• About section

🎯 **Explore the Platform**
• Browse through available mentors
• Book sessions with experts
• Connect with like-minded learners
• Start your learning journey

💡 **Motivation for You**
"The beautiful thing about learning is that nobody can take it away from you." - B.B. King

Your journey of growth and discovery starts now! Every mentor you connect with, every session you attend, and every skill you develop brings you closer to your goals.

Remember, the best investment you can make is in yourself. Take advantage of the amazing mentors available on our platform and unlock your full potential!

Best regards,
The AspireX Team

P.S. Don't forget to check your dashboard regularly for new opportunities and mentor recommendations!""",
            sender=admin_user,
            is_read=False
        )

@receiver(post_save, sender=Booking)
def handle_booking_payment(sender, instance, created, **kwargs):
    # Only act if the booking is marked as paid
    if instance.is_paid:
        # Ensure we don't create duplicate meetings/messages
        if not Meeting.objects.filter(student=instance.student, mentor=instance.mentor, title=instance.subject).exists():

            # Create meeting
            meeting = Meeting.objects.create(
                mentor=instance.mentor,
                student=instance.student,
                title=instance.subject,
                description=f"Meeting for subject: {instance.subject}",
                scheduled_time=timezone.now() + timedelta(days=1),  # Or use instance.time_slot if it's a datetime
                duration=60,
                meeting_link="https://your-meeting-platform.com/room-id"
            )

            # Create message for mentor
            msg = MentorMessage.objects.create(
                mentor=instance.mentor,
                subject="New Booking Confirmed",
                message=(
                    f"You have a new booking with {instance.student.name}.\n\n"
                    f"Subject: {instance.subject}\n"
                    f"Scheduled at: {meeting.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
                    f"Meeting Link: {meeting.meeting_link}"
                ),
                sender=None  # You can also use instance.student.user if sender needs to be student's User
            )

            # Create message for student
            student_msg = StudentMessage.objects.create(
                student=instance.student,
                subject="Booking Confirmed with Mentor",
                message=(
                    f"Your booking with {instance.mentor.name} is confirmed.\n\n"
                    f"Subject: {instance.subject}\n"
                    f"Scheduled at: {meeting.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
                    f"Meeting Link: {meeting.meeting_link}"
                ),
                sender=None  # You can also use instance.mentor.user if sender needs to be mentor's User
            )



