from django.contrib import admin
from .models import ContactMessage, CustomerServiceMessage, CustomerServiceReply

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
