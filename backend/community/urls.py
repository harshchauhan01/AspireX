from django.urls import path
from .views import (
    CommunityPostListCreateView,
    MyPostsListView,
    LikePostView,
    CommentCreateView,
    PostCommentsListView,
    PostDeleteView,
    IncrementPostView,
)

urlpatterns = [
    path('posts/', CommunityPostListCreateView.as_view(), name='community-posts'),
    path('my-posts/', MyPostsListView.as_view(), name='my-posts'),
    path('like/', LikePostView.as_view(), name='like-post'),
    path('comment/', CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:post_id>/', PostCommentsListView.as_view(), name='post-comments'),
    path('delete-post/<int:post_id>/', PostDeleteView.as_view(), name='delete-post'),
    path('posts/<int:post_id>/view/', IncrementPostView.as_view(), name='increment-post-view'),
] 