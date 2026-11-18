from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework.viewsets import ModelViewSet

from rest_framework.exceptions import PermissionDenied
from apps.core.permission import (
    IsSystemMaster,
    IsSystemMasterOrChurchAdmin,
)

from apps.accounts.serializers import UserSearchSerializer
from .serializers import (
    ChurchSerializer,
    ChurchMembershipSerializer,
)

from apps.churches.models import Church, ChurchMembership
from apps.accounts.models import User


class ChurchViewSet(ModelViewSet):
    """
    API para gerenciamento de igrejas.
    """

    serializer_class = ChurchSerializer

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Church.objects.all()

        return Church.objects.filter(
            memberships__user=user,
            memberships__role=ChurchMembership.Role.ADMIN,
            memberships__is_active=True,
            is_active=True,
        ).distinct()

    def get_permissions(self):
        if self.action in ("create", "destroy"):
            permission_classes = [IsSystemMaster]
        else:
            permission_classes = [IsSystemMasterOrChurchAdmin]

        return [permission() for permission in permission_classes]


class ChurchMembershipViewSet(ModelViewSet):
    """
    API para gerenciamento dos vínculos entre usuários e igrejas.
    """

    serializer_class = ChurchMembershipSerializer

    permission_classes = [IsSystemMasterOrChurchAdmin]

    def get_queryset(self):
        user = self.request.user

        queryset = ChurchMembership.objects.select_related(
            "user",
            "church",
        )

        if user.is_superuser:
            return queryset.all()

        return queryset.filter(
            church__memberships__user=user,
            church__memberships__role=ChurchMembership.Role.ADMIN,
            church__memberships__is_active=True,
            church__is_active=True,
        ).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        church = serializer.validated_data["church"]

        if not user.is_superuser:
            authorized = ChurchMembership.objects.filter(
                user=user,
                church=church,
                role=ChurchMembership.Role.ADMIN,
                is_active=True,
                church__is_active=True,
            ).exists()

            if not authorized:
                raise PermissionDenied(
                    "Você não tem autorização para gerenciar vínculos nesta igreja."
                )

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        church = serializer.validated_data.get(
            "church",
            serializer.instance.church,
        )

        if not user.is_superuser:
            authorized = ChurchMembership.objects.filter(
                user=user,
                church=church,
                role=ChurchMembership.Role.ADMIN,
                is_active=True,
                church__is_active=True,
            ).exists()

            if not authorized:
                raise PermissionDenied(
                    "Você não tem autorização para gerenciar vínculos nesta igreja."
                )

        serializer.save()

    @action(
        detail=False,
        methods=["get"],
        url_path="search-users",
    )
    def search_users(self, request):
        """
        Pesquisa usuários disponíveis para vinculação a uma igreja.
        """

        user = request.user
        church_id = request.query_params.get("church")
        search = request.query_params.get("email", "").strip()

        if not church_id:
            return Response(
                {"detail": "Informe o ID da igreja."},
                status=400,
            )

        church = Church.objects.filter(
            id=church_id,
            is_active=True,
        ).first()

        if not church:
            return Response(
                {"detail": "Igreja não encontrada ou inativa."},
                status=404,
            )

        if not user.is_superuser:
            authorized = ChurchMembership.objects.filter(
                user=user,
                church=church,
                role=ChurchMembership.Role.ADMIN,
                is_active=True,
            ).exists()

            if not authorized:
                raise PermissionDenied(
                    "Você não tem autorização para pesquisar usuários nesta igreja."
                )

        if len(search) < 3:
            return Response([])

        users = (
            User.objects.filter(is_active=True)
            .filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )
            .exclude(
                church_memberships__church=church,
            )
            .order_by("email")[:20]
        )

        serializer = UserSearchSerializer(users, many=True)

        return Response(serializer.data)
