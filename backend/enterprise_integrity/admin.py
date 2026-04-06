from django.contrib import admin

from .models import AuditLog, DocumentRecord, VerificationAttempt


@admin.register(DocumentRecord)
class DocumentRecordAdmin(admin.ModelAdmin):
    list_display = ("document_id", "title", "document_type", "status", "uploaded_by", "created_at")
    search_fields = ("document_id", "title", "document_type", "uploaded_by", "sha256_hash")
    list_filter = ("status", "document_type", "created_at")


@admin.register(VerificationAttempt)
class VerificationAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "document", "file_name", "found", "is_authentic", "status", "checked_at")
    search_fields = ("file_name", "sha256_hash", "document__document_id")
    list_filter = ("found", "is_authentic", "status", "checked_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "action", "resource_type", "resource_id", "timestamp")
    search_fields = ("action", "resource_type", "resource_id", "details")
    list_filter = ("action", "resource_type", "timestamp")
