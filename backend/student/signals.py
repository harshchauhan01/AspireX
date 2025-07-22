from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from student.models import Booking, Student, StudentDetail, StudentMessage
from mentor.models import Meeting, MentorMessage
from datetime import timedelta
from student.models import StudentMessage
import traceback

@receiver(post_save, sender=Student)
def create_student_detail(sender, instance, created, **kwargs):
    """Create StudentDetail when a Student is created"""
    if created:
        StudentDetail.objects.create(
            student=instance,
            email=instance.email,  # Copy email from student
            first_name=instance.name.split()[0] if instance.name else "",
            last_name=" ".join(instance.name.split()[1:]) if instance.name and len(instance.name.split()) > 1 else "",
            age=0,  # Set default age to 0
            cgpa=0.0,  # Set default cgpa to 0.0
            batch=0,  # Set default batch to 0
            is_approved=False,  # Set default is_approved to False
            total_sessions=0  # Set default total_sessions to 0
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
    print(f"[SIGNAL] Booking post_save triggered: id={instance.id}, created={created}, is_paid={instance.is_paid}")
    # Notify student if booking is created but not yet paid
    if created and not instance.is_paid:
        print(f"[SIGNAL] Booking created and not paid: id={instance.id}")
        # Get admin user as sender
        admin_user = Student.objects.filter(is_superuser=True).first()
        # Compose message
        amount = getattr(instance.mentor.details, 'fees', None)
        amount_str = f"{amount}" if amount is not None else "the required"
        StudentMessage.objects.create(
            student=instance.student,
            subject="Booking Payment Initiated",
            message=(
                f"You paid {amount_str} amount of money with transaction ID {instance.transaction_id} to book mentor {instance.mentor.name}. "
                f"We will first confirm the payment and schedule the meeting for you."
            ),
            sender=admin_user,
            is_read=False
        )
    # Only act if the booking is marked as paid
    if instance.is_paid:
        print(f"[SIGNAL] Booking is paid: id={instance.id}")
        try:
            # Parse the time_slot as IST and convert to UTC
            from django.utils import timezone
            import datetime
            import pytz
            IST = pytz.timezone('Asia/Kolkata')
            scheduled_time = None
            try:
                # Try ISO format first
                scheduled_time = datetime.datetime.fromisoformat(instance.time_slot)
                if scheduled_time.tzinfo is None:
                    scheduled_time = IST.localize(scheduled_time)
                scheduled_time = scheduled_time.astimezone(pytz.UTC)
            except Exception:
                try:
                    # Try common string format
                    scheduled_time = datetime.datetime.strptime(instance.time_slot, "%Y-%m-%d %H:%M")
                    if scheduled_time.tzinfo is None:
                        scheduled_time = IST.localize(scheduled_time)
                    scheduled_time = scheduled_time.astimezone(pytz.UTC)
                except Exception:
                    # Fallback to now + 1 day (in UTC)
                    scheduled_time = timezone.now() + datetime.timedelta(days=1)
            # Ensure we don't create duplicate meetings/messages
            if not Meeting.objects.filter(student=instance.student, mentor=instance.mentor, scheduled_time=scheduled_time).exists():
                print(f"[SIGNAL] No existing meeting found, creating new meeting for booking id={instance.id}")
                # Create meeting
                meeting = Meeting.objects.create(
                    mentor=instance.mentor,
                    student=instance.student,
                    title=instance.subject,
                    description=f"Meeting for subject: {instance.subject}",
                    scheduled_time=scheduled_time,
                    duration=60
                    # Do not set meeting_link here so the model auto-generates it
                )
                print(f"[SIGNAL] Meeting created: id={meeting.id}, meeting_id={meeting.meeting_id}")
                # Create message for mentor
                msg = MentorMessage.objects.create(
                    mentor=instance.mentor,
                    subject="New Booking Confirmed",
                    message=(
                        f"You have a new booking with {instance.student.name}.\n\n"
                        f"Subject: {instance.subject}\n"
                        f"Scheduled at: {meeting.scheduled_time.strftime('%Y-%m-%d %H:%M')} UTC\n"
                        f"Meeting ID: {meeting.meeting_id}\n"
                        f"Meeting Link: {meeting.meeting_link}\n"
                        f"Your attendance key: {meeting.mentor_attendance_key}\n"
                        f"You will need to provide this key to your student after the meeting to mark attendance.\n\n"
                        f"Please join the meeting a few minutes before the scheduled time. "
                        f"For the best experience, set up a free account at https://meet.jit.si/ if you want moderator controls or to avoid any joining issues.\n\n"
                        f"Warning: If you want to reschedule the meeting, you must do it at least 2 hours before the start of the meeting."
                    ),
                    admin_sender=None  # You can also use instance.student.user if sender needs to be student's User
                )
                # Create message for student
                student_msg = StudentMessage.objects.create(
                    student=instance.student,
                    subject="Booking Confirmed with Mentor",
                    message=(
                        f"Your booking with {instance.mentor.name} is confirmed.\n\n"
                        f"Subject: {instance.subject}\n"
                        f"Scheduled at: {meeting.scheduled_time.strftime('%Y-%m-%d %H:%M')} UTC\n"
                        f"Meeting ID: {meeting.meeting_id}\n"
                        f"Meeting Link: {meeting.meeting_link}\n"
                        f"Your attendance key: {meeting.student_attendance_key}\n"
                        f"You will need to provide this key to your mentor after the meeting to mark attendance."
                    ),
                    sender=None  # You can also use instance.mentor.user if sender needs to be mentor's User
                )
                print(f"[SIGNAL] Mentor and student messages created for meeting id={meeting.id}")
            else:
                print(f"[SIGNAL] Meeting already exists for booking id={instance.id}")
        except Exception as e:
            print(f"[SIGNAL][ERROR] Exception in handle_booking_payment: {e}")
            traceback.print_exc()  # Print the full traceback for debugging



