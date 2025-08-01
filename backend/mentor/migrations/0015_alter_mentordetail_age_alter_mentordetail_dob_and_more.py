# Generated by Django 5.2 on 2025-06-19 11:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mentor', '0014_mentorpost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mentordetail',
            name='age',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='mentordetail',
            name='dob',
            field=models.DateField(default='NULL'),
        ),
        migrations.AlterField(
            model_name='mentordetail',
            name='first_name',
            field=models.CharField(default='NULL', max_length=100),
        ),
        migrations.AlterField(
            model_name='mentordetail',
            name='gender',
            field=models.CharField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], default='Male', max_length=10),
        ),
        migrations.AlterField(
            model_name='mentordetail',
            name='last_name',
            field=models.CharField(default='NULL', max_length=100),
        ),
        migrations.AlterField(
            model_name='mentordetail',
            name='phone_number',
            field=models.CharField(default='0000000000', max_length=15),
        ),
    ]
