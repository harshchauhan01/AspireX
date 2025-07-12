from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .models import Student
from .serializers import *
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import TokenAuthentication
from django.utils import timezone

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

class StudentRegistrationAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = StudentRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        token, created = Token.objects.get_or_create(user=student)
        return Response({
            'student': StudentSerializer(student).data,
            'token': token.key,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)



class StudentLoginAPIView(APIView):
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
        student = request.user
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
                
            if student.details.cv:
                student.details.cv.delete()
                
            student.details.cv = cv_file
            student.details.save()
            
            return Response(
                {"cv_url": student.details.cv.url},
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
                
            if student.details.profile_photo:
                student.details.profile_photo.delete()
                
            student.details.profile_photo = profile_photo
            student.details.save()
            
            return Response(
                {"profile_photo_url": student.details.profile_photo.url},
                status=status.HTTP_200_OK
            )
            
        return Response(
            {"error": "No file provided"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def delete(self, request):
        student = request.user
        file_type = request.data.get('type')  # 'cv' or 'profile_photo'
        
        if file_type == 'cv' and student.details.cv:
            student.details.cv.delete()
            student.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        elif file_type == 'profile_photo' and student.details.profile_photo:
            student.details.profile_photo.delete()
            student.details.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
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
    queryset = Student.objects.all().order_by('student_id')
    serializer_class = StudentSerializer
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
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
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