from rest_framework.routers import DefaultRouter
from .views import ChurchViewSet


router = DefaultRouter()

router.register(
    r"",
    ChurchViewSet,
    basename="church",
)

urlpatterns = router.urls
