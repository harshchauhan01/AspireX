from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from mentor.models import Mentor, Earning
import random
from django.db import models

class Command(BaseCommand):
    help = 'Create sample earnings data for mentors'

    def add_arguments(self, parser):
        parser.add_argument(
            '--mentor_id',
            type=str,
            help='Specific mentor ID to create earnings for',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of earnings records to create',
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

        # Sample student names for earnings sources
        student_names = [
            'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 
            'Michael Wilson', 'Sarah Brown', 'David Miller', 'Lisa Garcia',
            'James Rodriguez', 'Jennifer Martinez', 'Christopher Lee',
            'Amanda Taylor', 'Matthew Anderson', 'Nicole Thomas', 'Joshua Jackson'
        ]

        # Sample session types
        session_types = [
            'Programming Session', 'Career Guidance', 'Interview Prep',
            'Project Review', 'Code Review', 'Technical Discussion',
            'Resume Review', 'Portfolio Review', 'Mock Interview',
            'Study Session', 'Debugging Help', 'Algorithm Discussion'
        ]

        earnings_created = 0
        
        for i in range(count):
            # Generate random date within last 3 months
            days_ago = random.randint(0, 90)
            date = timezone.now().date() - timedelta(days=days_ago)
            
            # Generate random amount between $15 and $50
            amount = round(random.uniform(15.0, 50.0), 2)
            
            # Generate source
            student = random.choice(student_names)
            session_type = random.choice(session_types)
            source = f"{session_type} with {student}"
            
            # Create earning record
            earning = Earning.objects.create(
                mentor=mentor,
                amount=amount,
                date=date,
                source=source,
                status='completed',
                notes=f"Completed {session_type.lower()} session"
            )
            
            earnings_created += 1
            
            if earnings_created % 5 == 0:
                self.stdout.write(f'Created {earnings_created} earnings records...')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {earnings_created} earnings records for mentor {mentor.name} ({mentor.mentor_id})'
            )
        )
        
        # Calculate and display summary
        total_earnings = Earning.objects.filter(mentor=mentor, status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        self.stdout.write(
            self.style.SUCCESS(f'Total earnings: ${total_earnings:.2f}')
        ) 