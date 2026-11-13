from rest_framework.routers import DefaultRouter

from .views import (
    MinistryViewSet, MinistryMembershipViewSet
)

router = DefaultRouter()

router.register(
    r"memberships", MinistryMembershipViewSet, basename="ministry-membership"
)

router.register(
    r"", MinistryViewSet, basename="ministry"
)

urlpatterns = router.urls
