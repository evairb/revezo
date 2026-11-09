from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.accounts.serializers import RegisterSerializer
from .serializers import UserSerializer


class CurrentUserView(generics.RetrieveAPIView):
    """
    Retorna os dados do usuário autenticado.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
