from django import forms
from .models import MentorMessage,Mentor

class MentorMessageForm(forms.ModelForm):
    mentors = forms.ModelMultipleChoiceField(
        queryset=Mentor.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'select2'}),
        required=True
    )

    class Meta:
        model = MentorMessage
        fields = ['subject', 'message']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 5}),
        }


from django import forms
from django.utils import timezone
from .models import Meeting

class MeetingForm(forms.ModelForm):
    class Meta:
        model = Meeting
        fields = ['student', 'title', 'description', 'scheduled_time', 'duration', 'meeting_link', 'notes']
        widgets = {
            'scheduled_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 3}),
            'notes': forms.Textarea(attrs={'rows': 3}),
        }

    def clean_scheduled_time(self):
        scheduled_time = self.cleaned_data['scheduled_time']
        if scheduled_time < timezone.now():
            raise forms.ValidationError("Meeting time cannot be in the past")
        return scheduled_time