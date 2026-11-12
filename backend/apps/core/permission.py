
from rest_framework.permissions import BasePermission

from apps.churches.models import Church, ChurchMembership
from apps.ministries.models import Ministry, MinistryMembership


class IsSystemMaster(BasePermission):
    """
    Permite acesso somente ao Administrador Master.
    """

    message = "Acesso permitido somente ao Administrador Master."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class BaseAdministrativePermission(BasePermission):
    """
    Classe-base para permissões administrativas.
    """

    message = "Você não possui permissão administrativa para este recurso."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        return self.has_scope_permission(request.user, obj)

    def has_scope_permission(self, user, obj):
        raise NotImplementedError(
            "A classe especializada deve implementar "
            "has_scope_permission()."
        )

    def is_church_admin(self, user, church):
        return ChurchMembership.objects.filter(
            user=user,
            church=church,
            role=ChurchMembership.Role.ADMIN,
            is_active=True,
            church__is_active=True,
        ).exists()

    def is_ministry_admin(self, user, ministry):
        return MinistryMembership.objects.filter(
            user=user,
            ministry=ministry,
            role=MinistryMembership.Role.ADMIN,
            is_active=True,
            ministry__is_active=True,
            ministry__church__is_active=True,
        ).exists()


class IsSystemMasterOrChurchAdmin(BaseAdministrativePermission):
    """
    Permite acesso ao Master ou ao administrador da igreja correspondente.
    """

    message = "Você não tem permissão para administrar esta igreja."

    def has_scope_permission(self, user, obj):
        if isinstance(obj, Church):
            church = obj

        elif isinstance(obj, ChurchMembership):
            church = obj.church

        elif isinstance(obj, Ministry):
            church = obj.church

        elif isinstance(obj, MinistryMembership):
            church = obj.ministry.church

        else:
            return False

        return self.is_church_admin(user, church)


class IsSystemMasterOrMinistryAdmin(BaseAdministrativePermission):
    """
    Permite acesso ao Master, administrador da igreja
    ou administrador do ministério correspondente.
    """

    message = "Você não tem permissão para administrar este ministério."

    def has_scope_permission(self, user, obj):
        if isinstance(obj, Ministry):
            ministry = obj

        elif isinstance(obj, MinistryMembership):
            ministry = obj.ministry

        else:
            return False

        return (
            self.is_church_admin(user, ministry.church)
            or self.is_ministry_admin(user, ministry)
        )
