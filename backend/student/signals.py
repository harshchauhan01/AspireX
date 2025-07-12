from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from student.models import Booking
from mentor.models import Meeting, MentorMessage
from datetime import timedelta
from student.models import StudentMessage

@receiver(post_save, sender=Booking)
def handle_booking_payment(sender, instance, created, **kwargs):
    # Only act if the booking is marked as paid
    if instance.is_paid:
        # Ensure we don’t create duplicate meetings/messages
        if not Meeting.objects.filter(student=instance.student, mentor=instance.mentor, title=instance.subject).exists():

            # Create meeting
            meeting = Meeting.objects.create(
                mentor=instance.mentor,
                student=instance.student,
                title=instance.subject,
                description=f"Meeting for subject: {instance.subject}",
                scheduled_time=timezone.now() + timedelta(days=1),  # Or use instance.time_slot if it’s a datetime
                duration=60,
                meeting_link="https://your-meeting-platform.com/room-id"
            )

            # Create message for mentor
            msg = StudentMessage.objects.create(
                student=instance.student,
                subject="Booking Confirmed with Mentor",
                message=(
                    f"Your booking with {instance.mentor.name} is confirmed.\n\n"
                    f"Scheduled at: {meeting.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
                    f"Meeting Link: {meeting.meeting_link}"
                ),
                sender=None  # You can also use instance.mentor.user if sender needs to be mentor's User
            )
            pass



