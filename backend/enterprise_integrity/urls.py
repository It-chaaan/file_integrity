from django.conf import settings
from django.urls import include, path
from rest_framework.routers import DefaultRouter

# Conditionally import views based on MOCK_MODE setting
if settings.MOCK_MODE:
    from .views_mock import AuditLogViewSet, DocumentViewSet
else:
    from .views import AuditLogViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="documents")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-logs")

urlpatterns = [
    path("v1/", include(router.urls)),
]
