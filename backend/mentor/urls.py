# urls.py
from django.urls import path
from .views import *

urlpatterns = [
    path('register/', MentorRegistrationAPIView.as_view(), name='mentor-register'),
    path('login/', MentorLoginAPIView.as_view(), name='mentor-login'),

    path('profile/', MentorProfileAPIView.as_view(), name='mentor-profile'),
    path('profile/update/', MentorProfileUpdateAPIView.as_view(), name='mentor-profile-update'),
    path('profile/cv/', MentorFileUploadAPIView.as_view(), name='mentor-cv-update'),
    
    path('public/', PublicMentorListView.as_view(), name='public-mentor-list'),
    path('public/<str:mentor_id>/', PublicMentorDetailView.as_view(), name='public-mentor-detail'),

    path('feature/', filtered_mentor_list, name='mentor-feature-list'),
    path('filter/', filtered_mentor_list, name='filtered-mentor-list'),

    path('notes/', MentorNoteListCreateView.as_view(), name='mentor-notes'),
    path('notes/<int:note_id>/', MentorNoteDeleteView.as_view(), name='mentor-note-delete'),

    path('earnings/', MentorEarningsAPIView.as_view(), name='mentor-earnings'),
    path('withdrawals/', MentorWithdrawalAPIView.as_view(), name='mentor-withdrawals'),
    path('earnings/export/', MentorEarningsExportAPIView.as_view(), name='mentor-earnings-export'),
]