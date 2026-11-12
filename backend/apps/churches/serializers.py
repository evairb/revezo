
from rest_framework import serializers

from apps.accounts.models import User

from .models import Church, ChurchMembership


class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = (
            "id",
            "name",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def get_fields(self):
        fields = super().get_fields()

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            if not request.user.is_superuser:
                fields["is_active"].read_only = True

        return fields


class ChurchMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    church_name = serializers.CharField(
        source="church.name",
        read_only=True,
    )

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )

    church = serializers.PrimaryKeyRelatedField(
        queryset=Church.objects.all()
    )

    class Meta:
        model = ChurchMembership
        fields = (
            "id",
            "user",
            "user_email",
            "church",
            "church_name",
            "role",
            "is_active",
            "joined_at",
        )
        read_only_fields = (
            "id",
            "joined_at",
        )

    def validate(self, attrs):
        user = attrs.get(
            "user",
            getattr(self.instance, "user", None),
        )

        church = attrs.get(
            "church",
            getattr(self.instance, "church", None),
        )

        if user and not user.is_active:
            raise serializers.ValidationError({
                "user": "Não é possível vincular um usuário inativo."
            })

        if church and not church.is_active:
            raise serializers.ValidationError({
                "church": "Não é possível vincular a uma igreja inativa."
            })

        return attrs
