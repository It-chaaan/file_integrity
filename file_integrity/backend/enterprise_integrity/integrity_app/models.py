import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
	ROLE_ADMIN = "ADMIN"
	ROLE_STAFF = "STAFF"
	ROLE_CHOICES = [
		(ROLE_ADMIN, "Admin"),
		(ROLE_STAFF, "Staff"),
	]

	role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STAFF)

	def __str__(self) -> str:
		return self.get_username()


class DocumentRecord(models.Model):
	document_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	title = models.CharField(max_length=255)
	sha256_hash = models.CharField(max_length=64)
	signature = models.TextField()
	signer_public_key_pem = models.TextField()

	def __str__(self) -> str:
		return f"{self.title} ({self.document_id})"


class AuditLog(models.Model):
	action = models.CharField(max_length=255)
	timestamp = models.DateTimeField(default=timezone.now)
	details = models.TextField()

	def __str__(self) -> str:
		return f"{self.action} @ {self.timestamp.isoformat()}"
