from django.core.management.base import BaseCommand
from django.utils import timezone
from community.models import Post
from datetime import timedelta

class Command(BaseCommand):
    help = 'Delete posts (and related likes/comments) older than 10 days.'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=10)
        old_posts = Post.objects.filter(created_at__lt=cutoff)
        count = old_posts.count()
        old_posts.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {count} posts older than 10 days.')) 