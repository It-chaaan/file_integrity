from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

from common.permissions import IsSuperAdmin
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from common.audit import log_audit_event
from enterprise_integrity.services import reset_signing_private_key_cache
from enterprise_integrity.models import DocumentRecord

from .models import SecurityKey
from .key_material import build_encrypted_ecdsa_key_pair
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
        try:
            instance = serializer.save(created_by=request.user)
        except RuntimeError as exc:
            return error_response(str(exc), status_code=status.HTTP_400_BAD_REQUEST)
        reset_signing_private_key_cache()
        log_audit_event(
            request=request,
            user=request.user,
            action="SECURITY_KEY_CREATED",
            resource_type="security_key",
            resource_id=instance.id,
            details={"name": instance.name, "fingerprint": instance.fingerprint, "algorithm": instance.algorithm},
            metadata={"name": instance.name, "fingerprint": instance.fingerprint, "algorithm": instance.algorithm},
        )
        return success_response(SecurityKeySerializer(instance).data, message="Key created", status_code=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        reset_signing_private_key_cache()
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
        if instance.status == SecurityKey.STATUS_ACTIVE:
            return error_response(
                "Active signing keys cannot be deleted. Revoke or rotate the key instead.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        if DocumentRecord.objects.filter(signer_fingerprint=instance.fingerprint).exists():
            return error_response(
                "Keys used to sign registered documents cannot be deleted.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        instance.delete()
        reset_signing_private_key_cache()
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

    @action(detail=True, methods=["post"])
    def rotate(self, request, pk=None):
        """Rotate a key by generating a new key pair and marking the old one as rotated."""
        old_key = self.get_object()
        rotation_reason = (request.data.get("rotation_reason") or "").strip()

        if old_key.status != SecurityKey.STATUS_ACTIVE:
            return error_response("Only active keys can be rotated.", status_code=status.HTTP_400_BAD_REQUEST)
        if not rotation_reason:
            return error_response("rotation_reason is required.", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            public_key_pem, encrypted_private_key = build_encrypted_ecdsa_key_pair()

            # Mark old key as rotated
            old_key.status = SecurityKey.STATUS_ROTATED
            old_key.save()

            # Create new key
            new_key = SecurityKey.objects.create(
                name=f"{old_key.name} (rotated)",
                algorithm=old_key.algorithm,
                key_type=old_key.key_type,
                public_key=public_key_pem,
                private_key=encrypted_private_key,
                status=SecurityKey.STATUS_ACTIVE,
                created_by=request.user,
                rotated_by=request.user,
                rotated_from=old_key,
                rotation_reason=rotation_reason,
            )
            reset_signing_private_key_cache()

            log_audit_event(
                request=request,
                user=request.user,
                action="SECURITY_KEY_ROTATED",
                resource_type="security_key",
                resource_id=new_key.id,
                details={
                    "old_key_id": old_key.id,
                    "new_key_id": new_key.id,
                    "rotation_reason": rotation_reason,
                },
                metadata={
                    "old_key_fingerprint": old_key.fingerprint,
                    "new_key_fingerprint": new_key.fingerprint,
                },
            )

            return success_response(
                self.get_serializer(new_key).data,
                message="Key rotated successfully",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return error_response(
                f"Failed to rotate key: {str(e)}",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        """Revoke a key."""
        key = self.get_object()
        revocation_reason = (request.data.get("revocation_reason") or "").strip()
        if not revocation_reason:
            return error_response("revocation_reason is required.", status_code=status.HTTP_400_BAD_REQUEST)
        if key.status == SecurityKey.STATUS_REVOKED:
            return success_response(self.get_serializer(key).data, message="Key already revoked")
        key.status = SecurityKey.STATUS_REVOKED
        key.rotation_reason = f"Revoked: {revocation_reason}"
        key.save()
        reset_signing_private_key_cache()

        log_audit_event(
            request=request,
            user=request.user,
            action="SECURITY_KEY_REVOKED",
            resource_type="security_key",
            resource_id=key.id,
            details={"name": key.name, "fingerprint": key.fingerprint, "revocation_reason": revocation_reason},
            metadata={"name": key.name, "fingerprint": key.fingerprint, "revocation_reason": revocation_reason},
        )

        return success_response(self.get_serializer(key).data, message="Key revoked")
