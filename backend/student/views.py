from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from .models import Student
from .serializers import (
    StudentSerializer,
    StudentRegistrationSerializer,
    StudentLoginSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

# mentor/views.py
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

# class StudentLoginAPIView(APIView):
#     permission_classes = (permissions.AllowAny,)
    
#     def post(self, request):
#         serializer = StudentLoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         student = serializer.validated_data['student']
#         token, created = Token.objects.get_or_create(user=student)
#         return Response({
#             'student': StudentSerializer(student).data,
#             'token': token.key,
#             'message': 'Login successful'
#         }, status=status.HTTP_200_OK)

class StudentProfileAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        student = request.user
        serializer = StudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)