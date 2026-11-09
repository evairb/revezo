
from rest_framework.viewsets import ModelViewSet

from apps.core.permission import IsSystemMaster

from .models import Church, ChurchMembership
from .serializers import (
    ChurchSerializer,
    ChurchMembershipSerializer,
)


class ChurchViewSet(ModelViewSet):
    """
    API para gerenciamento de igrejas.
    """

    queryset = Church.objects.all()
    serializer_class = ChurchSerializer
    permission_classes = [IsSystemMaster]


class ChurchMembershipViewSet(ModelViewSet):
    """
    API para gerenciamento dos vínculos entre
    usuários e igrejas.
    """

    queryset = ChurchMembership.objects.select_related(
        "user",
        "church",
    ).all()

    serializer_class = ChurchMembershipSerializer
    permission_classes = [IsSystemMaster]
