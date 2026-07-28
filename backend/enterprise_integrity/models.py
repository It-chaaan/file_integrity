import uuid
import hashlib
import json

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .constants import DOCUMENT_STATUS_CHOICES, STATUS_VERIFIED


class DocumentRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_number = models.CharField(max_length=64, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=120, db_index=True)
    description = models.TextField(blank=True, default="")

    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=120, blank=True, default="")

    department = models.CharField(max_length=120, blank=True, default="")
    uploaded_by = models.CharField(max_length=120, blank=True, default="")

    document_hash = models.CharField(max_length=64, unique=True, db_index=True)
    short_hash = models.CharField(max_length=13, db_index=True)
    signature = models.TextField()
    signer_public_key_pem = models.TextField()
    signer_fingerprint = models.CharField(max_length=16, db_index=True)

    status = models.CharField(
        max_length=16,
        choices=DOCUMENT_STATUS_CHOICES,
        default=STATUS_VERIFIED,
        db_index=True,
    )
    metadata = models.JSONField(default=dict, blank=True)

    verified_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference_number} - {self.title}"


class VerificationAttempt(models.Model):
    id = models.BigAutoField(primary_key=True)
    document = models.ForeignKey(
        DocumentRecord,
        on_delete=models.SET_NULL,
        related_name="verification_attempts",
        null=True,
        blank=True,
    )
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField(default=0)
    document_hash = models.CharField(max_length=64, db_index=True)

    found = models.BooleanField(default=False)
    is_authentic = models.BooleanField(default=False)
    status = models.CharField(max_length=32)

    checked_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-checked_at"]


class AuditLog(models.Model):
    SEVERITY_INFO = "info"
    SEVERITY_WARNING = "warning"
    SEVERITY_CRITICAL = "critical"

    SEVERITY_CHOICES = [
        (SEVERITY_INFO, "Info"),
        (SEVERITY_WARNING, "Warning"),
        (SEVERITY_CRITICAL, "Critical"),
    ]

    STATUS_SUCCESS = "SUCCESS"
    STATUS_FAILED = "FAILED"

    STATUS_CHOICES = [
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=100, db_index=True)
    resource_type = models.CharField(max_length=60, db_index=True)
    resource_id = models.CharField(max_length=64, blank=True, default="", db_index=True)
    details = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=45, blank=True, default="")
    user_agent = models.TextField(blank=True, default="")
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES, default=SEVERITY_INFO)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_SUCCESS)
    previous_hash = models.CharField(max_length=64, blank=True, default="")
    log_hash = models.CharField(max_length=64, unique=True, db_index=True, blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValidationError("Audit logs are append-only and cannot be modified.")

        if not self.log_hash:
            previous_entry = AuditLog.objects.order_by("-id").only("log_hash").first()
            self.previous_hash = previous_entry.log_hash if previous_entry else ""
            payload = {
                "user_id": self.user_id,
                "action": self.action,
                "resource_type": self.resource_type,
                "resource_id": self.resource_id,
                "status": self.status,
                "severity": self.severity,
                "details": self.details,
                "metadata": self.metadata,
                "ip_address": self.ip_address,
                "user_agent": self.user_agent,
                "created_at": self.created_at.isoformat() if self.created_at else "",
                "previous_hash": self.previous_hash,
            }
            encoded_payload = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
            self.log_hash = hashlib.sha256(encoded_payload).hexdigest()

        super().save(*args, **kwargs)
