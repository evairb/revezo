from rest_framework.routers import DefaultRouter
from .views import (
    ChurchViewSet,
    ChurchMembershipViewSet,
)

router = DefaultRouter()

router.register(
    r"memberships",
    ChurchMembershipViewSet,
    basename="church-membership",
)

router.register(
    r"",
    ChurchViewSet,
    basename="church",
)

urlpatterns = router.urls
