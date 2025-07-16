
from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
# Register your models here.
@admin.register(Student)
class StudentAdmin(UserAdmin):
    list_display = ('student_id', 'email', 'name', 'is_staff')
    search_fields = ('student_id', 'email', 'name')
    ordering = ('student_id',)
    
    fieldsets = (
        (None, {'fields': ('student_id', 'email', 'password')}),
        ('Personal info', {'fields': ('name',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('student', 'mentor', 'time_slot', 'is_paid', 'transaction_id')
    list_filter = ('is_paid',)


@admin.register(StudentDetail)
class StudentDetailAdmin(admin.ModelAdmin):
    list_display = ('student', 'first_name', 'last_name', 'email', 'is_approved')
    list_filter = ('is_approved', 'gender', 'batch')
    search_fields = ('first_name', 'last_name', 'email', 'mentor__mentor_id')
    raw_id_fields = ('student',)
    filter_horizontal = ('professions', 'skills')
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'first_name', 'last_name', 'dob', 'age', 'gender')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number')
        }),
        ('Education Information', {
            'fields': ('college', 'cgpa', 'batch')
        }),
        ('Professional Information', {
            'fields': ('professions', 'skills')
        }),
        ('Mentorship Details', {
            'fields': ('about',)
        }),
        ('Media Files', {
            'fields': ('profile_photo', 'cv'),
            'classes': ('collapse',)
        }),
        ('Social Links', {
            'fields': ('linkedin_url', 'github_url', 'portfolio_url'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('total_sessions',),
            'classes': ('collapse',)
        }),
        ('Approval Status', {
            'fields': ('is_approved',)
        }),
    )

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Profession)
class ProfessionAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title',)



from django.urls import path

@admin.register(StudentMessage)
class StudentMessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'student', 'sender', 'subject', 'is_read', 'sent_at')
    list_filter = ('is_read', 'sent_at')
    search_fields = ('student__name', 'sender__username', 'subject', 'message')
    readonly_fields = ('message_id', 'sent_at')
    ordering = ('-sent_at',)

    fieldsets = (
        (None, {
            'fields': ('message_id', 'student', 'sender', 'subject', 'message')
        }),
        ('Status & Timestamps', {
            'fields': ('is_read', 'sent_at')
        }),
    )

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('student', 'mentor', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at')
    search_fields = ('student__name', 'mentor__name', 'feedback_text')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    list_select_related = ('student', 'mentor', 'meeting')
    actions = ['approve_feedback', 'reject_feedback']
    
    fieldsets = (
        ('Feedback Information', {
            'fields': ('student', 'mentor', 'meeting', 'rating', 'feedback_text')
        }),
        ('Approval Status', {
            'fields': ('is_approved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def approve_feedback(self, request, queryset):
        """Approve selected feedback"""
        updated = queryset.filter(is_approved=False).update(is_approved=True)
        self.message_user(request, f"{updated} feedback(s) approved successfully.")
    approve_feedback.short_description = "Approve selected feedback"

    def reject_feedback(self, request, queryset):
        """Reject selected feedback"""
        updated = queryset.filter(is_approved=True).update(is_approved=False)
        self.message_user(request, f"{updated} feedback(s) rejected successfully.")
    reject_feedback.short_description = "Reject selected feedback"