#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from mentor.models import Mentor, Earning
from django.db import models

def check_earnings_data():
    # Get the first mentor
    mentor = Mentor.objects.first()
    if not mentor:
        print("No mentor found!")
        return
    
    print(f"Checking data for mentor: {mentor.name} ({mentor.mentor_id})")
    
    # Get all earnings
    all_earnings = Earning.objects.filter(mentor=mentor, status='completed')
    positive_earnings = all_earnings.filter(amount__gt=0)
    withdrawals = all_earnings.filter(amount__lt=0)
    
    print(f"\nTotal earnings records: {all_earnings.count()}")
    print(f"Positive earnings: {positive_earnings.count()}")
    print(f"Withdrawals: {withdrawals.count()}")
    
    # Calculate statistics
    total_earnings = positive_earnings.aggregate(total=models.Sum('amount'))['total'] or 0
    total_withdrawals = withdrawals.aggregate(total=models.Sum('amount'))['total'] or 0
    available_balance = total_earnings + total_withdrawals
    
    print(f"\nTotal earnings amount: ${total_earnings:.2f}")
    print(f"Total withdrawals amount: ${abs(total_withdrawals):.2f}")
    print(f"Available balance: ${available_balance:.2f}")
    
    # Count unique students
    student_sources = positive_earnings.values_list('source', flat=True)
    unique_students = set()
    for source in student_sources:
        if 'with' in source.lower():
            student_name = source.split('with')[-1].strip()
            unique_students.add(student_name)
    
    print(f"\nUnique students: {len(unique_students)}")
    print("Student names:", list(unique_students)[:10])  # Show first 10
    
    # Show some sample earnings
    print(f"\nSample earnings:")
    for earning in positive_earnings[:5]:
        print(f"  ${earning.amount:.2f} - {earning.source} - {earning.date}")

if __name__ == "__main__":
    check_earnings_data() 