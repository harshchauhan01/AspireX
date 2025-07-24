from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0007_notification"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="notification",
            name="recipient_id",
        ),
        migrations.AddField(
            model_name="notification",
            name="recipient_formal_id",
            field=models.CharField(max_length=20, default=""),
            preserve_default=False,
        ),
    ] 