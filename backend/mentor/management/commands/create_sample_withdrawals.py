from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from mentor.models import Mentor, Earning
import random
from django.db import models

class Command(BaseCommand):
    help = 'Create sample withdrawal data for mentors'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mentor_id',
            type=str,
            help='Specific mentor ID to create withdrawals for',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=3,
            help='Number of withdrawal records to create',
        )

    def handle(self, *args, **options):
        mentor_id = options['mentor_id']
        count = options['count']

        if mentor_id:
            try:
                mentor = Mentor.objects.get(mentor_id=mentor_id)
            except Mentor.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Mentor with ID {mentor_id} does not exist')
                )
                return
        else:
            # Get the first mentor or create one if none exists
            mentor = Mentor.objects.first()
            if not mentor:
                self.stdout.write(
                    self.style.ERROR('No mentors found. Please create a mentor first.')
                )
                return

        withdrawals_created = 0
        
        for i in range(count):
            # Generate random date within last 2 months
            days_ago = random.randint(0, 60)
            date = timezone.now().date() - timedelta(days=days_ago)
            
            # Generate random withdrawal amount between $50 and $200
            amount = -round(random.uniform(50.0, 200.0), 2)  # Negative amount for withdrawals
            
            # Create withdrawal record
            withdrawal = Earning.objects.create(
                mentor=mentor,
                amount=amount,
                date=date,
                source="Withdrawal",
                status='completed',
                notes=f"Withdrawal request for ${abs(amount)}"
            )
            
            withdrawals_created += 1
            
            self.stdout.write(f'Created withdrawal: ${abs(amount)} on {date}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {withdrawals_created} withdrawal records for mentor {mentor.name} ({mentor.mentor_id})'
            )
        )
        
        # Calculate and display summary
        total_earnings = Earning.objects.filter(
            mentor=mentor, 
            status='completed',
            amount__gt=0
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        total_withdrawals = Earning.objects.filter(
            mentor=mentor,
            status='completed',
            amount__lt=0
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        available_balance = total_earnings + total_withdrawals  # withdrawals are negative
        
        self.stdout.write(
            self.style.SUCCESS(f'Total earnings: ${total_earnings:.2f}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total withdrawals: ${abs(total_withdrawals):.2f}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Available balance: ${available_balance:.2f}')
        ) 