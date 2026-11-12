from django.conf import settings
from django.db import models


class Ministry(models.Model):
    church = models.ForeignKey(
        "churches.Church",
        on_delete=models.PROTECT,
        related_name="ministries",
        verbose_name="Igreja",
    )

    name = models.CharField(
        "Nome do ministério",
        max_length=150,
    )

    is_active = models.BooleanField("Ministério ativo", default=True)

    created_at = models.DateTimeField("Data de cadastro", auto_now_add=True)

    updated_at = models.DateTimeField(
        "Última atualização",
        auto_now=True,
    )

    class Meta:
        verbose_name = "Ministério"
        verbose_name_plural = "Ministérios"
        ordering = ["church__name", "name"]

        constraints = [
            models.UniqueConstraint(
                fields=["church", "name"],
                name="unique_ministry_name_per_church",
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.church.name}"


class MinistryMembership(models.Model):

    class Role(models.TextChoices):
        MEMBER = "member", "Membro"
        ADMIN = "admin", "Administrador de Ministério"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="ministry_memberships",
        verbose_name="Usuário",
    )

    ministry = models.ForeignKey(
        Ministry,
        on_delete=models.PROTECT,
        related_name="memberships",
        verbose_name="Ministério",
    )

    role = models.CharField(
        "Responsabilidade",
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )

    is_active = models.BooleanField(
        "Vínculo ativo",
        default=True,
    )

    joined_at = models.DateTimeField(
        "Data de ingresso",
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Vínculo com ministério"
        verbose_name_plural = "Vínculos com ministérios"
        ordering = ["ministry__name", "user__email"]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "ministry"],
                name="unique_user_ministry_membership",
            ),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.ministry.name}"
