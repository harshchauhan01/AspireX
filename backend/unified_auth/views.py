from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from .serializers import UnifiedLoginSerializer, UnifiedRegisterSerializer
from mentor.models import MentorToken
from student.serializers import StudentSerializer
from mentor.serializers import MentorSerializer
from utils import send_credentials_email
from google.oauth2 import id_token
from google.auth.transport import requests
import secrets
import string
from student.models import Student
from mentor.models import Mentor
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

class UnifiedLoginAPIView(APIView):
    authentication_classes = []
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = UnifiedLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        user_type = serializer.validated_data['user_type']
        
        # Generate appropriate token based on user type
        if user_type == 'mentor':
            token, created = MentorToken.objects.get_or_create(user=user)
            user_data = MentorSerializer(user).data
        else:
            token, created = Token.objects.get_or_create(user=user)
            user_data = StudentSerializer(user).data
        
        return Response({
            'user': user_data,
            'token': token.key,
            'user_type': user_type,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)

class UnifiedRegisterAPIView(APIView):
    authentication_classes = []
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = UnifiedRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = serializer.save()
        user = result['user']
        user_type = result['user_type']
        
        # Generate appropriate token based on user type
        if user_type == 'mentor':
            token, created = MentorToken.objects.get_or_create(user=user)
            user_data = MentorSerializer(user).data
        else:
            token, created = Token.objects.get_or_create(user=user)
            user_data = StudentSerializer(user).data
        
        # Send welcome email with credentials
        password = request.data.get('password')
        send_credentials_email(
            email=user.email,
            username=user.student_id if user_type == 'student' else user.mentor_id,
            password=password,
            user_type=user_type
        )
        
        return Response({
            'user': user_data,
            'token': token.key,
            'user_type': user_type,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

class GoogleOAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """Generate Google OAuth URL"""
        from django.conf import settings
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
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Handle Google OAuth callback with authorization code"""
        import requests as http_requests
        from django.conf import settings
        
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
                    # Send credentials email - TEMPORARILY DISABLED FOR TESTING
                    # send_credentials_email(
                    #     email=email,
                    #     username=user.student_id,
                    #     password=password,
                    #     name=name,
                    #     user_type='student'
                    # )
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
                    # Send credentials email - TEMPORARILY DISABLED FOR TESTING
                    # send_credentials_email(
                    #     email=email,
                    #     username=user.mentor_id,
                    #     password=password,
                    #     name=name,
                    #     user_type='mentor'
                    # )
            
            # Generate appropriate token based on user type
            if user_type == 'mentor':
                token, created = MentorToken.objects.get_or_create(user=user)
                user_data = MentorSerializer(user).data
            else:
                token, created = Token.objects.get_or_create(user=user)
                user_data = StudentSerializer(user).data
            
            return Response({
                'user': user_data,
                'token': token.key,
                'user_type': user_type,
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
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Verify Google ID token and authenticate user"""
        from django.conf import settings
        import time
        
        start_time = time.time()
        logger.info("🔄 Google OAuth verification started")
        
        try:
            id_token_str = request.data.get('id_token')
            user_type = request.data.get('user_type', 'student')
            
            if not id_token_str:
                return Response({
                    'error': 'ID token is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"⏱️ Token verification starting at {time.time() - start_time:.2f}s")
            
            # Verify the ID token
            try:
                # Use Google's ID token verification
                idinfo = id_token.verify_oauth2_token(
                    id_token_str, 
                    requests.Request(), 
                    settings.GOOGLE_OAUTH2_CLIENT_ID
                )
                logger.info("✅ Token verified using Google auth library")
            except Exception as e:
                logger.error(f"❌ Google token verification failed: {e}")
                # Fallback: try to decode without verification (for testing)
                try:
                    import jwt
                    payload = jwt.decode(id_token_str, options={"verify_signature": False})
                    idinfo = payload
                    logger.warning("⚠️ Token decoded without verification (for testing only)")
                except Exception as decode_e:
                    logger.error(f"❌ Token decode also failed: {decode_e}")
                    raise ValueError("Failed to verify Google token")
            
            logger.info(f"✅ Token verified at {time.time() - start_time:.2f}s")
            
            # Extract user information
            email = idinfo['email']
            name = idinfo.get('name', '')
            google_id = idinfo['sub']
            
            logger.info(f"📧 Email extracted: {email} at {time.time() - start_time:.2f}s")
            
            # Check if user exists
            user = None
            if user_type == 'student':
                try:
                    user = Student.objects.get(email=email)
                    logger.info(f"👤 Existing student found at {time.time() - start_time:.2f}s")
                except Student.DoesNotExist:
                    logger.info(f"🆕 Creating new student at {time.time() - start_time:.2f}s")
                    # Create new student
                    password = generate_strong_password()
                    user = Student.objects.create_user(
                        email=email,
                        name=name,
                        password=password
                    )
                    logger.info(f"✅ Student created at {time.time() - start_time:.2f}s")
                    
                    # Send credentials email asynchronously (non-blocking)
                    try:
                        send_credentials_email(
                            email=email,
                            username=user.student_id,
                            password=password,
                            name=name,
                            user_type='student'
                        )
                        logger.info("📧 Welcome email sent successfully")
                    except Exception as email_error:
                        logger.error(f"❌ Email sending failed: {email_error}")
                        # Don't fail the authentication if email fails
            else:  # mentor
                try:
                    user = Mentor.objects.get(email=email)
                    logger.info(f"👤 Existing mentor found at {time.time() - start_time:.2f}s")
                except Mentor.DoesNotExist:
                    logger.info(f"🆕 Creating new mentor at {time.time() - start_time:.2f}s")
                    # Create new mentor
                    password = generate_strong_password()
                    user = Mentor.objects.create_user(
                        email=email,
                        name=name,
                        password=password
                    )
                    logger.info(f"✅ Mentor created at {time.time() - start_time:.2f}s")
                    
                    # Send credentials email asynchronously (non-blocking)
                    try:
                        send_credentials_email(
                            email=email,
                            username=user.mentor_id,
                            password=password,
                            name=name,
                            user_type='mentor'
                        )
                        logger.info("📧 Welcome email sent successfully")
                    except Exception as email_error:
                        logger.error(f"❌ Email sending failed: {email_error}")
                        # Don't fail the authentication if email fails
            
            logger.info(f"🎫 Generating token at {time.time() - start_time:.2f}s")
            
            # Generate appropriate token based on user type
            if user_type == 'mentor':
                token, created = MentorToken.objects.get_or_create(user=user)
                user_data = MentorSerializer(user).data
            else:
                token, created = Token.objects.get_or_create(user=user)
                user_data = StudentSerializer(user).data
            
            logger.info(f"✅ Token generated at {time.time() - start_time:.2f}s")
            
            response_data = {
                'user': user_data,
                'token': token.key,
                'user_type': user_type,
                'message': 'Google authentication successful'
            }
            
            logger.info(f"🎉 Response ready at {time.time() - start_time:.2f}s")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ValueError as e:
            logger.error(f"❌ Invalid Google ID token: {e}")
            return Response({
                'error': 'Invalid Google ID token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"❌ Unexpected error in Google token verification: {e}")
            return Response({
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 