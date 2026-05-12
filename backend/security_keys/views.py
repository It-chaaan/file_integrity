from rest_framework import permissions, status
from rest_framework.viewsets import ModelViewSet

from common.permissions import IsSuperAdmin
from common.responses import success_response
from common.pagination import StandardResultsSetPagination
from common.audit import log_audit_event
from .models import SecurityKey
from .serializers import SecurityKeySerializer


class SecurityKeyViewSet(ModelViewSet):
    queryset = SecurityKey.objects.all()
    serializer_class = SecurityKeySerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return success_response(SecurityKeySerializer(self.get_queryset(), many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(created_by=request.user)
        log_audit_event(
            request=request,
            user=request.user,
            action="SECURITY_KEY_CREATED",
            resource_type="security_key",
            resource_id=instance.id,
            details={"name": instance.name, "fingerprint": instance.fingerprint},
            metadata={"name": instance.name, "fingerprint": instance.fingerprint},
        )
        return success_response(SecurityKeySerializer(instance).data, message="Key created", status_code=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="SECURITY_KEY_UPDATED",
            resource_type="security_key",
            resource_id=instance.id,
            details={"name": instance.name, "fingerprint": instance.fingerprint},
            metadata={"name": instance.name, "fingerprint": instance.fingerprint},
        )
        return success_response(serializer.data, message="Key updated")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        log_audit_event(
            request=request,
            user=request.user,
            action="SECURITY_KEY_DELETED",
            resource_type="security_key",
            resource_id=instance.id,
            details={"name": instance.name, "fingerprint": instance.fingerprint},
            metadata={"name": instance.name, "fingerprint": instance.fingerprint},
        )
        return success_response({"detail": "Key deleted"})
