from django.urls import path
from .views import *

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/send/', MessageCreateView.as_view(), name='message-create'),
    path('get-user-info/', GetUserInfoView.as_view()),

]