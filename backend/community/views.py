from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.generics import ListAPIView
from django.utils import timezone
from datetime import timedelta
from .models import Post, Like, Comment
from .serializers import PostSerializer, LikeSerializer, CommentSerializer
from mentor.views import DualTokenAuthentication
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404

class CommunityPostListCreateView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get posts from last 10 days only
        ten_days_ago = timezone.now() - timedelta(days=10)
        posts = Post.objects.filter(created_at__gte=ten_days_ago).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Rate limiting: max 5 posts per day per user
        today = timezone.now().date()
        user_posts_today = Post.objects.filter(
            user_content_type=ContentType.objects.get_for_model(request.user.__class__),
            user_object_id=request.user.id,
            created_at__date=today
        ).count()
        
        if user_posts_today >= 5:
            return Response(
                {'error': 'You can only create 5 posts per day. Please try again tomorrow.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(
                user=request.user,
                user_content_type=ContentType.objects.get_for_model(request.user.__class__),
                user_object_id=request.user.id
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyPostsListView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        posts = Post.objects.filter(
            user_content_type=ContentType.objects.get_for_model(request.user.__class__),
            user_object_id=request.user.id
        ).order_by('-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

class PostDeleteView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        
        # Check if the user owns this post
        if (post.user_content_type != ContentType.objects.get_for_model(request.user.__class__) or
            post.user_object_id != request.user.id):
            return Response(
                {'error': 'You can only delete your own posts.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response({'message': 'Post deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class LikePostView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        post_id = request.data.get('post_id')
        if not post_id:
            return Response({'error': 'post_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user already liked this post
        existing_like = Like.objects.filter(
            post=post,
            user_content_type=ContentType.objects.get_for_model(request.user.__class__),
            user_object_id=request.user.id
        ).first()
        
        if existing_like:
            # Unlike
            existing_like.delete()
            liked = False
        else:
            # Like
            Like.objects.create(
                post=post,
                user=request.user,
                user_content_type=ContentType.objects.get_for_model(request.user.__class__),
                user_object_id=request.user.id
            )
            liked = True
        
        return Response({
            'liked': liked,
            'like_count': post.likes.count()
        })

class CommentCreateView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        post_id = request.data.get('post_id')
        text = request.data.get('text')
        
        if not post_id or not text:
            return Response({'error': 'post_id and text are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(text) > 250:
            return Response({'error': 'Comment text cannot exceed 250 characters'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        comment = Comment.objects.create(
            post=post,
            user=request.user,
            user_content_type=ContentType.objects.get_for_model(request.user.__class__),
            user_object_id=request.user.id,
            text=text
        )
        
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PostCommentsListView(APIView):
    authentication_classes = [DualTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        comments = post.comments.all().order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data) 

class IncrementPostView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        post.views = (post.views or 0) + 1
        post.save(update_fields=['views'])
        return Response({'views': post.views}) 