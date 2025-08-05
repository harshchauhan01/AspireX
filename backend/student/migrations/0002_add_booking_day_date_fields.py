# Generated manually to add day and date fields to Booking model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='day',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='date',
            field=models.DateField(blank=True, null=True),
        ),
    ] 