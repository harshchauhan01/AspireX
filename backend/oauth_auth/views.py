from django.shortcuts import redirect
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from google.oauth2 import id_token
from google.auth.transport import requests
import requests as http_requests
import secrets
import string
from student.models import Student
from mentor.models import Mentor
from utils import send_credentials_email
import logging

logger = logging.getLogger(__name__)

def generate_strong_password(length=8):
    """Generate a strong 8-character password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    # Ensure at least one of each type
    password = (
        secrets.choice(string.ascii_lowercase) +
        secrets.choice(string.ascii_uppercase) +
        secrets.choice(string.digits) +
        secrets.choice(string.punctuation)
    )
    # Fill the rest with random characters
    password += ''.join(secrets.choice(characters) for _ in range(length - 4))
    # Shuffle the password
    password_list = list(password)
    secrets.SystemRandom().shuffle(password_list)
    return ''.join(password_list)

class GoogleOAuthView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Generate Google OAuth URL"""
        client_id = settings.GOOGLE_OAUTH2_CLIENT_ID
        redirect_uri = settings.GOOGLE_OAUTH2_REDIRECT_URI
        scope = ' '.join(settings.GOOGLE_OAUTH2_SCOPES)
        
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope={scope}&"
            f"access_type=offline"
        )
        
        return Response({
            'auth_url': auth_url
        }, status=status.HTTP_200_OK)

class GoogleOAuthCallbackView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle Google OAuth callback with authorization code"""
        try:
            auth_code = request.data.get('code')
            user_type = request.data.get('user_type', 'student')  # 'student' or 'mentor'
            
            if not auth_code:
                return Response({
                    'error': 'Authorization code is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Exchange authorization code for access token
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
                'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                'code': auth_code,
                'grant_type': 'authorization_code',
                'redirect_uri': settings.GOOGLE_OAUTH2_REDIRECT_URI,
            }
            
            token_response = http_requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            token_info = token_response.json()
            
            # Get user info using access token
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {'Authorization': f"Bearer {token_info['access_token']}"}
            user_response = http_requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_info = user_response.json()
            
            # Extract user information
            email = user_info.get('email')
            name = user_info.get('name', '')
            google_id = user_info.get('id')
            
            if not email:
                return Response({
                    'error': 'Email not provided by Google'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            user = None
            if user_type == 'student':
                try:
                    user = Student.objects.get(email=email)
                except Student.DoesNotExist:
                    # Create new student
                    password = generate_strong_password()
                    user = Student.objects.create_user(
                        email=email,
                        name=name,
                        password=password
                    )
                    # Send credentials email
                    send_credentials_email(
                        email=email,
                        username=user.student_id,
                        password=password,
                        name=name,
                        user_type='student'
                    )
            else:  # mentor
                try:
                    user = Mentor.objects.get(email=email)
                except Mentor.DoesNotExist:
                    # Create new mentor
                    password = generate_strong_password()
                    user = Mentor.objects.create_user(
                        email=email,
                        name=name,
                        password=password
                    )
                    # Send credentials email
                    send_credentials_email(
                        email=email,
                        username=user.mentor_id,
                        password=password,
                        name=name,
                        user_type='mentor'
                    )
            
            # Generate token
            token, created = Token.objects.get_or_create(user=user)
            
            # Return user data and token
            user_data = {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'user_type': user_type,
            }
            
            if user_type == 'student':
                user_data['student_id'] = user.student_id
            else:
                user_data['mentor_id'] = user.mentor_id
            
            return Response({
                'user': user_data,
                'token': token.key,
                'message': 'Google authentication successful'
            }, status=status.HTTP_200_OK)
            
        except http_requests.RequestException as e:
            logger.error(f"Google OAuth error: {e}")
            return Response({
                'error': 'Failed to authenticate with Google'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in Google OAuth: {e}")
            return Response({
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GoogleTokenVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Verify Google ID token and authenticate user"""
        try:
            id_token_str = request.data.get('id_token')
            user_type = request.data.get('user_type', 'student')
            
            if not id_token_str:
                return Response({
                    'error': 'ID token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the ID token
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                requests.Request(), 
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            # Extract user information
            email = idinfo['email']
            name = idinfo.get('name', '')
            google_id = idinfo['sub']
            
            # Check if user exists
            user = None
            if user_type == 'student':
                try:
                    user = Student.objects.get(email=email)
                except Student.DoesNotExist:
                    # Create new student
                    password = generate_strong_password()
                    user = Student.objects.create_user(
                        email=email,
                        name=name,
                        password=password
                    )
                    # Send credentials email
                    send_credentials_email(
                        email=email,
                        username=user.student_id,
                        password=password,
                        name=name,
                        user_type='student'
                    )
            else:  # mentor
                try:
                    user = Mentor.objects.get(email=email)
                except Mentor.DoesNotExist:
                    # Create new mentor
                    password = generate_strong_password()
                    user = Mentor.objects.create_user(
                        email=email,
                        name=name,
                        password=password
                    )
                    # Send credentials email
                    send_credentials_email(
                        email=email,
                        username=user.mentor_id,
                        password=password,
                        name=name,
                        user_type='mentor'
                    )
            
            # Generate token
            token, created = Token.objects.get_or_create(user=user)
            
            # Return user data and token
            user_data = {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'user_type': user_type,
            }
            
            if user_type == 'student':
                user_data['student_id'] = user.student_id
            else:
                user_data['mentor_id'] = user.mentor_id
            
            return Response({
                'user': user_data,
                'token': token.key,
                'message': 'Google authentication successful'
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error(f"Invalid Google ID token: {e}")
            return Response({
                'error': 'Invalid Google ID token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error in Google token verification: {e}")
            return Response({
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
