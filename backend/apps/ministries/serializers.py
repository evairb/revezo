from rest_framework import serializers

from apps.accounts.models import User
from apps.churches.models import Church
from .models import Ministry, MinistryMembership


class MinistrySerializer(serializers.ModelSerializer):
    church_name = serializers.CharField(
        source="church.name",
        read_only=True,
    )

    church = serializers.PrimaryKeyRelatedField(
        queryset=Church.objects.all(),
    )

    class Meta:
        model = Ministry
        fields = (
            "id",
            "church",
            "church_name",
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

    def validate(self, attrs):
        church = attrs.get(
            "church",
            getattr(self.instance, "church", None),
        )

        if church and not church.is_active:
            raise serializers.ValidationError(
                {"church": "Não é possível utilizar uma igreja inativa."}
            )

        return attrs


class MinistryMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    ministry_name = serializers.CharField(
        source="ministry.name",
        read_only=True,
    )

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
    )

    ministry = serializers.PrimaryKeyRelatedField(
        queryset=Ministry.objects.all(),
    )

    class Meta:
        model = MinistryMembership
        fields = (
            "id",
            "user",
            "user_email",
            "ministry",
            "ministry_name",
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

            ministry = attrs.get(
                "ministry",
                getattr(self.instance, "ministry", None),
            )

            if user and not user.is_active:
                raise serializers.ValidationError({
                    "user": "Não é possível vincular um usuário inativo."
                })

            if ministry and not ministry.is_active:
                raise serializers.ValidationError({
                    "ministry": "Não é possível utilizar um ministério inativo."
                })

            if ministry and not ministry.church.is_active:
                raise serializers.ValidationError({
                    "ministry": "A igreja deste ministério está inativa."
                })

            return attrs

    def validate_user(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Não é possível vincular um usuário inativo."
            )

        return value
