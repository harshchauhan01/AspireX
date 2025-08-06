from rest_framework import serializers
from .models import Post, Like, Comment
from django.contrib.contenttypes.models import ContentType

class PostSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(source='likes.count', read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)
    time_since_posted = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'username', 'role', 'profile_photo', 'text', 'created_at', 'time_since_posted', 'like_count', 'comment_count', 'views', 'is_admin_post']

    def get_username(self, obj):
        return str(obj.user)

    def get_role(self, obj):
        ct = obj.user_content_type.model
        if ct == 'mentor':
            return 'mentor'
        elif ct == 'student':
            return 'student'
        return 'unknown'

    def get_profile_photo(self, obj):
        try:
            if obj.user_content_type.model == 'mentor':
                return obj.user.details.profile_photo if hasattr(obj.user, 'details') and obj.user.details.profile_photo else None
            elif obj.user_content_type.model == 'student':
                return obj.user.details.profile_photo if hasattr(obj.user, 'details') and obj.user.details.profile_photo else None
        except:
            pass
        return None

    def get_time_since_posted(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'post', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    time_since_posted = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'username', 'role', 'profile_photo', 'text', 'created_at', 'time_since_posted']

    def get_username(self, obj):
        return str(obj.user)

    def get_role(self, obj):
        ct = obj.user_content_type.model
        if ct == 'mentor':
            return 'mentor'
        elif ct == 'student':
            return 'student'
        return 'unknown'

    def get_profile_photo(self, obj):
        try:
            if obj.user_content_type.model == 'mentor':
                return obj.user.details.profile_photo if hasattr(obj.user, 'details') and obj.user.details.profile_photo else None
            elif obj.user_content_type.model == 'student':
                return obj.user.details.profile_photo if hasattr(obj.user, 'details') and obj.user.details.profile_photo else None
        except:
            pass
        return None

    def get_time_since_posted(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago' 