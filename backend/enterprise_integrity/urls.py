from django.urls import include, path
from rest_framework.routers import DefaultRouter

# Mock routing removed: always use database-backed viewsets.
from .views import AuditLogViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="documents")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-logs")

urlpatterns = [
    path("v1/", include(router.urls)),
]
