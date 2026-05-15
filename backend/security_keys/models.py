import hashlib

from django.conf import settings
from django.db import models
from django.utils import timezone


class SecurityKey(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_ROTATED = "rotated"
    STATUS_REVOKED = "revoked"
    
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_ROTATED, "Rotated"),
        (STATUS_REVOKED, "Revoked"),
    ]
    
    ALGORITHM_SHA256 = "sha256"
    ALGORITHM_ECDSA = "ecdsa_p256"
    
    ALGORITHM_CHOICES = [
        (ALGORITHM_SHA256, "SHA-256"),
        (ALGORITHM_ECDSA, "ECDSA P-256"),
    ]

    # Key identification
    name = models.CharField(max_length=120)
    algorithm = models.CharField(max_length=32, choices=ALGORITHM_CHOICES, default=ALGORITHM_ECDSA)
    key_type = models.CharField(max_length=32, choices=[("signing", "Signing"), ("verification", "Verification")], default="signing")
    
    # Key material (encrypted for private keys)
    public_key = models.TextField()
    private_key = models.TextField(blank=True, default="")  # Only for ECDSA signing keys
    
    # Key metadata
    fingerprint = models.CharField(max_length=64, db_index=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)
    
    # Lifecycle tracking
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    rotated_from = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rotations",
    )
    rotation_reason = models.TextField(blank=True, default="")
    expires_at = models.DateTimeField(blank=True, null=True, db_index=True)
    last_used = models.DateTimeField(blank=True, null=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_keys",
    )
    rotated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rotated_keys",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["algorithm", "status"]),
            models.Index(fields=["algorithm", "key_type", "status"]),
        ]

    def save(self, *args, **kwargs):
        if self.public_key:
            self.fingerprint = hashlib.sha256(self.public_key.encode("utf-8")).hexdigest()[:16]
        super().save(*args, **kwargs)
