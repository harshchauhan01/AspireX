from django.core.management.base import BaseCommand
from mentor.models import Meeting

class Command(BaseCommand):
    help = 'Update meeting statuses based on scheduled time'

    def handle(self, *args, **kwargs):
        meetings = Meeting.objects.all()
        updated_count = 0
        for meeting in meetings:
            original_status = meeting.status
            meeting.save()  # This will trigger update_status_based_on_time()
            if meeting.status != original_status:
                updated_count += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated_count} meeting(s).'))
