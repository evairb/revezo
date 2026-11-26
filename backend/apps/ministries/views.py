from django.db.models import Q

from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.viewsets import ModelViewSet

from apps.core.permission import (
    IsSystemMaster,
    IsSystemMasterOrChurchAdmin,
    IsSystemMasterOrMinistryAdmin,
)

from apps.churches.models import ChurchMembership

from .models import (
    Ministry,
    MinistryMembership,
    MinistryFunction,
)
from .serializers import (
    MinistrySerializer,
    MinistryMembershipSerializer,
    MinistryFunctionSerializer,
)


class MinistryViewSet(ModelViewSet):
    serializer_class = MinistrySerializer

    def get_permissions(self):
        if self.action == "destroy":
            permission_classes = [IsSystemMaster]
        else:
            permission_classes = [IsSystemMasterOrChurchAdmin]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            queryset = Ministry.objects.select_related("church").all()
        else:
            queryset = (
                Ministry.objects.select_related("church")
                .filter(
                    Q(
                        church__memberships__user=user,
                        church__memberships__role=ChurchMembership.Role.ADMIN,
                        church__memberships__is_active=True,
                        church__memberships__church__is_active=True,
                    )
                )
                .distinct()
            )

        church_id = self.request.query_params.get("church")

        if church_id:
            queryset = queryset.filter(church_id=church_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        church = serializer.validated_data["church"]

        if user.is_superuser:
            serializer.save()
            return

        authorized = ChurchMembership.objects.filter(
            user=user,
            church=church,
            role=ChurchMembership.Role.ADMIN,
            is_active=True,
            church__is_active=True,
        ).exists()

        if not authorized:
            raise PermissionDenied(
                "Você não tem autorização para criar ministérios nesta igreja."
            )
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])


class MinistryMembershipViewSet(ModelViewSet):
    serializer_class = MinistryMembershipSerializer
    permission_classes = [IsSystemMasterOrMinistryAdmin]

    def get_queryset(self):
        user = self.request.user

        queryset = MinistryMembership.objects.select_related(
            "user",
            "ministry",
            "ministry__church",
        )

        if not user.is_superuser:
            queryset = queryset.filter(
                Q(
                    ministry__church__memberships__user=user,
                    ministry__church__memberships__role=ChurchMembership.Role.ADMIN,
                    ministry__church__memberships__is_active=True,
                    ministry__church__is_active=True,
                )
                | Q(
                    ministry__memberships__user=user,
                    ministry__memberships__role=MinistryMembership.Role.ADMIN,
                    ministry__memberships__is_active=True,
                    ministry__is_active=True,
                    ministry__church__is_active=True,
                )
            ).distinct()

        ministry_id = self.request.query_params.get("ministry")

        if ministry_id:
            queryset = queryset.filter(ministry_id=ministry_id)

        status = self.request.query_params.get("status")

        if status == "active":
            queryset = queryset.filter(is_active=True)
        elif status == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset

    def _save_membership(self, serializer):
        user = self.request.user
        ministry = serializer.validated_data.get(
            "ministry",
            getattr(serializer.instance, "ministry", None),
        )

        if user.is_superuser:
            serializer.save()
            return

        is_church_admin = ChurchMembership.objects.filter(
            user=user,
            church=ministry.church,
            role=ChurchMembership.Role.ADMIN,
            is_active=True,
            church__is_active=True,
        ).exists()

        is_ministry_admin = MinistryMembership.objects.filter(
            user=user,
            ministry=ministry,
            role=MinistryMembership.Role.ADMIN,
            is_active=True,
            ministry__is_active=True,
            ministry__church__is_active=True,
        ).exists()

        if not (is_church_admin or is_ministry_admin):
            raise PermissionDenied(
                "Você não tem autorização para gerenciar membros deste ministério."
            )

        serializer.save()

    def perform_create(self, serializer):
        self._save_membership(serializer)

    def perform_update(self, serializer):
        self._save_membership(serializer)


class MinistryFunctionViewSet(ModelViewSet):
    serializer_class = MinistryFunctionSerializer
    permission_classes = [IsSystemMasterOrMinistryAdmin]

    def get_queryset(self):
        user = self.request.user

        queryset = MinistryFunction.objects.select_related(
            "ministry",
            "ministry__church",
        )

        if not user.is_superuser:
            queryset = queryset.filter(
                Q(
                    ministry__church__memberships__user=user,
                    ministry__church__memberships__role=ChurchMembership.Role.ADMIN,
                    ministry__church__memberships__is_active=True,
                    ministry__church__is_active=True,
                )
                | Q(
                    ministry__memberships__user=user,
                    ministry__memberships__role=MinistryMembership.Role.ADMIN,
                    ministry__memberships__is_active=True,
                    ministry__is_active=True,
                    ministry__church__is_active=True,
                )
            ).distinct()

        ministry_id = self.request.query_params.get("ministry")

        if ministry_id:
            queryset = queryset.filter(ministry_id=ministry_id)

        status = self.request.query_params.get("status")

        if status == "active":
            queryset = queryset.filter(is_active=True)
        elif status == "inactive":
            queryset = queryset.filter(is_active=False)

        return queryset

    def _check_ministry_permission(self, ministry):
        user = self.request.user

        if user.is_superuser:
            return

        is_church_admin = ChurchMembership.objects.filter(
            user=user,
            church=ministry.church,
            role=ChurchMembership.Role.ADMIN,
            is_active=True,
            church__is_active=True,
        ).exists()

        is_ministry_admin = MinistryMembership.objects.filter(
            user=user,
            ministry=ministry,
            role=MinistryMembership.Role.ADMIN,
            is_active=True,
            ministry__is_active=True,
            ministry__church__is_active=True,
        ).exists()

        if not (is_church_admin or is_ministry_admin):
            raise PermissionDenied(
                "Você não tem autorização para gerenciar funções deste ministério."
            )

    def perform_create(self, serializer):
        ministry = serializer.validated_data["ministry"]

        self._check_ministry_permission(ministry)

        serializer.save()

    def perform_update(self, serializer):
        instance = self.get_object()
        ministry = instance.ministry

        if (
            "ministry" in serializer.validated_data
            and serializer.validated_data["ministry"].id != instance.ministry_id
        ):
            raise ValidationError(
                {
                    "ministry": (
                        "Não é permitido transferir uma função "
                        "para outro ministério."
                    )
                }
            )

        self._check_ministry_permission(ministry)

        serializer.save()

    def perform_destroy(self, instance):
        self._check_ministry_permission(instance.ministry)

        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
