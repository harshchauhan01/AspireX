# Generated by Django 5.0.1 on 2025-07-24 16:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0010_alter_notification_created_at_alter_notification_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='NewsletterSubscriber',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('subscribed_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
