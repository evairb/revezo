from django.contrib.auth.forms import BaseUserCreationForm, UserChangeForm

from .models import User


class CustomUserCreationForm(BaseUserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"
