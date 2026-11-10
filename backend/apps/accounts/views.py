
from django.conf import settings
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import RegisterSerializer
from .serializers import UserSerializer


# Preparação do cookie CSRF
@ensure_csrf_cookie
def csrf_cookie_view(request):
    return JsonResponse({"detail": "Cookie CSRF preparado."})


# Utilitário para armazenar o refresh token
def set_refresh_cookie(response, token):
    cookie = settings.AUTH_COOKIE
    lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

    response.set_cookie(
        key=cookie["NAME"],
        value=token,
        max_age=int(lifetime.total_seconds()),
        path=cookie["PATH"],
        httponly=cookie["HTTPONLY"],
        secure=cookie["SECURE"],
        samesite=cookie["SAMESITE"],
    )


# Login
@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tokens = serializer.validated_data

        response = Response(
            {"access": tokens["access"]},
            status=status.HTTP_200_OK,
        )

        set_refresh_cookie(response, tokens["refresh"])

        return response


# Renovação da sessão
@method_decorator(csrf_protect, name="dispatch")
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cookie_name = settings.AUTH_COOKIE["NAME"]
        refresh_token = request.COOKIES.get(cookie_name)

        if not refresh_token:
            return Response(
                {"detail": "Cookie de autenticação não encontrado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(
            data={"refresh": refresh_token}
        )
        serializer.is_valid(raise_exception=True)

        tokens = serializer.validated_data

        response = Response(
            {"access": tokens["access"]},
            status=status.HTTP_200_OK,
        )

        new_refresh = tokens.get("refresh")

        if new_refresh:
            set_refresh_cookie(response, new_refresh)

        return response


# Logout
@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cookie = settings.AUTH_COOKIE
        refresh_token = request.COOKIES.get(cookie["NAME"])

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = Response(
            {"detail": "Sessão encerrada."},
            status=status.HTTP_205_RESET_CONTENT,
        )

        response.delete_cookie(
            key=cookie["NAME"],
            path=cookie["PATH"],
            samesite=cookie["SAMESITE"],
        )

        return response


# Usuário autenticado
class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# Cadastro público
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
