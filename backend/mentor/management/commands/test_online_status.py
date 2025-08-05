from django.core.management.base import BaseCommand
from mentor.models import Mentor
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Test online status functionality'

    def handle(self, *args, **options):
        try:
            mentor = Mentor.objects.get(mentor_id='M000001')
            
            self.stdout.write(f"Testing online status for mentor: {mentor.name}")
            self.stdout.write(f"Current is_online: {mentor.is_online}")
            self.stdout.write(f"Current is_currently_online(): {mentor.is_currently_online()}")
            self.stdout.write(f"Last activity: {mentor.last_activity}")
            self.stdout.write(f"Last seen: {mentor.last_seen}")
            
            # Test updating online status
            self.stdout.write("\nUpdating online status...")
            mentor.update_online_status()
            
            self.stdout.write(f"After update - is_online: {mentor.is_online}")
            self.stdout.write(f"After update - is_currently_online(): {mentor.is_currently_online()}")
            self.stdout.write(f"After update - last activity: {mentor.last_activity}")
            
            # Test setting offline
            self.stdout.write("\nSetting mentor as offline...")
            mentor.last_activity = timezone.now() - timedelta(minutes=10)
            mentor.is_online = False
            mentor.save()
            
            self.stdout.write(f"After offline - is_online: {mentor.is_online}")
            self.stdout.write(f"After offline - is_currently_online(): {mentor.is_currently_online()}")
            
            self.stdout.write(
                self.style.SUCCESS("✅ Online status functionality is working correctly!")
            )
            
        except Mentor.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("❌ Mentor M000001 not found")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error: {e}")
            ) 