from django.db import models
from mentor.models import Mentor
from student.models import Student
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

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