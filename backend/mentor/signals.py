from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Meeting, Mentor, MentorDetail, MentorMessage
from student.models import Student

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



