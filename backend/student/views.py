from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .models import Student, StudentNote, Feedback
from .serializers import *
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import TokenAuthentication
from django.utils import timezone
from utils import send_credentials_email
from .serializers import PublicStudentSerializer
import logging
logger = logging.getLogger(__name__)
from django.core.files.storage import default_storage
import os
from decouple import config
from supabase import create_client, Client
SUPABASE_URL = config('SUPABASE_URL')
SUPABASE_KEY = config('SUPABASE_KEY')
SUPABASE_BUCKET = config('SUPABASE_BUCKET', default='user-uploads')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
import mimetypes

def extract_supabase_path(url):
    # Example: https://<project>.supabase.co/storage/v1/object/public/user-uploads/student/cvs/filename.pdf
    # Returns: student/cvs/filename.pdf
    if not url:
        return None
    parts = url.split('/')
    try:
        idx = parts.index(SUPABASE_BUCKET)
        return '/'.join(parts[idx+1:])
    except ValueError:
        return None

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

class StudentRegistrationAPIView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = (permissions.AllowAny,)
    serializer_class = StudentRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        token, created = Token.objects.get_or_create(user=student)
        # Send welcome email with credentials
        password = request.data.get('password')
        send_credentials_email(
            email=student.email,
            username=student.student_id,
            password=password,
            name=getattr(student, 'name', None)
        )
        return Response({
            'student': StudentSerializer(student).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)



class StudentLoginAPIView(APIView):
    authentication_classes = []
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.validated_data['student']
        token, created = Token.objects.get_or_create(user=student)
        return Response({
            'student': StudentSerializer(student).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class StudentProfileAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    
    def get(self, request):
        student = request.user
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class StudentProfileUpdateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        student = request.user
        serializer = StudentSerializer(student, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class StudentFileUploadAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        logger.info(f"Current storage backend: {default_storage.__class__}")
        student = request.user
        cv_file = request.FILES.get('cv')
        profile_photo = request.FILES.get('profile_photo')
        
        if cv_file:
            valid_extensions = ['.pdf', '.doc', '.docx']
            ext = os.path.splitext(cv_file.name)[1].lower()
            if ext not in valid_extensions:
                logger.warning(f"Rejected CV upload: {cv_file.name} (invalid extension)")
                return Response(
                    {"error": "Invalid file type. Only PDF, DOC, and DOCX are allowed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            content_type, _ = mimetypes.guess_type(cv_file.name)
            file_options = {"content-type": content_type or "application/octet-stream"}
            file_path = f"student/cvs/{cv_file.name}"
            # Delete old file if exists (from the URL in the model)
            if student.details.cv:
                old_path = extract_supabase_path(student.details.cv)
                if old_path:
                    supabase.storage.from_(SUPABASE_BUCKET).remove([old_path])
            # Always try to delete the file at the target path before uploading
            supabase.storage.from_(SUPABASE_BUCKET).remove([file_path])
            res = supabase.storage.from_(SUPABASE_BUCKET).upload(file_path, cv_file.read(), file_options=file_options)
            public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
            student.details.cv = public_url
            student.details.save()
            logger.info(f"CV URL after upload: {public_url}")
            return Response(
                {"cv_url": public_url},
                status=status.HTTP_200_OK
            )
        elif profile_photo:
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            ext = os.path.splitext(profile_photo.name)[1].lower()
            if ext not in valid_extensions:
                logger.warning(f"Rejected profile photo upload: {profile_photo.name} (invalid extension)")
                return Response(
                    {"error": "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            content_type, _ = mimetypes.guess_type(profile_photo.name)
            file_options = {"content-type": content_type or "application/octet-stream"}
            file_path = f"student/profile_photos/{profile_photo.name}"
            # Delete old file if exists (from the URL in the model)
            if student.details.profile_photo:
                old_path = extract_supabase_path(student.details.profile_photo)
                if old_path:
                    supabase.storage.from_(SUPABASE_BUCKET).remove([old_path])
            # Always try to delete the file at the target path before uploading
            supabase.storage.from_(SUPABASE_BUCKET).remove([file_path])
            res = supabase.storage.from_(SUPABASE_BUCKET).upload(file_path, profile_photo.read(), file_options=file_options)
            public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
            student.details.profile_photo = public_url
            student.details.save()
            logger.info(f"Profile photo URL after upload: {public_url}")
            return Response(
                {"profile_photo_url": public_url},
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "No file provided"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def delete(self, request):
        student = request.user
        file_type = request.query_params.get('type') or request.data.get('type')  # Support both query param and body
        logger.info(f"DELETE /api/student/profile/file/ called with type={file_type}")
        if not file_type:
            logger.warning("No 'type' parameter provided in DELETE request.")
            return Response(
                {"error": "Missing 'type' parameter. Use ?type=profile_photo or ?type=cv in the URL."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if file_type == 'cv' and student.details.cv:
            # Remove from Supabase if possible
            old_path = extract_supabase_path(student.details.cv)
            if old_path:
                supabase.storage.from_(SUPABASE_BUCKET).remove([old_path])
            student.details.cv = None
            student.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif file_type == 'profile_photo' and student.details.profile_photo:
            student.details.profile_photo = None
            student.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        logger.warning(f"No {file_type} to delete for user {student}")
        return Response(
            {"error": f"No {file_type} to delete"},
            status=status.HTTP_400_BAD_REQUEST
        )
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from .models import Booking
from .serializers import BookingSerializer
from mentor.models import Mentor

class BookingCreateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import generics
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Student
from .serializers import StudentSerializer

class PublicStudentListView(generics.ListAPIView):
    authentication_classes = []
    queryset = Student.objects.all().order_by('student_id')
    serializer_class = PublicStudentSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    lookup_field = 'student_id'

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(student_id__icontains=search)
            )
        return queryset

class PublicStudentDetailView(RetrieveAPIView):
    authentication_classes = []
    queryset = Student.objects.all()
    serializer_class = PublicStudentSerializer
    permission_classes = [AllowAny]
    lookup_field = 'student_id'
    lookup_url_kwarg = 'student_id'
    

    

class StudentNoteListCreateView(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentNoteSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            return StudentNote.objects.filter(student=user)
        except Student.DoesNotExist:
            return StudentNote.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class StudentNoteDeleteView(generics.DestroyAPIView):
    serializer_class = StudentNoteSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'note_id'

    def get_queryset(self):
        return StudentNote.objects.filter(student=self.request.user)

from rest_framework import generics
from .serializers import FeedbackSerializer

class FeedbackCreateAPIView(generics.CreateAPIView):
    """
    Create feedback for a mentor after a meeting
    """
    serializer_class = FeedbackSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("FEEDBACK POST DATA:", request.data)
        serializer = self.get_serializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            print("FEEDBACK ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Additional check for duplicate feedback
        meeting_id = request.data.get('meeting_id')
        if meeting_id:
            from mentor.models import Meeting
            try:
                meeting = Meeting.objects.get(meeting_id=meeting_id)
                existing_feedback = Feedback.objects.filter(student=request.user, meeting=meeting)
                if existing_feedback.exists():
                    return Response({
                        'meeting_id': ['You have already submitted feedback for this meeting.']
                    }, status=status.HTTP_400_BAD_REQUEST)
            except Meeting.DoesNotExist:
                return Response({
                    'meeting_id': ['Meeting not found.']
                }, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class FeedbackListAPIView(generics.ListAPIView):
    """
    List all feedback given by the authenticated student
    """
    serializer_class = FeedbackSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(student=self.request.user)

class FeedbackDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific feedback
    """
    serializer_class = FeedbackSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(student=self.request.user)

class MentorFeedbackListAPIView(generics.ListAPIView):
    """
    List all approved feedback for a specific mentor (public view)
    """
    authentication_classes = []
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        mentor_id = self.kwargs.get('mentor_id')
        return Feedback.objects.filter(
            mentor__mentor_id=mentor_id,
            is_approved=True
        )

class CheckFeedbackExistsAPIView(APIView):
    """
    Check if feedback exists for a specific meeting
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, meeting_id):
        try:
            from mentor.models import Meeting
            meeting = Meeting.objects.get(meeting_id=meeting_id)
            existing_feedback = Feedback.objects.filter(student=request.user, meeting=meeting).first()
            
            if existing_feedback:
                return Response({
                    'exists': True,
                    'feedback': {
                        'rating': existing_feedback.rating,
                        'feedback_text': existing_feedback.feedback_text,
                        'created_at': existing_feedback.created_at
                    }
                })
            else:
                return Response({'exists': False})
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework import generics
from .serializers import FeedbackSerializer, StudentMessageSerializer
from .models import Feedback, StudentMessage

class StudentMessageListAPIView(generics.ListAPIView):
    """
    List all messages for the authenticated student
    """
    serializer_class = StudentMessageSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentMessage.objects.filter(student=self.request.user).order_by('-sent_at')

class StudentMessageDetailAPIView(generics.RetrieveAPIView):
    """
    Retrieve a specific message for the authenticated student
    """
    serializer_class = StudentMessageSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudentMessage.objects.filter(student=self.request.user)

class StudentMessageMarkAsReadAPIView(APIView):
    """
    Mark a message as read
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, message_id):
        try:
            message = StudentMessage.objects.get(
                id=message_id, 
                student=request.user
            )
            message.mark_as_read()
            return Response({'status': 'Message marked as read'}, status=status.HTTP_200_OK)
        except StudentMessage.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)