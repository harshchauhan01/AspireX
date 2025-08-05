from django.core.management.base import BaseCommand
from mentor.models import Mentor
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Update offline status for all mentors based on their last activity'

    def handle(self, *args, **options):
        try:
            # Get all mentors
            mentors = Mentor.objects.all()
            updated_count = 0
            
            for mentor in mentors:
                # Check if mentor should be offline
                five_minutes_ago = timezone.now() - timedelta(minutes=5)
                should_be_offline = mentor.last_activity < five_minutes_ago
                
                # Update if status needs to change
                if mentor.is_online and should_be_offline:
                    mentor.is_online = False
                    mentor.save(update_fields=['is_online'])
                    updated_count += 1
                    self.stdout.write(f"Set {mentor.name} ({mentor.mentor_id}) as offline")
                elif not mentor.is_online and not should_be_offline:
                    mentor.is_online = True
                    mentor.save(update_fields=['is_online'])
                    updated_count += 1
                    self.stdout.write(f"Set {mentor.name} ({mentor.mentor_id}) as online")
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ Updated {updated_count} mentor(s) online status")
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error updating offline status: {e}")
            ) 