
from rest_framework import serializers

from apps.accounts.models import User
from apps.churches.models import Church, ChurchMembership

from .models import (
    Ministry,
    MinistryMembership,
    MinistryFunction,
)


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


class MinistryFunctionSerializer(serializers.ModelSerializer):
    ministry_name = serializers.CharField(
        source="ministry.name",
        read_only=True,
    )

    ministry = serializers.PrimaryKeyRelatedField(
        queryset=Ministry.objects.all(),
    )

    class Meta:
        model = MinistryFunction
        fields = (
            "id",
            "ministry",
            "ministry_name",
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
        ministry = attrs.get(
            "ministry",
            getattr(self.instance, "ministry", None),
        )

        name = attrs.get(
            "name",
            getattr(self.instance, "name", None),
        )

        if ministry and not ministry.is_active:
            raise serializers.ValidationError(
                {
                    "ministry":
                    "Não é possível cadastrar funções em um ministério inativo."
                }
            )

        if ministry and not ministry.church.is_active:
            raise serializers.ValidationError(
                {"ministry": "A igreja deste ministério está inativa."}
            )

        if ministry and name:
            existing_function = MinistryFunction.objects.filter(
                ministry=ministry,
                name=name,
            )

            if self.instance:
                existing_function = existing_function.exclude(
                    pk=self.instance.pk
                )

            if existing_function.exists():
                raise serializers.ValidationError(
                    {"name": "Já existe uma função com esse nome neste ministério."}
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

    functions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=MinistryFunction.objects.filter(is_active=True),
        required=False,
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
            "functions",
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

        # Valida funções somente quando elas forem enviadas na requisição.
        functions = attrs.get("functions")

        if user and not user.is_active:
            raise serializers.ValidationError(
                {"user": "Não é possível vincular um usuário inativo."}
            )

        if ministry and not ministry.is_active:
            raise serializers.ValidationError(
                {"ministry": "Não é possível utilizar um ministério inativo."}
            )

        if ministry and not ministry.church.is_active:
            raise serializers.ValidationError(
                {"ministry": "A igreja deste ministério está inativa."}
            )

        if user and ministry:
            has_active_church_membership = ChurchMembership.objects.filter(
                user=user,
                church=ministry.church,
                is_active=True,
                church__is_active=True,
            ).exists()

            if not has_active_church_membership:
                raise serializers.ValidationError(
                    {
                        "user": (
                            "A pessoa precisa possuir um vínculo ativo "
                            "com a igreja deste ministério."
                        )
                    }
                )

        if ministry and functions is not None:
            for function in functions:
                if function.ministry_id != ministry.id:
                    raise serializers.ValidationError(
                        {
                            "functions": (
                                f"A função '{function.name}' não pertence "
                                "ao ministério deste integrante."
                            )
                        }
                    )

                if not function.is_active:
                    raise serializers.ValidationError(
                        {
                            "functions": (
                                f"A função '{function.name}' está inativa."
                            )
                        }
                    )

        return attrs

    def create(self, validated_data):
        functions = validated_data.pop("functions", [])

        membership = MinistryMembership.objects.create(
            **validated_data
        )

        if functions:
            membership.functions.set(functions)

        return membership

    def update(self, instance, validated_data):
        functions = validated_data.pop("functions", None)

        membership = super().update(instance, validated_data)

        if functions is not None:
            membership.functions.set(functions)

        return membership

    def validate_user(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Não é possível vincular um usuário inativo."
            )

        return value

    def validate_ministry(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Não é possível vincular usuários a um ministério inativo."
            )

        if not value.church.is_active:
            raise serializers.ValidationError(
                "Não é possível vincular usuários a um ministério de uma igreja inativa."
            )

        return value
