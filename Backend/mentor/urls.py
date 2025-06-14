# urls.py
from django.urls import path
from .views import *

urlpatterns = [
    path('register/', MentorRegistrationAPIView.as_view(), name='mentor-register'),
    path('login/', MentorLoginAPIView.as_view(), name='mentor-login'),
    path('profile/', MentorProfileAPIView.as_view(), name='mentor-profile'),
    path('public/', PublicMentorListView.as_view(), name='public-mentor-list'),
    path('public/<str:mentor_id>/', PublicMentorListView.as_view(), name='public-mentor-detail'),
    
    
]