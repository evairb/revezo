from rest_framework.permissions import BasePermission


class IsSystemMaster(BasePermission):
    """
    Permite acesso somente ao Administrador Master.
    """

    message = "Acesso permitido somente ao Administrador Master."

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_superuser
        )
