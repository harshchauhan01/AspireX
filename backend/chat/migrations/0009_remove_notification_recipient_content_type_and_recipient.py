from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0008_notification_formal_id"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="notification",
            name="recipient_content_type",
        ),
    ] 