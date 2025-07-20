from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .models import *
from .serializers import *
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import status
from rest_framework import generics
from .serializers import MentorRegistrationSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.db import models
from django.utils import timezone
from utils import send_credentials_email
from .serializers import PublicMentorSerializer
from rest_framework.authentication import TokenAuthentication as DRFTokenAuthentication
from rest_framework.authentication import get_authorization_header
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import RetrieveAPIView
from django.db.models import Q
from .models import Mentor
from .serializers import MentorSerializer
from mentor.models import Meeting, MeetingAttendance, Mentor
from rest_framework.permissions import IsAuthenticated
from student.models import Student
from student.models import StudentMessage

from django.utils.dateparse import parse_datetime
from django.utils import timezone

class MentorTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # print("🚨 HEADERS:", request.headers)
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Token '):
            return None

        token_key = auth_header.split('Token ')[1]
        try:
            token = MentorToken.objects.get(key=token_key)
            return (token.user, None)
        except MentorToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token')



class MentorMeetingRescheduleAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, meeting_id):
        mentor = request.user
        new_time_str = request.data.get('new_time')
        if not new_time_str:
            return Response({'error': 'New time is required.'}, status=400)
        new_time = parse_datetime(new_time_str)
        if not new_time:
            return Response({'error': 'Invalid datetime format.'}, status=400)
        new_time = timezone.make_aware(new_time) if timezone.is_naive(new_time) else new_time
        try:
            meeting = Meeting.objects.get(meeting_id=meeting_id, mentor=mentor)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found.'}, status=404)
        now = timezone.now()
        if (meeting.scheduled_time - now).total_seconds() < 2 * 60 * 60:
            return Response({'error': 'Cannot reschedule less than 2 hours before the meeting.'}, status=400)
        if (new_time - now).total_seconds() < 2 * 60 * 60:
            return Response({'error': 'New meeting time must be at least 2 hours from now.'}, status=400)
        meeting.scheduled_time = new_time
        meeting.save(update_fields=['scheduled_time'])
        # Notify student
        if meeting.student:
            StudentMessage.objects.create(
                student=meeting.student,
                sender=None,  # Sender must be a Student instance; None for system/mentor
                subject="Your meeting has been rescheduled",
                message=f"Your meeting '{meeting.title}' with {mentor.name} has been rescheduled to {new_time.strftime('%Y-%m-%d %H:%M')}. If you have any problem, please contact customer support.",
            )
        return Response({'success': True, 'new_time': new_time}, status=200)


class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer
    permission_classes = [permissions.IsAuthenticated]


class MentorProfileAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        mentor = request.user
        # print("User:", request.user)
        serializer = MentorSerializer(mentor)
        # print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class MentorRegistrationAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MentorRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mentor = serializer.save()
        token = MentorToken.objects.create(user=mentor)
        # Send welcome email with credentials
        password = request.data.get('password')
        send_credentials_email(
            email=mentor.email,
            username=mentor.mentor_id,
            password=password,
            name=getattr(mentor, 'name', None)
        )
        return Response({
            'mentor': MentorSerializer(mentor).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

class MentorLoginAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = MentorLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mentor = serializer.validated_data['mentor']
        token, created = MentorToken.objects.get_or_create(user=mentor)
        return Response({
            'mentor': MentorSerializer(mentor).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    




class PublicMentorListView(generics.ListAPIView):
    queryset = Mentor.objects.all().order_by('mentor_id')
    serializer_class = PublicMentorSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    lookup_field = 'mentor_id'

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(mentor_id__icontains=search)
            )
        return queryset

class PublicMentorDetailView(RetrieveAPIView):
    queryset = Mentor.objects.all()
    serializer_class = PublicMentorSerializer
    permission_classes = [AllowAny]
    lookup_field = 'mentor_id'
    lookup_url_kwarg = 'mentor_id'



# Add to your views.py
class MentorProfileUpdateAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        # print("Received data:", request.data)
        mentor = request.user
        serializer = MentorSerializer(mentor, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MentorCVUpdateAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        mentor = request.user
        cv_file = request.FILES.get('cv')
        
        if not cv_file:
            return Response(
                {"error": "No file provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate file type
        valid_extensions = ['.pdf', '.doc', '.docx']
        if not any(cv_file.name.lower().endswith(ext) for ext in valid_extensions):
            return Response(
                {"error": "Invalid file type. Only PDF, DOC, and DOCX are allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if mentor.details.cv:
            mentor.details.cv.delete()
            
        mentor.details.cv = cv_file
        mentor.details.save()
        
        return Response(
            {"cv_url": mentor.details.cv.url},
            status=status.HTTP_200_OK
        )
    
    def delete(self, request):
        mentor = request.user
        if mentor.details.cv:
            mentor.details.cv.delete()
            mentor.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"error": "No CV to delete"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    


# Update your MentorCVUpdateAPIView to MentorFileUploadAPIView
class MentorFileUploadAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        mentor = request.user
        cv_file = request.FILES.get('cv')
        profile_photo = request.FILES.get('profile_photo')
        
        if cv_file:
            # Handle CV upload
            valid_extensions = ['.pdf', '.doc', '.docx']
            if not any(cv_file.name.lower().endswith(ext) for ext in valid_extensions):
                return Response(
                    {"error": "Invalid file type. Only PDF, DOC, and DOCX are allowed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if mentor.details.cv:
                mentor.details.cv.delete()
                
            mentor.details.cv = cv_file
            mentor.details.save()
            
            return Response(
                {"cv_url": mentor.details.cv.url},
                status=status.HTTP_200_OK
            )
            
        elif profile_photo:
            # Handle profile photo upload
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            if not any(profile_photo.name.lower().endswith(ext) for ext in valid_extensions):
                return Response(
                    {"error": "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            if mentor.details.profile_photo:
                mentor.details.profile_photo.delete()
                
            mentor.details.profile_photo = profile_photo
            mentor.details.save()
            
            return Response(
                {"profile_photo_url": mentor.details.profile_photo.url},
                status=status.HTTP_200_OK
            )
            
        return Response(
            {"error": "No file provided"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def delete(self, request):
        mentor = request.user
        file_type = request.data.get('type')  # 'cv' or 'profile_photo'
        
        if file_type == 'cv' and mentor.details.cv:
            mentor.details.cv.delete()
            mentor.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        elif file_type == 'profile_photo' and mentor.details.profile_photo:
            mentor.details.profile_photo.delete()
            mentor.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        return Response(
            {"error": f"No {file_type} to delete"},
            status=status.HTTP_400_BAD_REQUEST
        )
    


@api_view(['GET'])
@permission_classes([AllowAny])
def filtered_mentor_list(request):
    search = request.GET.get('search')
    category = request.GET.get('category')

    mentors = Mentor.objects.select_related('details').all()

    if search:
        mentors = mentors.filter(
        Q(name__icontains=search) |
        Q(details__professions__title__icontains=search)
    )

    if category:
        mentors = mentors.filter(details__professions__title__icontains=category)

    mentors = mentors.distinct()
    serializer = MentorSerializer(mentors, many=True)
    return Response(serializer.data)





class MentorNoteListCreateView(generics.ListCreateAPIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MentorNoteSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            return MentorNote.objects.filter(mentor=user)
        except Mentor.DoesNotExist:
            return MentorNote.objects.none()

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)

class MentorNoteDeleteView(generics.DestroyAPIView):
    serializer_class = MentorNoteSerializer
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'note_id'

    def get_queryset(self):
        return MentorNote.objects.filter(mentor=self.request.user)

# Earnings API Views
class MentorEarningsAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        mentor = request.user
        time_filter = request.query_params.get('time_filter', 'all')
        
        # Get earnings based on time filter
        earnings = Earning.objects.filter(mentor=mentor, status='completed')
        
        if time_filter == '7days':
            from datetime import timedelta
            earnings = earnings.filter(date__gte=timezone.now().date() - timedelta(days=7))
        elif time_filter == '30days':
            from datetime import timedelta
            earnings = earnings.filter(date__gte=timezone.now().date() - timedelta(days=30))
        elif time_filter == '3months':
            from datetime import timedelta
            earnings = earnings.filter(date__gte=timezone.now().date() - timedelta(days=90))
        
        # Calculate statistics - only positive earnings (exclude withdrawals)
        positive_earnings = earnings.filter(amount__gt=0)
        total_earnings = positive_earnings.aggregate(total=models.Sum('amount'))['total'] or 0
        total_sessions = positive_earnings.count()
        
        # Get unique students by extracting student names from source
        # Source format: "Session Type with Student Name"
        student_sources = positive_earnings.values_list('source', flat=True)
        unique_students = set()
        for source in student_sources:
            if 'with' in source.lower():
                # Extract student name after "with"
                student_name = source.split('with')[-1].strip()
                unique_students.add(student_name)
        total_students = len(unique_students)
        
        # Available balance (total positive earnings minus withdrawals)
        total_withdrawals = Withdrawal.objects.filter(
            mentor=mentor,
            status__in=['pending', 'approved', 'processed']
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        available_balance = total_earnings - total_withdrawals
        
        # Paginate earnings
        paginator = PageNumberPagination()
        paginator.page_size = 10
        paginated_earnings = paginator.paginate_queryset(earnings, request)
        
        earnings_serializer = EarningSerializer(paginated_earnings, many=True)
        
        return Response({
            'earnings': earnings_serializer.data,
            'stats': {
                'totalEarnings': float(total_earnings),
                'totalSessions': total_sessions,
                'totalStudents': total_students,
                'availableBalance': float(available_balance)
            },
            'pagination': {
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'current_page': paginator.page.number,
                'total_pages': paginator.page.paginator.num_pages
            }
        }, status=status.HTTP_200_OK)

class MentorWithdrawalAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all withdrawals for the mentor"""
        mentor = request.user
        withdrawals = Withdrawal.objects.filter(mentor=mentor).order_by('-request_date')
        serializer = WithdrawalSerializer(withdrawals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new withdrawal request"""
        mentor = request.user
        amount = request.data.get('amount')
        bank_details = request.data.get('bank_details', '')
        payment_method = request.data.get('payment_method', 'bank_transfer')
        
        if not amount:
            return Response(
                {"error": "Amount is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
        except ValueError:
            return Response(
                {"error": "Invalid amount"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check minimum withdrawal amount
        if amount < 50.00:
            return Response(
                {"error": "Minimum withdrawal amount is $50.00"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if mentor has sufficient balance
        # Get total positive earnings
        positive_earnings = Earning.objects.filter(
            mentor=mentor, 
            status='completed',
            amount__gt=0
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        # Get total withdrawals (pending, approved, processed)
        total_withdrawals = Withdrawal.objects.filter(
            mentor=mentor,
            status__in=['pending', 'approved', 'processed']
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        available_balance = float(positive_earnings) - float(total_withdrawals)
        
        if amount > available_balance:
            return Response(
                {"error": f"Insufficient balance. Available: ${available_balance:.2f}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create withdrawal record
        withdrawal_data = {
            'mentor': mentor,
            'amount': amount,
            'payment_method': payment_method,
            'bank_details': bank_details,
            'status': 'pending'
        }
        
        withdrawal = Withdrawal.objects.create(**withdrawal_data)
        serializer = WithdrawalSerializer(withdrawal)
        
        return Response({
            "message": f"Withdrawal request for ${amount} submitted successfully",
            "withdrawal": serializer.data
        }, status=status.HTTP_201_CREATED)

class MentorEarningsExportAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        mentor = request.user
        time_filter = request.query_params.get('time_filter', 'all')
        
        earnings = Earning.objects.filter(mentor=mentor, status='completed').order_by('-date')
        
        if time_filter == '7days':
            from datetime import timedelta
            earnings = earnings.filter(date__gte=timezone.now().date() - timedelta(days=7))
        elif time_filter == '30days':
            from datetime import timedelta
            earnings = earnings.filter(date__gte=timezone.now().date() - timedelta(days=30))
        elif time_filter == '3months':
            from datetime import timedelta
            earnings = earnings.filter(date__gte=timezone.now().date() - timedelta(days=90))
        
        earnings_serializer = EarningSerializer(earnings, many=True)
        
        return Response({
            'earnings': earnings_serializer.data,
            'export_date': timezone.now().isoformat(),
            'mentor_name': mentor.name,
            'mentor_id': mentor.mentor_id
        }, status=status.HTTP_200_OK)

class MentorFeedbackListAPIView(generics.ListAPIView):
    """
    List all feedback received by the authenticated mentor
    """
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MentorFeedbackSerializer
    
    def get_queryset(self):
        from student.models import Feedback
        return Feedback.objects.filter(mentor=self.request.user).order_by('-created_at')

class MentorFeedbackDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieve a specific feedback detail
    """
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MentorFeedbackSerializer
    
    def get_queryset(self):
        from student.models import Feedback
        return Feedback.objects.filter(mentor=self.request.user)

class MentorFeedbackStatsAPIView(APIView):
    """
    Get feedback statistics for the mentor
    """
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from student.models import Feedback
        from django.db.models import Avg, Count
        
        mentor = request.user
        feedbacks = Feedback.objects.filter(mentor=mentor)
        
        stats = {
            'total_feedback': feedbacks.count(),
            'average_rating': feedbacks.aggregate(Avg('rating'))['rating__avg'] or 0,
            'rating_distribution': feedbacks.values('rating').annotate(count=Count('rating')).order_by('rating'),
            'approved_feedback': feedbacks.filter(is_approved=True).count(),
            'pending_feedback': feedbacks.filter(is_approved=False).count(),
        }
        
        return Response(stats, status=status.HTTP_200_OK)





# Custom permission to allow both mentor and student tokens
class IsMentorOrStudentAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class DualTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() != b'token':
            return None
        token_key = auth[1].decode() if len(auth) > 1 else None
        # Try MentorTokenAuthentication
        from mentor.models import MentorToken
        try:
            mentor_token = MentorToken.objects.get(key=token_key)
            return (mentor_token.user, None)
        except MentorToken.DoesNotExist:
            pass
        # Try DRF TokenAuthentication (for students)
        user_auth_tuple = DRFTokenAuthentication().authenticate(request)
        if user_auth_tuple:
            return user_auth_tuple
        return None

@api_view(['GET', 'POST'])
@authentication_classes([DualTokenAuthentication])
@permission_classes([IsMentorOrStudentAuthenticated])
def record_meeting_attendance(request):
    if request.method == 'POST':
        meeting_id = request.data.get('meeting_id')
        role = request.data.get('role')  # 'mentor' or 'student'
        entered_key = request.data.get('attendance_key')
        if not meeting_id or role not in ['mentor', 'student'] or not entered_key:
            return Response({'error': 'meeting_id, role, and attendance_key are required.'}, status=400)
        try:
            meeting = Meeting.objects.get(meeting_id=meeting_id)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found.'}, status=404)
        user = request.user
        # Use isinstance for robust role validation
        if role == 'mentor' and not isinstance(user, Mentor):
            return Response({'error': 'Only mentors can record mentor attendance.'}, status=403)
        if role == 'student' and not isinstance(user, Student):
            return Response({'error': 'Only students can record student attendance.'}, status=403)
        # Cross-verification: mentor must enter student's key, student must enter mentor's key
        if role == 'mentor':
            if entered_key != meeting.student_attendance_key:
                return Response({'error': 'Invalid attendance key for mentor.'}, status=403)
            if meeting.mentor_attended:
                return Response({'message': 'Mentor attendance already marked.'}, status=200)
            meeting.mentor_attended = True
            meeting.mentor_attendance_time = timezone.now()
            meeting.save(update_fields=['mentor_attended', 'mentor_attendance_time'])
            # Create MeetingAttendance record
            MeetingAttendance.objects.get_or_create(
                meeting=meeting,
                user_id=user.mentor_id,
                role='mentor'
            )
            # If both attended, mark as completed
            if meeting.student_attended and meeting.mentor_attended:
                meeting.status = 'completed'
                meeting.save(update_fields=['status'])
            return Response({'success': True, 'message': 'Mentor attendance marked.'})
        elif role == 'student':
            if entered_key != meeting.mentor_attendance_key:
                return Response({'error': 'Invalid attendance key for student.'}, status=403)
            if meeting.student_attended:
                return Response({'message': 'Student attendance already marked.'}, status=200)
            meeting.student_attended = True
            meeting.student_attendance_time = timezone.now()
            meeting.save(update_fields=['student_attended', 'student_attendance_time'])
            # Create MeetingAttendance record
            MeetingAttendance.objects.get_or_create(
                meeting=meeting,
                user_id=user.student_id,
                role='student'
            )
            # If both attended, mark as completed
            if meeting.student_attended and meeting.mentor_attended:
                meeting.status = 'completed'
                meeting.save(update_fields=['status'])
            return Response({'success': True, 'message': 'Student attendance marked.'})
    elif request.method == 'GET':
        meeting_id = request.GET.get('meeting_id')
        if not meeting_id:
            return Response({'error': 'meeting_id is required.'}, status=400)
        try:
            meeting = Meeting.objects.get(meeting_id=meeting_id)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found.'}, status=404)
        attended_roles = []
        if meeting.mentor_attended:
            attended_roles.append('mentor')
        if meeting.student_attended:
            attended_roles.append('student')
        return Response({
            'student_attended': meeting.student_attended,
            'mentor_attended': meeting.mentor_attended,
            'student_attendance_time': meeting.student_attendance_time,
            'mentor_attendance_time': meeting.mentor_attendance_time,
            'attended_roles': attended_roles
        })




