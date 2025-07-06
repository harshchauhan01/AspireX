from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Meeting

@receiver(pre_save, sender=Meeting)
def update_meeting_status(sender, instance, **kwargs):
    instance.update_status_based_on_time()



