# chat/authentication.py

from rest_framework.authentication import get_authorization_header
from rest_framework.authentication import TokenAuthentication as StudentTokenAuthentication
from mentor.views import MentorTokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class DualTokenAuthentication:
    def authenticate(self, request):
        # First try mentor token
        mentor_auth = MentorTokenAuthentication()
        try:
            user_auth = mentor_auth.authenticate(request)
            if user_auth:
                return user_auth
        except AuthenticationFailed:
            pass

        # Then try student token
        student_auth = StudentTokenAuthentication()
        try:
            user_auth = student_auth.authenticate(request)
            if user_auth:
                return user_auth
        except AuthenticationFailed:
            pass

        return None
