import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from common.validators import generate_upload_path, validate_attachment_file


def ticket_attachment_path(instance, filename):
    return generate_upload_path("ticket_attachments", filename)


def ticket_comment_attachment_path(instance, filename):
    return generate_upload_path("ticket_comment_attachments", filename)


class Ticket(models.Model):
    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"
    PRIORITY_URGENT = "urgent"

    STATUS_OPEN = "open"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_WAITING = "waiting_response"
    STATUS_RESOLVED = "resolved"
    STATUS_CLOSED = "closed"

    CATEGORY_TECHNICAL = "technical"
    CATEGORY_BILLING = "billing"
    CATEGORY_VERIFICATION = "verification"
    CATEGORY_ACCOUNT = "account"
    CATEGORY_ABUSE = "abuse"
    CATEGORY_GENERAL = "general"

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, "Low"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_HIGH, "High"),
        (PRIORITY_URGENT, "Urgent"),
    ]

    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_WAITING, "Waiting Response"),
        (STATUS_RESOLVED, "Resolved"),
        (STATUS_CLOSED, "Closed"),
    ]

    CATEGORY_CHOICES = [
        (CATEGORY_TECHNICAL, "Technical"),
        (CATEGORY_BILLING, "Billing"),
        (CATEGORY_VERIFICATION, "Verification"),
        (CATEGORY_ACCOUNT, "Account"),
        (CATEGORY_ABUSE, "Abuse"),
        (CATEGORY_GENERAL, "General"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=32, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=16, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_OPEN, db_index=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_tickets",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
    )

    internal_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    @staticmethod
    def generate_ticket_number() -> str:
        return f"TKT-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


class TicketAttachment(models.Model):
    id = models.BigAutoField(primary_key=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to=ticket_attachment_path, validators=[validate_attachment_file])
    uploaded_at = models.DateTimeField(default=timezone.now, db_index=True)


class TicketComment(models.Model):
    id = models.BigAutoField(primary_key=True)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    comment = models.TextField()
    created_at = models.DateTimeField(default=timezone.now, db_index=True)


class TicketCommentAttachment(models.Model):
    id = models.BigAutoField(primary_key=True)
    comment = models.ForeignKey(TicketComment, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to=ticket_comment_attachment_path, validators=[validate_attachment_file])
    uploaded_at = models.DateTimeField(default=timezone.now, db_index=True)
