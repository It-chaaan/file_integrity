from rest_framework import serializers

from .models import AuditLog, DocumentRecord, VerificationAttempt
from common.validators import validate_document_file
from .services import parse_metadata_value


class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True, validators=[validate_document_file])
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
    documentId = serializers.CharField(source="reference_number", read_only=True)
    referenceNumber = serializers.CharField(source="reference_number", read_only=True)
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
            "reference_number",
            "documentId",
            "referenceNumber",
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
            "document_hash",
            "hash",
            "short_hash",
            "shortHash",
            "signature",
            "status",
            "metadata",
            "verified_at",
            "created_at",
            "uploadDate",
            "updated_at",
        ]

    hash = serializers.CharField(source="document_hash", read_only=True)


class PublicDocumentLookupSerializer(serializers.ModelSerializer):
    documentId = serializers.CharField(source="reference_number", read_only=True)
    referenceNumber = serializers.CharField(source="reference_number", read_only=True)
    documentType = serializers.CharField(source="document_type", read_only=True)
    verificationDate = serializers.DateTimeField(source="verified_at", read_only=True)

    class Meta:
        model = DocumentRecord
        fields = [
            "documentId",
            "referenceNumber",
            "documentType",
            "verificationDate",
            "status",
        ]


class VerificationAttemptSerializer(serializers.ModelSerializer):
    reference_number = serializers.CharField(source="document.reference_number", read_only=True)

    class Meta:
        model = VerificationAttempt
        fields = [
            "id",
            "reference_number",
            "file_name",
            "file_size",
            "document_hash",
            "found",
            "is_authentic",
            "status",
            "checked_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user_id",
            "username",
            "action",
            "resource_type",
            "resource_id",
            "status",
            "details",
            "metadata",
            "ip_address",
            "user_agent",
            "severity",
            "created_at",
        ]
