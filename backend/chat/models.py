from django.db import models
from student.models import Student
from mentor.models import Mentor

class ChatMessage(models.Model):
    sender_student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    sender_mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE, null=True, blank=True)
    receiver_student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name="received_messages_student")
    receiver_mentor = models.ForeignKey(Mentor, on_delete=models.CASCADE, null=True, blank=True, related_name="received_messages_mentor")
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message[:50]
