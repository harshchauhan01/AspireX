# Generated by Django 5.2 on 2025-07-26 12:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0014_alter_studentdetail_age_alter_studentdetail_batch_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentdetail',
            name='cv',
            field=models.URLField(blank=True, default=None, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='studentdetail',
            name='profile_photo',
            field=models.URLField(blank=True, default=None, max_length=500, null=True),
        ),
    ]
