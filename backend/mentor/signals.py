from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Meeting, Mentor, MentorDetail, MentorMessage
from student.models import Student
from mentor.models import Earning, MentorMessage, Meeting
from student.models import Booking
from utils import send_credentials_email, send_mentor_approved_email
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

@receiver(pre_save, sender=Meeting)
def update_meeting_status(sender, instance, **kwargs):
    instance.update_status_based_on_time()

@receiver(post_save, sender=Mentor)
def create_mentor_detail(sender, instance, created, **kwargs):
    """Create MentorDetail when a Mentor is created"""
    if created:
        MentorDetail.objects.create(
            mentor=instance,
            email=instance.email,  # Copy email from mentor
            first_name=instance.name.split()[0] if instance.name else "",
            last_name=" ".join(instance.name.split()[1:]) if instance.name and len(instance.name.split()) > 1 else ""
            # Let other fields use their model defaults
        )

@receiver(post_save, sender=Mentor)
def create_welcome_message(sender, instance, created, **kwargs):
    """Create welcome notification message from admin after mentor registration"""
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
        welcome_message = MentorMessage.objects.create(
            mentor=instance,
            subject="🎉 Welcome to AspireX - Your Journey Begins!",
            message=f"""Dear {instance.name},

Welcome to AspireX! 🚀 We're thrilled to have you join our community of mentors and learners.

🌟 **Complete Your Profile**
Take a moment to complete your profile by adding:
• Your professional details and experience
• Skills and expertise areas
• Profile photo and CV
• Availability timings
• About section

🎯 **Explore the Platform**
• Browse through student requests
• Set your session fees
• Connect with aspiring learners
• Share your knowledge and experience

💡 **Motivation for You**
"Education is not the filling of a pot but the lighting of a fire." - W.B. Yeats

As a mentor, you have the power to ignite curiosity, inspire growth, and shape futures. Every session you conduct, every piece of advice you share, contributes to someone's journey of learning and self-discovery.

Your expertise is valuable, and your guidance can make a world of difference. Start your mentoring journey today!

Best regards,
The AspireX Team

P.S. Don't forget to check your dashboard regularly for new opportunities!""",
            admin_sender=admin_user,
            is_read=False
        )

@receiver(post_save, sender=Meeting)
def handle_meeting_completed(sender, instance, created, **kwargs):
    # Only act if meeting is completed and wasn't just created
    if instance.status == 'completed' and not created:
        # Check if an earning already exists for this meeting
        if not Earning.objects.filter(mentor=instance.mentor, source__icontains=instance.meeting_id).exists():
            # Find the booking for this meeting
            booking = Booking.objects.filter(
                student=instance.student,
                mentor=instance.mentor,
                time_slot=str(instance.scheduled_time)
            ).first()
            amount = instance.mentor.details.fees if hasattr(instance.mentor, 'details') else 0
            transaction_id = booking.transaction_id if booking else None

            # Create earning
            earning = Earning.objects.create(
                mentor=instance.mentor,
                amount=amount,
                source=f"Session with {instance.student.name} (Meeting {instance.meeting_id})",
                transaction_id=transaction_id,
                status='completed'
            )

            # Send mentor message
            MentorMessage.objects.create(
                mentor=instance.mentor,
                subject="💰 Payment Received for Completed Meeting",
                message=f"You received a payment of ₹{amount} from {instance.student.name} for meeting '{instance.title}'.",
                is_read=False
            )

@receiver(pre_save, sender=MentorDetail)
def cache_old_is_approved(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = MentorDetail.objects.get(pk=instance.pk)
            instance._old_is_approved = old_instance.is_approved
        except MentorDetail.DoesNotExist:
            instance._old_is_approved = None
    else:
        instance._old_is_approved = None

@receiver(post_save, sender=MentorDetail)
def notify_mentor_approved(sender, instance, created, **kwargs):
    print("[DEBUG] MentorDetail post_save signal fired. created=", created, "is_approved=", instance.is_approved)
    old_is_approved = getattr(instance, '_old_is_approved', None)
    if not created and old_is_approved is not None:
        if not old_is_approved and instance.is_approved:
            print(f"[DEBUG] Mentor {instance.mentor} just got approved! Sending notification and email...")
            MentorMessage.objects.create(
                mentor=instance.mentor,
                subject="🎉 Your Profile is Now Public!",
                message=f"Dear {instance.mentor.name},\n\nCongratulations! Your mentor profile has been approved and is now public on AspireX. You are ready to go and can start receiving student bookings.\n\nBest of luck!\n\nThe AspireX Team",
                is_read=False
            )
            print(f"[DEBUG] Calling send_mentor_approved_email for {instance.email}")
            send_mentor_approved_email(instance)



