
from django.urls import path

from .views import (
    csrf_cookie_view,
    LoginView,
    RefreshTokenView,
    LogoutView,
    CurrentUserView,
    RegisterView,
)


urlpatterns = [
    path("csrf/", csrf_cookie_view, name="csrf"),
    path("token/", LoginView.as_view(), name="token_obtain_pair"),
    path(
        "token/refresh/",
        RefreshTokenView.as_view(),
        name="token_refresh",
    ),
    path(
        "token/blacklist/",
        LogoutView.as_view(),
        name="token_blacklist",
    ),
    path("me/", CurrentUserView.as_view(), name="current_user"),
    path("register/", RegisterView.as_view(), name="register"),
]
