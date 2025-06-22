from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction

class StudentManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        with transaction.atomic():
            user = self.model(
                email=email,
                name=name,
                **extra_fields
            )
            user.set_password(password)
            user.save(using=self._db)

            if not user.student_id:
                last_id = Student.objects.aggregate(
                    max_id=models.Max('id')
                )['max_id'] or 0
                user.student_id = f"S{str(last_id).zfill(6)}"
                user.save(update_fields=['student_id'])
            
            return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, **extra_fields)

class Student(AbstractUser):
    email = models.EmailField(unique=True)
    student_id = models.CharField(max_length=10, unique=True, blank=True)
    name = models.CharField(max_length=100)

    username = None

    groups = models.ManyToManyField(
        Group,
        related_name='student_user_set',
        blank=True,
        help_text='Groups this student belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='student_user_permissions',
        blank=True,
        help_text='User-specific permissions for this student.',
        verbose_name='user permissions',
    )

    USERNAME_FIELD = 'student_id'
    REQUIRED_FIELDS = ['email', 'name']
    
    objects = StudentManager()
    
    def __str__(self):
        return f"{self.student_id} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.student_id and not kwargs.get('update_fields') == ['student_id']:
            with transaction.atomic():
                max_id = Student.objects.aggregate(
                    max_id=models.Max('id')
                )['max_id'] or 0
                self.student_id = f"S{str(max_id + 1).zfill(6)}"
        super().save(*args, **kwargs)

@receiver(post_save, sender=Student)
def create_student_id(sender, instance, created, **kwargs):
    if created and not instance.student_id:
        try:
            last_student = Student.objects.order_by('-id').first()
            if last_student and last_student.student_id:
                last_id_str = last_student.student_id.lstrip('S')
                if last_id_str.isdigit():
                    last_id = int(last_id_str)
                    new_id = f"S{str(last_id + 1).zfill(6)}"
                else:
                    new_id = f"S{str(last_student.id).zfill(6)}"
            else:
                new_id = "S000001"
            instance.student_id = new_id
            instance.save(update_fields=['student_id'])
        except Exception as e:
            instance.student_id = f"S{str(instance.id).zfill(6)}"
            instance.save(update_fields=['student_id'])






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



# This model for success story
class SuccessStory(models.Model):
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    story = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.title}"
