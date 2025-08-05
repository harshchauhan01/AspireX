# Generated manually for adding new fields to MentorDetail

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mentor', '0031_alter_mentordetail_github_url_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='mentordetail',
            name='key_achievements',
            field=models.JSONField(blank=True, default=list, help_text='List of key achievements'),
        ),
        migrations.AddField(
            model_name='mentordetail',
            name='services',
            field=models.JSONField(blank=True, default=list, help_text='List of services offered'),
        ),
        migrations.AddField(
            model_name='mentordetail',
            name='availability_day_wise',
            field=models.JSONField(blank=True, default=dict, help_text='Availability schedule by day'),
        ),
        migrations.AddField(
            model_name='mentordetail',
            name='languages',
            field=models.JSONField(blank=True, default=list, help_text='List of languages spoken'),
        ),
    ] 