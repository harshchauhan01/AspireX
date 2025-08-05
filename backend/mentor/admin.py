from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
from django.utils import timezone
from .forms import MentorDetailAdminForm

@admin.register(MentorDetail)
class MentorDetailAdmin(admin.ModelAdmin):
    form = MentorDetailAdminForm
    list_display = ('mentor', 'first_name', 'last_name', 'email', 'is_approved')
    list_filter = ('is_approved', 'gender', 'batch')
    search_fields = ('first_name', 'last_name', 'email', 'mentor__mentor_id')
    raw_id_fields = ('mentor',)
    filter_horizontal = ('professions', 'skills')
    
    fieldsets = (
        ('Mentor Information', {
            'fields': ('mentor', 'first_name', 'last_name', 'dob', 'age', 'gender')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone_number')
        }),
        ('Education Information', {
            'fields': ('college', 'cgpa', 'batch')
        }),
        ('Professional Information', {
            'fields': ('professions', 'skills', 'years_of_experience')
        }),
        ('Mentorship Details', {
            'fields': ('fees', 'about', 'availability_timings')
        }),
        ('Key Achievements', {
            'fields': ('key_achievements',),
            'description': 'Enter key achievements as a JSON array. Example: ["Achievement 1", "Achievement 2"]'
        }),
        ('Services Offered', {
            'fields': ('services',),
            'description': 'Enter services as a JSON array. Each service should have: title, duration, price, description, features, popularity, sessionCount'
        }),
        ('Availability Schedule', {
            'fields': ('availability_day_wise',),
            'description': 'Enter availability as a JSON object with days as keys. Each day should have: date, slots (array of objects with time and available)'
        }),
        ('Languages Spoken', {
            'fields': ('languages',),
            'description': 'Enter languages as a JSON array. Example: ["English", "Spanish", "French"]'
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
            'fields': ('total_students', 'average_rating','total_sessions'),
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

# If you haven't already registered MentorToken
@admin.register(MentorToken)
class MentorTokenAdmin(admin.ModelAdmin):
    list_display = ('key', 'user', 'created')
    search_fields = ('key', 'user__mentor_id', 'user__email')
    raw_id_fields = ('user',)



@admin.register(Earning)
class EarningAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'amount', 'date', 'source', 'status')
    list_filter = ('status', 'date')
    search_fields = ('mentor__mentor_id', 'mentor__name', 'source', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('mentor', 'amount', 'date', 'source')
        }),
        ('Transaction Details', {
            'fields': ('transaction_id', 'status')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )




from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponseRedirect
from .models import MentorMessage
from .forms import MentorMessageForm

@admin.register(MentorMessage)
class MentorMessageAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'subject', 'sent_at', 'is_read')
    list_filter = ('is_read', 'sent_at')
    search_fields = ('mentor__name', 'subject')
    readonly_fields = ('sent_at',)
    date_hierarchy = 'sent_at'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('send-message/', self.admin_site.admin_view(self.send_message_view), name='send-mentor-message'),
        ]
        return custom_urls + urls

    def send_message_view(self, request):
        if request.method == 'POST':
            form = MentorMessageForm(request.POST)
            if form.is_valid():
                mentors = form.cleaned_data['mentors']
                for mentor in mentors:
                    MentorMessage.objects.create(
                        mentor=mentor,
                        subject=form.cleaned_data['subject'],
                        message=form.cleaned_data['message'],
                        admin_sender=request.user
                    )
                self.message_user(request, f"Message sent to {mentors.count()} mentors")
                return redirect('admin:mentor_mentormessage_changelist')
        else:
            form = MentorMessageForm()

        context = {
            **self.admin_site.each_context(request),
            'form': form,
            'title': 'Send Message to Mentors',
            'opts': self.model._meta,
        }
        return render(request, 'admin/send_message.html', context)
    

@admin.register(MeetingAttendance)
class MeetingAttendanceAdmin(admin.ModelAdmin):
    list_display = ('meeting', 'user_id', 'role', 'attended_at')
    list_filter = ('role', 'attended_at')
    search_fields = ('meeting__meeting_id', 'user_id', 'role')
    date_hierarchy = 'attended_at'

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = (
        'meeting_id', 'mentor', 'student', 'title', 'scheduled_time', 'status', 'duration',
        'mentor_attended', 'student_attended', 'mentor_attendance_time', 'student_attendance_time'
    )
    list_filter = ('status', 'mentor', 'mentor_attended', 'student_attended')
    search_fields = ('meeting_id', 'title', 'mentor__name', 'student__name')
    readonly_fields = ('meeting_id', 'created_at', 'updated_at', 'mentor_attended', 'student_attended', 'mentor_attendance_time', 'student_attendance_time')
    date_hierarchy = 'scheduled_time'
    list_select_related = ('mentor', 'student')
    autocomplete_fields = ('mentor', 'student')

    fieldsets = (
        ('Basic Information', {
            'fields': ('meeting_id', 'mentor', 'student', 'title', 'description')
        }),
        ('Meeting Details', {
            'fields': ('scheduled_time', 'duration', 'meeting_link', 'status')
        }),
        ('Attendance', {
            'fields': ('mentor_attended', 'student_attended', 'mentor_attendance_time', 'student_attendance_time')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(mentor__user=request.user)


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'amount', 'request_date', 'status', 'payment_method', 'transaction_id')
    list_filter = ('status', 'payment_method', 'request_date')
    search_fields = ('mentor__mentor_id', 'mentor__name', 'transaction_id')
    readonly_fields = ('request_date', 'transaction_id', 'created_at', 'updated_at')
    date_hierarchy = 'request_date'
    list_select_related = ('mentor',)
    actions = ['approve_withdrawals', 'reject_withdrawals', 'mark_as_processed']
    
    fieldsets = (
        ('Withdrawal Information', {
            'fields': ('mentor', 'amount', 'request_date', 'status')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'bank_details', 'transaction_id')
        }),
        ('Admin Actions', {
            'fields': ('processed_date', 'admin_notes'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def approve_withdrawals(self, request, queryset):
        """Approve selected withdrawal requests"""
        updated = queryset.filter(status='pending').update(
            status='approved',
            processed_date=timezone.now()
        )
        self.message_user(request, f"{updated} withdrawal(s) approved successfully.")
    approve_withdrawals.short_description = "Approve selected withdrawals"

    def reject_withdrawals(self, request, queryset):
        """Reject selected withdrawal requests"""
        updated = queryset.filter(status='pending').update(
            status='rejected',
            processed_date=timezone.now()
        )
        self.message_user(request, f"{updated} withdrawal(s) rejected successfully.")
    reject_withdrawals.short_description = "Reject selected withdrawals"

    def mark_as_processed(self, request, queryset):
        """Mark approved withdrawals as processed"""
        updated = queryset.filter(status='approved').update(
            status='processed',
            processed_date=timezone.now()
        )
        self.message_user(request, f"{updated} withdrawal(s) marked as processed.")
    mark_as_processed.short_description = "Mark as processed"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(mentor__user=request.user)