from django.urls import path
from . import views

urlpatterns = [
    path('google/auth/', views.GoogleOAuthView.as_view(), name='google_auth'),
    path('google/callback/', views.GoogleOAuthCallbackView.as_view(), name='google_callback'),
    path('google/verify/', views.GoogleTokenVerificationView.as_view(), name='google_verify'),
] 