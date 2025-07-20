from django.core.management.base import BaseCommand
from django.utils import timezone
from mentor.models import Meeting, MentorMessage
from student.models import StudentMessage, Student
from datetime import timedelta

class Command(BaseCommand):
    help = 'Send attendance keys and meeting links to students and mentors for meetings starting in the next 0–31 minutes.'

    def handle(self, *args, **options):
        now = timezone.now()
        window_start = now
        window_end = now + timedelta(minutes=31)
        meetings = Meeting.objects.filter(scheduled_time__gte=window_start, scheduled_time__lte=window_end)
        for meeting in meetings:
            # Only send if both meeting_link and keys are set
            if not meeting.meeting_link or not meeting.student_attendance_key or not meeting.mentor_attendance_key:
                continue
            # Send to student if not already sent
            if meeting.student and not StudentMessage.objects.filter(student=meeting.student, subject__icontains='Attendance Key', message__icontains=meeting.student_attendance_key).exists():
                StudentMessage.objects.create(
                    student=meeting.student,
                    sender=None,  # System/admin
                    subject=f"Your Meeting Link and Attendance Key for '{meeting.title}' (Meeting ID: {meeting.meeting_id})",
                    message=f"Meeting ID: {meeting.meeting_id}\nMeeting Link: {meeting.meeting_link}\nYour attendance key: {meeting.student_attendance_key}\nGive this key to your mentor after the meeting so they can mark their attendance."
                )
                self.stdout.write(self.style.SUCCESS(f"Sent student key and link to {meeting.student}: {meeting.student_attendance_key}"))
            # Send to mentor if not already sent
            if meeting.mentor and not MentorMessage.objects.filter(mentor=meeting.mentor, subject__icontains='Attendance Key', message__icontains=meeting.mentor_attendance_key).exists():
                MentorMessage.objects.create(
                    mentor=meeting.mentor,
                    admin_sender=None,  # System/admin
                    subject=f"Your Meeting Link and Attendance Key for '{meeting.title}' (Meeting ID: {meeting.meeting_id})",
                    message=f"Meeting ID: {meeting.meeting_id}\nMeeting Link: {meeting.meeting_link}\nYour attendance key: {meeting.mentor_attendance_key}\nGive this key to your student after the meeting so they can mark their attendance."
                )
                self.stdout.write(self.style.SUCCESS(f"Sent mentor key and link to {meeting.mentor}: {meeting.mentor_attendance_key}")) 