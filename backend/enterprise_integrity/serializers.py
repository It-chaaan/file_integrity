from rest_framework import serializers

from .models import AuditLog, DocumentRecord, VerificationAttempt
from .services import parse_metadata_value


class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    title = serializers.CharField(max_length=255)
    document_type = serializers.CharField(max_length=120)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    metadata = serializers.JSONField(required=False)

    def validate_metadata(self, value):
        return parse_metadata_value(value)


class DocumentUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    document_type = serializers.CharField(max_length=120, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False)
    status = serializers.ChoiceField(
        choices=["verified", "pending", "failed", "expired"],
        required=False,
    )

    def validate_metadata(self, value):
        return parse_metadata_value(value)


class DocumentResponseSerializer(serializers.ModelSerializer):
    documentId = serializers.CharField(source="document_id", read_only=True)
    fileName = serializers.CharField(source="file_name", read_only=True)
    documentType = serializers.CharField(source="document_type", read_only=True)
    fileSize = serializers.IntegerField(source="file_size", read_only=True)
    uploadDate = serializers.DateTimeField(source="created_at", read_only=True)
    uploadedBy = serializers.CharField(source="uploaded_by", read_only=True)
    shortHash = serializers.CharField(source="short_hash", read_only=True)

    class Meta:
        model = DocumentRecord
        fields = [
            "id",
            "document_id",
            "documentId",
            "title",
            "description",
            "document_type",
            "documentType",
            "file_name",
            "fileName",
            "file_size",
            "fileSize",
            "file_type",
            "department",
            "uploaded_by",
            "uploadedBy",
            "sha256_hash",
            "hash",
            "short_hash",
            "shortHash",
            "signature",
            "status",
            "metadata",
            "created_at",
            "uploadDate",
            "updated_at",
        ]

    hash = serializers.CharField(source="sha256_hash", read_only=True)


class VerificationAttemptSerializer(serializers.ModelSerializer):
    document_id = serializers.CharField(source="document.document_id", read_only=True)

    class Meta:
        model = VerificationAttempt
        fields = [
            "id",
            "document_id",
            "file_name",
            "file_size",
            "sha256_hash",
            "found",
            "is_authentic",
            "status",
            "checked_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id",
            "action",
            "resource_type",
            "resource_id",
            "details",
            "metadata",
            "timestamp",
        ]
