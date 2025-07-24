from django.contrib import admin
from .models import ContactMessage, CustomerServiceMessage, CustomerServiceReply, Notification, NewsletterSubscriber, SiteStatus
from django.core.mail import send_mail
from django.contrib.contenttypes.models import ContentType
from mentor.models import Mentor
from student.models import Student
from django import forms

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    pass

@admin.register(CustomerServiceMessage)
class CustomerServiceMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'user_type', 'is_resolved', 'created_at', 'get_reply_count')
    search_fields = ('subject', 'message')
    list_filter = ('is_resolved', 'user_type')
    readonly_fields = ('is_resolved',)

    def get_reply_count(self, obj):
        return obj.replies.count()
    get_reply_count.short_description = 'Replies'

@admin.register(CustomerServiceReply)
class CustomerServiceReplyAdmin(admin.ModelAdmin):
    list_display = ('id', 'reply', 'message_subject', 'message_is_resolved', 'replied_by', 'created_at')
    search_fields = ('reply',)
    list_filter = ('replied_by',)

    def message_subject(self, obj):
        return obj.message.subject
    message_subject.short_description = 'Message Subject'

    def message_is_resolved(self, obj):
        return obj.message.is_resolved
    message_is_resolved.boolean = True
    message_is_resolved.short_description = 'Query Resolved?'

class NotificationForm(forms.ModelForm):
    mentor_id_field = forms.ChoiceField(
        choices=[],
        label="Mentor ID",
        required=False
    )
    student_id_field = forms.ChoiceField(
        choices=[],
        label="Student ID",
        required=False
    )

    class Meta:
        model = Notification
        fields = ['recipient_type', 'mentor_id_field', 'student_id_field', 'message', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from mentor.models import Mentor
        from student.models import Student
        self.fields['mentor_id_field'].choices = [
            (m.mentor_id, f"{m.mentor_id} - {m.name}")
            for m in Mentor.objects.exclude(mentor_id__isnull=True).exclude(mentor_id__exact='')
        ]
        self.fields['student_id_field'].choices = [
            (s.student_id, f"{s.student_id} - {s.name}")
            for s in Student.objects.exclude(student_id__isnull=True).exclude(student_id__exact='')
        ]
        if self.instance and self.instance.pk:
            if self.instance.recipient_type == 'mentor':
                self.fields['mentor_id_field'].initial = self.instance.recipient_formal_id
            elif self.instance.recipient_type == 'student':
                self.fields['student_id_field'].initial = self.instance.recipient_formal_id
        recipient_type = self.initial.get('recipient_type') or self.data.get('recipient_type')
        if recipient_type == 'mentor':
            self.fields['mentor_id_field'].required = True
            self.fields['student_id_field'].required = False
        elif recipient_type == 'student':
            self.fields['student_id_field'].required = True
            self.fields['mentor_id_field'].required = False
        else:
            self.fields['mentor_id_field'].required = False
            self.fields['student_id_field'].required = False

    def clean(self):
        cleaned_data = super().clean()
        recipient_type = cleaned_data.get('recipient_type')
        mentor_id = cleaned_data.get('mentor_id_field')
        student_id = cleaned_data.get('student_id_field')
        if recipient_type == 'mentor':
            if not mentor_id:
                self.add_error('mentor_id_field', 'This field is required for mentors.')
            cleaned_data['recipient_formal_id'] = mentor_id
            cleaned_data['student_id_field'] = ''
        elif recipient_type == 'student':
            if not student_id:
                self.add_error('student_id_field', 'This field is required for students.')
            cleaned_data['recipient_formal_id'] = student_id
            cleaned_data['mentor_id_field'] = ''
        else:
            cleaned_data['recipient_formal_id'] = ''
        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        # Set the correct recipient_formal_id
        if self.cleaned_data['recipient_type'] == 'mentor':
            instance.recipient_formal_id = self.cleaned_data['mentor_id_field']
        elif self.cleaned_data['recipient_type'] == 'student':
            instance.recipient_formal_id = self.cleaned_data['student_id_field']
        print(f"[NotificationForm.save] recipient_type: {self.cleaned_data['recipient_type']}, recipient_formal_id: {repr(instance.recipient_formal_id)}")
        # Print all available student IDs and emails for debugging
        if self.cleaned_data['recipient_type'] == 'student':
            from student.models import Student
            print("[NotificationForm.save] All students in DB (repr):")
            for s in Student.objects.all():
                print(f"  student_id: {repr(s.student_id)} | email: {s.email}")
        # Send email if not already sent
        if not instance.is_email_sent:
            from mentor.models import Mentor
            from student.models import Student
            recipient = None
            email = None
            if instance.recipient_type == "mentor":
                mentor_id = (instance.recipient_formal_id or '').strip()
                recipient = Mentor.objects.filter(mentor_id__iexact=mentor_id).first()
                if recipient:
                    print(f"[NotificationForm.save] Mentor found: {recipient} (email: {recipient.email})")
                    email = recipient.email
                else:
                    print(f"[NotificationForm.save] Mentor with id '{mentor_id}' not found.")
            elif instance.recipient_type == "student":
                student_id = (instance.recipient_formal_id or '').strip()
                print(f"[NotificationForm.save] Looking up student_id: {repr(student_id)}")
                recipient = Student.objects.filter(student_id__iexact=student_id).first()
                if recipient:
                    print(f"[NotificationForm.save] Student found: {recipient} (email: {recipient.email})")
                    email = recipient.email
                else:
                    print(f"[NotificationForm.save] Student with id {repr(student_id)} not found.")
            print(f"[NotificationForm.save] Attempting to send email to: {email} for notification {instance.id}")
            if email:
                from django.core.mail import send_mail
                send_mail(
                    subject="New Notification",
                    message=instance.message,
                    from_email=None,
                    recipient_list=[email],
                    fail_silently=False,
                )
                instance.is_email_sent = True
        if commit:
            instance.save()
        return instance

    class Media:
        js = ('admin/js/notification_recipient_switch.js',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    form = NotificationForm
    list_display = ("recipient_type", "recipient_formal_id", "message", "created_at", "is_email_sent")
    readonly_fields = ("is_email_sent",)
    actions = ["send_email_notification_action", "resend_email_notification_action"]
    search_fields = ("recipient_type", "recipient_formal_id", "message")
    list_filter = ('recipient_type', 'is_email_sent', 'created_at')
    actions = ['broadcast_to_all_students', 'broadcast_to_all_mentors', 'broadcast_to_all']

    def broadcast_to_all_students(self, request, queryset):
        from student.models import Student
        for notification in queryset:
            for student in Student.objects.all():
                Notification.objects.create(
                    recipient_type='student',
                    recipient_formal_id=student.student_id,
                    message=notification.message
                )
        self.message_user(request, "Broadcast sent to all students.")
    broadcast_to_all_students.short_description = "Broadcast selected message to all students"

    def broadcast_to_all_mentors(self, request, queryset):
        from mentor.models import Mentor
        for notification in queryset:
            for mentor in Mentor.objects.all():
                Notification.objects.create(
                    recipient_type='mentor',
                    recipient_formal_id=mentor.mentor_id,
                    message=notification.message
                )
        self.message_user(request, "Broadcast sent to all mentors.")
    broadcast_to_all_mentors.short_description = "Broadcast selected message to all mentors"

    def broadcast_to_all(self, request, queryset):
        from student.models import Student
        from mentor.models import Mentor
        for notification in queryset:
            for student in Student.objects.all():
                Notification.objects.create(
                    recipient_type='student',
                    recipient_formal_id=student.student_id,
                    message=notification.message
                )
            for mentor in Mentor.objects.all():
                Notification.objects.create(
                    recipient_type='mentor',
                    recipient_formal_id=mentor.mentor_id,
                    message=notification.message
                )
        self.message_user(request, "Broadcast sent to all students and mentors.")
    broadcast_to_all.short_description = "Broadcast selected message to all students and mentors"

    def send_email_notification_action(self, request, queryset):
        for notification in queryset:
            if not notification.is_email_sent:
                recipient = None
                email = None
                if notification.recipient_type == "mentor":
                    try:
                        recipient = Mentor.objects.get(mentor_id=notification.recipient_formal_id)
                        email = recipient.email
                    except Mentor.DoesNotExist:
                        email = None
                elif notification.recipient_type == "student":
                    try:
                        recipient = Student.objects.get(student_id=notification.recipient_formal_id)
                        email = recipient.email
                    except Student.DoesNotExist:
                        email = None
                print(f"[NotificationAdmin.send_email_notification_action] Attempting to send email to: {email} for notification {notification.id}")
                if email:
                    from django.core.mail import send_mail
                    send_mail(
                        subject="New Notification",
                        message=notification.message,
                        from_email=None,
                        recipient_list=[email],
                        fail_silently=False,
                    )
                    notification.is_email_sent = True
                    notification.save()
        self.message_user(request, "Selected notifications have been emailed.")
    send_email_notification_action.short_description = "Send email notification to recipient(s)"

    def resend_email_notification_action(self, request, queryset):
        for notification in queryset:
            recipient = None
            email = None
            if notification.recipient_type == "mentor":
                from mentor.models import Mentor
                recipient = Mentor.objects.filter(mentor_id__iexact=notification.recipient_formal_id.strip()).first()
                if recipient:
                    email = recipient.email
            elif notification.recipient_type == "student":
                from student.models import Student
                recipient = Student.objects.filter(student_id__iexact=notification.recipient_formal_id.strip()).first()
                if recipient:
                    email = recipient.email
            if email:
                from django.core.mail import send_mail
                send_mail(
                    subject="New Notification (Resent)",
                    message=notification.message,
                    from_email=None,
                    recipient_list=[email],
                    fail_silently=False,
                )
                notification.is_email_sent = True
                notification.save()
        self.message_user(request, "Selected notifications have been resent via email.")
    resend_email_notification_action.short_description = "Resend notification/email to recipient(s)"

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at')
    search_fields = ('email',)

@admin.register(SiteStatus)
class SiteStatusAdmin(admin.ModelAdmin):
    list_display = ('maintenance_mode', 'updated_at')
