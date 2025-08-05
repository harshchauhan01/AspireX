from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from student.models import Booking, Student, StudentDetail, StudentMessage
from mentor.models import Meeting, MentorMessage
from datetime import timedelta
from student.models import StudentMessage
import traceback

@receiver(post_save, sender=Student)
def create_student_detail(sender, instance, created, **kwargs):
    """Create StudentDetail when a Student is created"""
    if created:
        StudentDetail.objects.create(
            student=instance,
            email=instance.email,  # Copy email from student
            first_name=instance.name.split()[0] if instance.name else "",
            last_name=" ".join(instance.name.split()[1:]) if instance.name and len(instance.name.split()) > 1 else "",
            age=0,  # Set default age to 0
            cgpa=0.0,  # Set default cgpa to 0.0
            batch=0,  # Set default batch to 0
            is_approved=False,  # Set default is_approved to False
            total_sessions=0  # Set default total_sessions to 0
        )

@receiver(post_save, sender=Student)
def create_welcome_message(sender, instance, created, **kwargs):
    """Create welcome notification message from admin after student registration"""
    if created:
        # Get or create admin user (using Student model since it's the AUTH_USER_MODEL)
        try:
            admin_user = Student.objects.filter(is_superuser=True).first()
            if not admin_user:
                # Create a default admin user if none exists
                admin_user = Student.objects.create_superuser(
                    student_id='admin',
                    email='admin@aspirex.com',
                    name='Admin User',
                    password='admin123'
                )
        except Exception as e:
            print(f"Error creating admin user: {e}")
            return

        # Create welcome message
        welcome_message = StudentMessage.objects.create(
            student=instance,
            subject="🎉 Welcome to AspireX - Your Learning Journey Begins!",
            message=f"""Dear {instance.name},

Welcome to AspireX! 🚀 We're excited to have you join our community of learners and mentors.

🌟 **Complete Your Profile**
Take a moment to complete your profile by adding:
• Your educational background
• Skills you want to develop
• Profile photo and CV
• Areas of interest
• About section

🎯 **Explore the Platform**
• Browse through available mentors
• Book sessions with experts
• Connect with like-minded learners
• Start your learning journey

💡 **Motivation for You**
"The beautiful thing about learning is that nobody can take it away from you." - B.B. King

Your journey of growth and discovery starts now! Every mentor you connect with, every session you attend, and every skill you develop brings you closer to your goals.

Remember, the best investment you can make is in yourself. Take advantage of the amazing mentors available on our platform and unlock your full potential!

Best regards,
The AspireX Team

P.S. Don't forget to check your dashboard regularly for new opportunities and mentor recommendations!""",
            sender=admin_user,
            is_read=False
        )

@receiver(post_save, sender=Booking)
def handle_booking_payment(sender, instance, created, **kwargs):
    print(f"[SIGNAL] Booking post_save triggered: id={instance.id}, created={created}, is_paid={instance.is_paid}")
    # Notify student if booking is created but not yet paid
    if created and not instance.is_paid:
        print(f"[SIGNAL] Booking created and not paid: id={instance.id}")
        # Get admin user as sender
        admin_user = Student.objects.filter(is_superuser=True).first()
        # Compose message using service price if available
        if instance.service_price:
            amount_str = f"₹{instance.service_price}"
            service_info = f" for {instance.service} ({instance.service_duration})"
        else:
            amount = getattr(instance.mentor.details, 'fees', None)
            amount_str = f"₹{amount}" if amount is not None else "the required"
            service_info = ""
            
        StudentMessage.objects.create(
            student=instance.student,
            subject="Booking Payment Initiated",
            message=(
                f"You paid {amount_str}{service_info} with transaction ID {instance.transaction_id} to book mentor {instance.mentor.name}. "
                f"We will first confirm the payment and schedule the meeting for you."
            ),
            sender=admin_user,
            is_read=False
        )
    # Only act if the booking is marked as paid
    if instance.is_paid:
        print(f"[SIGNAL] Booking is paid: id={instance.id}")
        try:
            # Use the actual booking date and time from the booking instance
            from django.utils import timezone
            import datetime
            import pytz
            IST = pytz.timezone('Asia/Kolkata')
            scheduled_time = None
            
            # Parse different time_slot formats
            time_slot = instance.time_slot
            print(f"[SIGNAL] Parsing time_slot: {time_slot}")
            
            # Use the actual booking date from the instance
            booking_date = instance.date
            scheduled_time = None
            
            # Handle different time_slot formats
            if time_slot and ',' in time_slot:
                # Format: "Monday, Mon 12 - 9:00 AM"
                parts = time_slot.split(', ')
                if len(parts) >= 2:
                    time_part = parts[1].split(' - ')[1] if ' - ' in parts[1] else parts[1]  # "9:00 AM"
                    
                    print(f"[SIGNAL] Parsed time: {time_part}")
                    
                    if not booking_date:
                        print(f"[SIGNAL] No booking date found, parsing from time_slot")
                        # Parse date from time_slot as fallback
                        date_part = parts[1].split(' - ')[0]  # "Mon 12"
                        try:
                            date_parts = date_part.split()
                            if len(date_parts) >= 2:
                                day_number = int(date_parts[1])  # "12"
                                current_year = timezone.now().year
                                current_month = timezone.now().month
                                
                                # Create the actual date
                                booking_date = datetime.datetime(current_year, current_month, day_number).date()
                                
                                # If the date is in the past, move to next month
                                if booking_date < timezone.now().date():
                                    if current_month == 12:
                                        booking_date = datetime.datetime(current_year + 1, 1, day_number).date()
                                    else:
                                        booking_date = datetime.datetime(current_year, current_month + 1, day_number).date()
                                
                                print(f"[SIGNAL] Parsed booking date from time_slot: {booking_date}")
                            else:
                                print(f"[SIGNAL] Could not parse day number from: {date_part}")
                                booking_date = timezone.now().date()
                        except (ValueError, IndexError) as e:
                            print(f"[SIGNAL] Error parsing date from {date_part}: {e}")
                            booking_date = timezone.now().date()
                    else:
                        print(f"[SIGNAL] Using booking date from instance: {booking_date}")
                    
                    # Parse time (e.g., "9:00 AM" or "2:00 PM")
                    try:
                        if 'AM' in time_part or 'PM' in time_part:
                            # Parse 12-hour format
                            time_obj = datetime.datetime.strptime(time_part, "%I:%M %p")
                            hour = time_obj.hour
                            minute = time_obj.minute
                        else:
                            # Parse 24-hour format
                            time_obj = datetime.datetime.strptime(time_part, "%H:%M")
                            hour = time_obj.hour
                            minute = time_obj.minute
                        
                        # Create datetime object using the actual booking date
                        scheduled_time = datetime.datetime.combine(booking_date, datetime.time(hour, minute))
                        scheduled_time = IST.localize(scheduled_time)
                        scheduled_time = scheduled_time.astimezone(pytz.UTC)
                        
                        print(f"[SIGNAL] Calculated scheduled_time: {scheduled_time}")
                        
                    except Exception as time_error:
                        print(f"[SIGNAL] Error parsing time: {time_error}")
                        scheduled_time = timezone.now() + datetime.timedelta(days=1)
                else:
                    print(f"[SIGNAL] Could not parse time_slot parts")
                    scheduled_time = timezone.now() + datetime.timedelta(days=1)
                    
            elif time_slot and 'T' in time_slot:
                # Format: "2025-07-25T23:35" (ISO format)
                try:
                    scheduled_time = datetime.datetime.fromisoformat(time_slot.replace('Z', '+00:00'))
                    if timezone.is_naive(scheduled_time):
                        scheduled_time = IST.localize(scheduled_time)
                    scheduled_time = scheduled_time.astimezone(pytz.UTC)
                    print(f"[SIGNAL] Parsed ISO format scheduled_time: {scheduled_time}")
                except Exception as e:
                    print(f"[SIGNAL] Error parsing ISO format: {e}")
                    scheduled_time = timezone.now() + datetime.timedelta(days=1)
                    
            elif time_slot and ' ' in time_slot and not ',' in time_slot:
                # Format: "Tuesday 5 Tue 5:00 PM"
                try:
                    parts = time_slot.split(' ')
                    if len(parts) >= 4:
                        # Extract time part (last two parts)
                        time_part = f"{parts[-2]} {parts[-1]}"  # "5:00 PM"
                        
                        # Extract day number (second part)
                        day_number = int(parts[1])  # "5"
                        current_year = timezone.now().year
                        current_month = timezone.now().month
                        
                        # Create the actual date
                        booking_date = datetime.datetime(current_year, current_month, day_number).date()
                        
                        # If the date is in the past, move to next month
                        if booking_date < timezone.now().date():
                            if current_month == 12:
                                booking_date = datetime.datetime(current_year + 1, 1, day_number).date()
                            else:
                                booking_date = datetime.datetime(current_year, current_month + 1, day_number).date()
                        
                        print(f"[SIGNAL] Parsed booking date from alternative format: {booking_date}")
                        
                        # Parse time
                        if 'AM' in time_part or 'PM' in time_part:
                            time_obj = datetime.datetime.strptime(time_part, "%I:%M %p")
                            hour = time_obj.hour
                            minute = time_obj.minute
                        else:
                            time_obj = datetime.datetime.strptime(time_part, "%H:%M")
                            hour = time_obj.hour
                            minute = time_obj.minute
                        
                        # Create datetime object
                        scheduled_time = datetime.datetime.combine(booking_date, datetime.time(hour, minute))
                        scheduled_time = IST.localize(scheduled_time)
                        scheduled_time = scheduled_time.astimezone(pytz.UTC)
                        
                        print(f"[SIGNAL] Calculated scheduled_time from alternative format: {scheduled_time}")
                    else:
                        print(f"[SIGNAL] Could not parse alternative format parts")
                        scheduled_time = timezone.now() + datetime.timedelta(days=1)
                except Exception as e:
                    print(f"[SIGNAL] Error parsing alternative format: {e}")
                    scheduled_time = timezone.now() + datetime.timedelta(days=1)
            else:
                print(f"[SIGNAL] Invalid time_slot format: {time_slot}")
                scheduled_time = timezone.now() + datetime.timedelta(days=1)
            
            # Ensure we don't create duplicate meetings/messages
            if not Meeting.objects.filter(student=instance.student, mentor=instance.mentor, scheduled_time=scheduled_time).exists():
                print(f"[SIGNAL] No existing meeting found, creating new meeting for booking id={instance.id}")
                # Create meeting
                meeting = Meeting.objects.create(
                    mentor=instance.mentor,
                    student=instance.student,
                    title=instance.subject,
                    description=f"Meeting for subject: {instance.subject}",
                    scheduled_time=scheduled_time,
                    duration=60
                    # Do not set meeting_link here so the model auto-generates it
                )
                print(f"[SIGNAL] Meeting created: id={meeting.id}, meeting_id={meeting.meeting_id}")
                # Create message for mentor
                # Convert UTC time to IST for display
                meeting_time_ist = meeting.scheduled_time.astimezone(IST)
                msg = MentorMessage.objects.create(
                    mentor=instance.mentor,
                    subject="New Booking Confirmed",
                    message=(
                        f"You have a new booking with {instance.student.name}.\n\n"
                        f"Subject: {instance.subject}\n"
                        f"Service: {instance.service}\n"
                        f"Amount: ₹{instance.service_price}\n"
                        f"Duration: {instance.service_duration}\n"
                        f"Scheduled at: {meeting_time_ist.strftime('%Y-%m-%d %I:%M %p')} IST\n"
                        f"Meeting ID: {meeting.meeting_id}\n"
                        f"Meeting Link: {meeting.meeting_link}\n"
                        f"Your attendance key: {meeting.mentor_attendance_key}\n"
                        f"You will need to provide this key to your student after the meeting to mark attendance.\n\n"
                        f"Please join the meeting a few minutes before the scheduled time. "
                        f"For the best experience, set up a free account at https://meet.jit.si/ if you want moderator controls or to avoid any joining issues.\n\n"
                        f"Warning: If you want to reschedule the meeting, you must do it at least 2 hours before the start of the meeting."
                    ),
                    admin_sender=None  # You can also use instance.student.user if sender needs to be student's User
                )
                # Create message for student
                student_msg = StudentMessage.objects.create(
                    student=instance.student,
                    subject="Booking Confirmed with Mentor",
                    message=(
                        f"Your booking with {instance.mentor.name} is confirmed.\n\n"
                        f"Subject: {instance.subject}\n"
                        f"Service: {instance.service}\n"
                        f"Amount Paid: ₹{instance.service_price}\n"
                        f"Duration: {instance.service_duration}\n"
                        f"Scheduled at: {meeting_time_ist.strftime('%Y-%m-%d %I:%M %p')} IST\n"
                        f"Meeting ID: {meeting.meeting_id}\n"
                        f"Meeting Link: {meeting.meeting_link}\n"
                        f"Your attendance key: {meeting.student_attendance_key}\n"
                        f"You will need to provide this key to your mentor after the meeting to mark attendance."
                    ),
                    sender=None  # You can also use instance.mentor.user if sender needs to be mentor's User
                )
                print(f"[SIGNAL] Mentor and student messages created for meeting id={meeting.id}")
            else:
                print(f"[SIGNAL] Meeting already exists for booking id={instance.id}")
        except Exception as e:
            print(f"[SIGNAL][ERROR] Exception in handle_booking_payment: {e}")
            traceback.print_exc()  # Print the full traceback for debugging



