from rest_framework import serializers

from apps.services.models import Service


class ServiceSerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(
        source="church.name",
        read_only=True,
    )

    class Meta:
        model = Service
        fields = [
            "id",
            "church",
            "church_name",
            "name",
            "service_type",
            "day_of_week",
            "date",
            "time",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_church(self, church):
        if not church.is_active:
            raise serializers.ValidationError(
                "Não é possível cadastrar um culto em uma igreja inativa."
            )

        return church

    def validate(self, attrs):
        instance = self.instance

        service_type = attrs.get(
            "service_type",
            instance.service_type if instance else None,
        )

        day_of_week = attrs.get(
            "day_of_week",
            instance.day_of_week if instance else None,
        )

        date = attrs.get(
            "date",
            instance.date if instance else None,
        )

        if service_type == Service.ServiceType.FIXED:
            if day_of_week is None:
                raise serializers.ValidationError(
                    {"day_of_week": "Informe o dia da semana do culto fixo."}
                )

            if date is not None:
                raise serializers.ValidationError(
                    {"date": "Cultos fixos não devem possuir uma data específica."}
                )

        elif service_type == Service.ServiceType.SPECIAL:
            if date is None:
                raise serializers.ValidationError(
                    {"date": "Informe a data do culto especial."}
                )

            if day_of_week is not None:
                raise serializers.ValidationError(
                    {"day_of_week": "Cultos especiais não devem possuir dia da semana."}
                )

        return attrs
