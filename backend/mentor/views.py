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
        print("User:", request.user)
        serializer = MentorSerializer(mentor)
        print(serializer.data)
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
    




class PublicMentorListView(generics.ListAPIView):
    queryset = Mentor.objects.all().order_by('mentor_id')
    serializer_class = MentorSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination
    page_size = 20  # Default page size
    page_size_query_param = 'page_size'
    max_page_size = 100
    lookup_field = 'mentor_id'

    def get_object(self):
        mentor_id = self.kwargs.get('mentor_id')
        try:
            return self.queryset.get(mentor_id=mentor_id)
        except Mentor.DoesNotExist:
            raise NotFound(f"Mentor with mentor_id {mentor_id} does not exist.")
        


