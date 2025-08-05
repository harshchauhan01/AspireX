from django.urls import path
from .views import UnifiedLoginAPIView, UnifiedRegisterAPIView, GoogleOAuthView, GoogleOAuthCallbackView, GoogleTokenVerificationView

urlpatterns = [
    path('unified-login/', UnifiedLoginAPIView.as_view(), name='unified-login'),
    path('unified-register/', UnifiedRegisterAPIView.as_view(), name='unified-register'),
    path('google/auth/', GoogleOAuthView.as_view(), name='google-auth'),
    path('google/callback/', GoogleOAuthCallbackView.as_view(), name='google-callback'),
    path('google/verify/', GoogleTokenVerificationView.as_view(), name='google-verify'),
] 