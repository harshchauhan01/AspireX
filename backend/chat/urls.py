from django.urls import path
from .views import *
from .views import ContactMessageAPIView

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list'),
    path('conversations/<int:id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/<int:id>/send/', MessageCreateView.as_view(), name='message-create'),
    path('conversations/<int:id>/pin/', ConversationPinView.as_view(), name='conversation-pin'),
    path('conversations/<int:id>/unpin/', ConversationUnpinView.as_view(), name='conversation-unpin'),
    path('get-user-info/', GetUserInfoView.as_view()),
    path('contact/', ContactMessageAPIView.as_view(), name='contact-message'),
]