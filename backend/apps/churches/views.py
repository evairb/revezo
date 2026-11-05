from rest_framework.viewsets import ModelViewSet
from apps.core.permission import IsSystemMaster
from .models import Church
from .serializers import ChurchSerializer


class ChurchViewSet(ModelViewSet):
    """
    API para gerenciamento de igrejas.

    Todas as operações são exclusivas do Administrador Master.
    """
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer
    permission_classes = [IsSystemMaster]
