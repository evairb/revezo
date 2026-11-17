
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from apps.core.permission import IsSystemMasterOrChurchAdmin
from apps.churches.models import ChurchMembership
from apps.services.models import Service
from apps.services.serializers import ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsSystemMasterOrChurchAdmin]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Service.objects.select_related("church").all()

        return Service.objects.filter(
            church__is_active=True,
            church__memberships__user=user,
            church__memberships__role=ChurchMembership.Role.ADMIN,
            church__memberships__is_active=True,
        ).select_related("church").distinct()

    def _save_service(self, serializer):
        user = self.request.user
        church = serializer.validated_data.get(
            "church",
            serializer.instance.church if serializer.instance else None,
        )

        if user.is_superuser:
            serializer.save()
            return

        is_church_admin = ChurchMembership.objects.filter(
            user=user,
            church=church,
            role=ChurchMembership.Role.ADMIN,
            is_active=True,
            church__is_active=True,
        ).exists()

        if not is_church_admin:
            raise PermissionDenied(
                "Você não tem permissão para administrar cultos nesta igreja."
            )

        serializer.save()

    def perform_create(self, serializer):
        self._save_service(serializer)

    def perform_update(self, serializer):
        self._save_service(serializer)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
