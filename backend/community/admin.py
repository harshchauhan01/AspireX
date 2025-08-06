from django.contrib import admin
from .models import Post, Like, Comment

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'text', 'created_at', 'is_admin_post')
    list_filter = ('is_admin_post', 'created_at')
    search_fields = ('text',)
    fields = ('user_content_type', 'user_object_id', 'text', 'is_admin_post')

admin.site.register(Post, PostAdmin)
admin.site.register(Like)
admin.site.register(Comment) 