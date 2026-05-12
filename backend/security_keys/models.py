import hashlib

from django.conf import settings
from django.db import models
from django.utils import timezone


class SecurityKey(models.Model):
    name = models.CharField(max_length=120)
    public_key = models.TextField()
    fingerprint = models.CharField(max_length=64, db_index=True)
    last_used = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_keys",
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.public_key:
            self.fingerprint = hashlib.sha256(self.public_key.encode("utf-8")).hexdigest()
        super().save(*args, **kwargs)
