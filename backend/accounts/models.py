from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from common.validators import generate_upload_path, validate_image_file


def profile_photo_path(instance, filename):
    return generate_upload_path("profile_photos", filename)


class User(AbstractUser):
    ROLE_SUPER_ADMIN = "super_admin"
    ROLE_ADMIN = "admin"
    ROLE_STAFF = "staff"
    ROLE_VERIFIER = "verifier"
    ROLE_CLIENT = "client"

    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, "Super Admin"),
        (ROLE_ADMIN, "Admin"),
        (ROLE_STAFF, "Staff"),
        (ROLE_VERIFIER, "Verifier"),
        (ROLE_CLIENT, "Client"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_CLIENT)
    department = models.CharField(max_length=120, blank=True, default="")
    phone = models.CharField(max_length=32, blank=True, default="")
    profile_photo = models.ImageField(
        upload_to=profile_photo_path,
        blank=True,
        null=True,
        validators=[validate_image_file],
    )
    last_activity = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=512, blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def touch_activity(self):
        self.last_activity = timezone.now()
        self.save(update_fields=["last_activity"])
