from rest_framework.routers import DefaultRouter

from .views import SecurityKeyViewSet

router = DefaultRouter()
router.register(r"security-keys", SecurityKeyViewSet, basename="security-keys")

urlpatterns = router.urls
