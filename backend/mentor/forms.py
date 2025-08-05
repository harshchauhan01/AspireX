from django import forms
from .models import MentorMessage,Mentor
import json

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

from django import forms
from .models import MentorDetail
import json

class MentorDetailAdminForm(forms.ModelForm):
    class Meta:
        model = MentorDetail
        fields = '__all__'
        widgets = {
            'key_achievements': forms.Textarea(attrs={
                'rows': 4,
                'placeholder': '["Achievement 1", "Achievement 2", "Achievement 3"]'
            }),
            'services': forms.Textarea(attrs={
                'rows': 8,
                'placeholder': '[{"title": "Service Name", "duration": "60 min", "price": 80, "description": "Service description", "features": ["Feature 1", "Feature 2"], "popularity": 95, "sessionCount": 150}]'
            }),
            'availability_day_wise': forms.Textarea(attrs={
                'rows': 10,
                'placeholder': '{"monday": {"date": "Feb 5", "slots": [{"time": "9:00 AM", "available": true}]}}'
            }),
            'languages': forms.Textarea(attrs={
                'rows': 3,
                'placeholder': '["English", "Spanish", "French"]'
            }),
        }

    def clean_key_achievements(self):
        data = self.cleaned_data['key_achievements']
        if data:
            try:
                if isinstance(data, str):
                    json.loads(data)
                return data
            except json.JSONDecodeError:
                raise forms.ValidationError("Please enter valid JSON format for key achievements")
        return data

    def clean_services(self):
        data = self.cleaned_data['services']
        if data:
            try:
                if isinstance(data, str):
                    json.loads(data)
                return data
            except json.JSONDecodeError:
                raise forms.ValidationError("Please enter valid JSON format for services")
        return data

    def clean_availability_day_wise(self):
        data = self.cleaned_data['availability_day_wise']
        if data:
            try:
                if isinstance(data, str):
                    json.loads(data)
                return data
            except json.JSONDecodeError:
                raise forms.ValidationError("Please enter valid JSON format for availability")
        return data

    def clean_languages(self):
        data = self.cleaned_data['languages']
        if data:
            try:
                if isinstance(data, str):
                    json.loads(data)
                return data
            except json.JSONDecodeError:
                raise forms.ValidationError("Please enter valid JSON format for languages")
        return data