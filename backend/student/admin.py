# admin.py
from django.contrib import admin
from .models import SuccessStory

@admin.register(SuccessStory)
class SuccessStoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('name', 'title')
