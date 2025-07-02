# chat/urls.py
from django.urls import path
from .views import MessageListCreateView

urlpatterns = [
    path('<int:other_user_id>/', MessageListCreateView.as_view(), name='chat')
]
