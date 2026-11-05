from django.db import models
from django.conf import settings


class Church(models.Model):
    name = models.CharField(
        "Nome da igreja",
        max_length=200,
    )
    is_active = models.BooleanField("Igreja ativa", default=True)
    created_at = models.DateTimeField("Data de cadastro", auto_now_add=True)
    updated_at = models.DateTimeField(
        "Última atualização",
        auto_now=True,
    )

    class Meta:
        verbose_name = "Igreja"
        verbose_name_plural = "Igrejas"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ChurchMembership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="church_memberships",
        verbose_name="Usuário",
    )

    church = models.ForeignKey(
        "churches.Church",
        on_delete=models.PROTECT,
        related_name="memberships",
        verbose_name="Igreja",
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
        verbose_name = "Vínculo com igreja"
        verbose_name_plural = "Vínculos com igrejas"
        ordering = ["church__name", "user__email"]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "church"],
                name="unique_user_church_membership",
            ),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.church.name}"
