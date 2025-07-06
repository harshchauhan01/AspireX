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

class MentorViewSet(viewsets.ModelViewSet):
    queryset = Mentor.objects.all()
    serializer_class = MentorSerializer
    permission_classes = [permissions.IsAuthenticated]


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




from rest_framework.authentication import TokenAuthentication
class MentorProfileAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        mentor = request.user
        # print("User:", request.user)
        serializer = MentorSerializer(mentor)
        # print(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


from .models import *

class MentorRegistrationAPIView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MentorRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mentor = serializer.save()
        token = MentorToken.objects.create(user=mentor)
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
    




from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Mentor
from .serializers import MentorSerializer

class PublicMentorListView(generics.ListAPIView):
    queryset = Mentor.objects.all().order_by('mentor_id')
    serializer_class = MentorSerializer
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



# Add to your views.py
class MentorProfileUpdateAPIView(APIView):
    authentication_classes = [MentorTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        # print("Received data:", request.data)
        mentor = request.user
        serializer = MentorSerializer(mentor, data=request.data, partial=True)
        
        if serializer.is_valid():
            print("Valid data, saving...")
            serializer.save()
            print("After save:", MentorSerializer(mentor).data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        print("Validation errors:", serializer.errors)
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
    



from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q

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