from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    """
    Usuário global do sistema.

    Uma conta pode participar de várias igrejas.
    Os vínculos e permissões específicos serão
    administrados pelos respectivos domínios.
    """

    username = None

    email = models.EmailField(
        "E-mail",
        unique=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
