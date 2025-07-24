from django.db import models
from mentor.models import Mentor
from student.models import Student
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from utils import send_styled_notification_email

class Conversation(models.Model):
    mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pinned = models.BooleanField(default=False)

    class Meta:
        unique_together = ('mentor', 'student')

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender_type = models.CharField(max_length=10, choices=[('mentor', 'Mentor'), ('student', 'Student')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    query = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class CustomerServiceMessage(models.Model):
    USER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('mentor', 'Mentor'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    user_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    user_object_id = models.CharField(max_length=50)
    user = GenericForeignKey('user_content_type', 'user_object_id')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_type.title()} {self.user}: {self.subject}"

class CustomerServiceReply(models.Model):
    message = models.ForeignKey(CustomerServiceMessage, on_delete=models.CASCADE, related_name='replies')
    reply = models.TextField()
    replied_by = models.CharField(max_length=50)  # 'admin' or staff username
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply to {self.message.subject} by {self.replied_by}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.message.is_resolved:
            self.message.is_resolved = True
            self.message.save(update_fields=["is_resolved"])

class Notification(models.Model):
    RECIPIENT_TYPE_CHOICES = [
        ("student", "Student"),
        ("mentor", "Mentor"),
    ]
    recipient_type = models.CharField(max_length=10, choices=RECIPIENT_TYPE_CHOICES)
    recipient_formal_id = models.CharField(max_length=20)  # mentor_id or student_id
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    is_email_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"To {self.recipient_type} {self.recipient_formal_id}: {self.message[:30]}"

@receiver(post_save, sender=Notification)
def create_in_app_message(sender, instance, created, **kwargs):
    if not created:
        return
    try:
        if instance.recipient_type == "student":
            from student.models import Student, StudentMessage
            student = Student.objects.filter(student_id__iexact=instance.recipient_formal_id.strip()).first()
            if student:
                StudentMessage.objects.create(
                    student=student,
                    sender=None,
                    subject="Admin Notification",
                    message=instance.message
                )
                print(f"[Notification post_save] Created StudentMessage for {student}")
                # Only send styled notification email (not credentials email)
                send_styled_notification_email(
                    email=student.email,
                    subject="AspireX Admin Notification",
                    message=instance.message,
                    name=student.name,
                    user_id=student.student_id
                )
        elif instance.recipient_type == "mentor":
            from mentor.models import Mentor, MentorMessage
            mentor = Mentor.objects.filter(mentor_id__iexact=instance.recipient_formal_id.strip()).first()
            if mentor:
                MentorMessage.objects.create(
                    mentor=mentor,
                    admin_sender=None,
                    subject="Admin Notification",
                    message=instance.message
                )
                print(f"[Notification post_save] Created MentorMessage for {mentor}")
                # Only send styled notification email (not credentials email)
                send_styled_notification_email(
                    email=mentor.email,
                    subject="AspireX Admin Notification",
                    message=instance.message,
                    name=mentor.name,
                    user_id=mentor.mentor_id
                )
    except Exception as e:
        import traceback
        print(f"[Notification post_save] Error creating in-app message: {e}")
        traceback.print_exc()

class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

class SiteStatus(models.Model):
    maintenance_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)