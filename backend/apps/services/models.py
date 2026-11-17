from django.db import models
from django.db.models import Q


class Service(models.Model):
    class ServiceType(models.TextChoices):
        FIXED = "fixed", "Fixo"
        SPECIAL = "special", "Especial"

    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Segunda-feira"
        TUESDAY = 1, "Terça-feira"
        WEDNESDAY = 2, "Quarta-feira"
        THURSDAY = 3, "Quinta-feira"
        FRIDAY = 4, "Sexta-feira"
        SATURDAY = 5, "Sábado"
        SUNDAY = 6, "Domingo"

    church = models.ForeignKey(
        "churches.Church",
        on_delete=models.PROTECT,
        related_name="services",
        verbose_name="Igreja",
    )

    name = models.CharField(
        max_length=150,
        verbose_name="Nome do culto",
    )

    service_type = models.CharField(
        max_length=20,
        choices=ServiceType.choices,
        verbose_name="Tipo de culto",
    )

    day_of_week = models.IntegerField(
        choices=Weekday.choices,
        null=True,
        blank=True,
        verbose_name="Dia da semana",
    )

    date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data do culto",
    )

    time = models.TimeField(
        verbose_name="Horário",
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Culto ativo",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["church__name", "name"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(
                        service_type="fixed",
                        day_of_week__isnull=False,
                        date__isnull=True,
                    )
                    | Q(
                        service_type="special",
                        day_of_week__isnull=True,
                        date__isnull=False,
                    )
                ),
                name="valid_service_schedule_type",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.church.name}"
