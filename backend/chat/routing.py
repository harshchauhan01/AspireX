from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<user1>\w+)/(?P<user2>\w+)/$', ChatConsumer.as_asgi()),
]
