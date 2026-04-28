import uuid

from django.db import models
from django.utils import timezone

from .constants import DOCUMENT_STATUS_CHOICES, STATUS_VERIFIED


class DocumentRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_id = models.CharField(max_length=32, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=120, db_index=True)
    description = models.TextField(blank=True, default="")

    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=120, blank=True, default="")

    department = models.CharField(max_length=120, blank=True, default="")
    uploaded_by = models.CharField(max_length=120, blank=True, default="")

    sha256_hash = models.CharField(max_length=64, db_index=True)
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

    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.document_id} - {self.title}"


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
    sha256_hash = models.CharField(max_length=64, db_index=True)

    found = models.BooleanField(default=False)
    is_authentic = models.BooleanField(default=False)
    status = models.CharField(max_length=32)

    checked_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-checked_at"]


class AuditLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    action = models.CharField(max_length=100, db_index=True)
    resource_type = models.CharField(max_length=60, db_index=True)
    resource_id = models.CharField(max_length=64, blank=True, default="", db_index=True)
    details = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
