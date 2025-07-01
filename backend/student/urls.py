from django.urls import path,include
from rest_framework.routers import DefaultRouter
from . import views


urlpatterns = [
    path('register/', views.StudentRegistrationAPIView.as_view(), name='register'),
    path('login/', views.StudentLoginAPIView.as_view(), name='login'),
    path('profile/', views.StudentProfileAPIView.as_view(), name='profile'),
    path('profile/update/', views.StudentProfileUpdateAPIView.as_view(), name='student-profile-update'),
    path('profile/file/', views.StudentFileUploadAPIView.as_view(), name='student-cv-update'),
    path('booking/', views.BookingCreateAPIView.as_view(), name='booking-create'),
    path('public/', views.PublicStudentListView.as_view(), name='public-student-list'),
]