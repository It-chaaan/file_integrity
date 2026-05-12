from django.contrib import admin

from .models import AuditLog, DocumentRecord, VerificationAttempt


@admin.register(DocumentRecord)
class DocumentRecordAdmin(admin.ModelAdmin):
    list_display = ("reference_number", "title", "document_type", "status", "uploaded_by", "created_at")
    search_fields = ("reference_number", "title", "document_type", "uploaded_by", "document_hash")
    list_filter = ("status", "document_type", "created_at")


@admin.register(VerificationAttempt)
class VerificationAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "document", "file_name", "found", "is_authentic", "status", "checked_at")
    search_fields = ("file_name", "document_hash", "document__reference_number")
    list_filter = ("found", "is_authentic", "status", "checked_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "action", "resource_type", "resource_id", "severity", "created_at")
    search_fields = ("action", "resource_type", "resource_id")
    list_filter = ("action", "resource_type", "severity", "created_at")
