from django.core.management.base import BaseCommand
from mentor.models import Mentor, MentorDetail
from student.models import Student, Feedback
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Add sample mentor data with key achievements, services, availability, and languages'

    def handle(self, *args, **options):
        # Get or create a mentor
        mentor, created = Mentor.objects.get_or_create(
            mentor_id='M000001',
            defaults={
                'email': 'sarah.mentor@example.com',
                'name': 'Sarah Johnson',
                'password': 'testpass123'
            }
        )

        # Get or create mentor details
        mentor_detail, detail_created = MentorDetail.objects.get_or_create(
            mentor=mentor,
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'email': 'sarah.mentor@example.com',
                'college': 'Stanford University',
                'about': 'Experienced software engineer with 8+ years in the industry. Passionate about mentoring and helping others grow in their careers.',
                'fees': 80.00,
                'years_of_experience': 8,
                'average_rating': 4.8,
                'total_sessions': 150,
                'profile_photo': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
                'is_approved': True,
                'key_achievements': [
                    "Led development of 10+ production applications",
                    "Mentored 50+ junior developers to senior positions", 
                    "Achieved 95% client satisfaction rate",
                    "Published 20+ technical articles and tutorials",
                    "Speaker at 5+ tech conferences"
                ],
                'services': [
                    {
                        "title": "1-on-1 Career Guidance",
                        "duration": "60 min",
                        "price": 80,
                        "description": "Comprehensive career planning session covering resume review, career roadmap, and strategic advice for your next move.",
                        "features": ["Resume Review", "Career Roadmap", "Industry Insights", "Goal Setting"],
                        "popularity": 95,
                        "sessionCount": 150
                    },
                    {
                        "title": "Technical Interview Prep",
                        "duration": "45 min", 
                        "price": 60,
                        "description": "Intensive mock interview sessions with real-time feedback covering coding, system design, and behavioral questions.",
                        "features": ["Mock Interviews", "Coding Practice", "System Design", "Feedback Report"],
                        "popularity": 92,
                        "sessionCount": 200
                    },
                    {
                        "title": "Code Review & Architecture",
                        "duration": "30 min",
                        "price": 48,
                        "description": "In-depth code review with architectural recommendations and best practices for scalable applications.",
                        "features": ["Code Analysis", "Architecture Review", "Best Practices", "Performance Tips"],
                        "popularity": 88,
                        "sessionCount": 100
                    }
                ],
                'availability_day_wise': {
                    "monday": {
                        "date": "Feb 5",
                        "slots": [
                            {"time": "9:00 AM", "available": True},
                            {"time": "2:00 PM", "available": True},
                            {"time": "6:00 PM", "available": False}
                        ]
                    },
                    "wednesday": {
                        "date": "Feb 7", 
                        "slots": [
                            {"time": "10:00 AM", "available": True},
                            {"time": "4:00 PM", "available": True},
                            {"time": "7:00 PM", "available": True}
                        ]
                    },
                    "friday": {
                        "date": "Feb 9",
                        "slots": [
                            {"time": "1:00 PM", "available": True},
                            {"time": "5:00 PM", "available": False},
                            {"time": "8:00 PM", "available": True}
                        ]
                    }
                },
                'languages': ["English", "Spanish", "French"]
            }
        )

        # Add sample feedback/reviews
        student_names = ["Alex Chen", "Maya Patel", "Jordan Smith", "Emma Wilson", "David Kim"]
        student_roles = ["Software Engineer at Meta", "Full Stack Developer", "Senior Developer at Amazon", "Product Manager", "Data Scientist"]
        comments = [
            "Sarah's interview prep was incredible! She helped me identify my weak points and gave me a structured plan. Landed my dream job at Meta within 2 months!",
            "Amazing mentor! Sarah's career guidance session completely changed my perspective. Her practical advice and industry insights are invaluable.",
            "The code review session was fantastic. Sarah provided detailed feedback and architectural improvements that made our application 40% faster!",
            "Sarah is an exceptional mentor. Her guidance helped me transition from a junior developer to a senior role within a year.",
            "The technical interview prep was exactly what I needed. Sarah's mock interviews were challenging but realistic, and her feedback was spot-on."
        ]

        for i in range(5):
            student, student_created = Student.objects.get_or_create(
                student_id=f'S{str(i+1).zfill(6)}',
                defaults={
                    'email': f'student{i+1}@example.com',
                    'name': student_names[i],
                    'password': 'testpass123'
                }
            )

            # Create feedback
            feedback, feedback_created = Feedback.objects.get_or_create(
                student=student,
                mentor=mentor,
                defaults={
                    'rating': random.randint(4, 5),
                    'feedback_text': comments[i],
                    'is_approved': True,
                    'created_at': datetime.now() - timedelta(days=random.randint(1, 60))
                }
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully added sample mentor data with key achievements, services, availability, and languages')
        ) 