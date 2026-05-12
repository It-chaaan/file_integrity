import os
import uuid

from django.core.exceptions import ValidationError


DEFAULT_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
DEFAULT_ATTACHMENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
}
DEFAULT_DOCUMENT_TYPES = set(DEFAULT_ATTACHMENT_TYPES)

IMAGE_MAX_BYTES = 2 * 1024 * 1024
ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024
DOCUMENT_MAX_BYTES = 10 * 1024 * 1024


def _validate_file_size(file_obj, max_bytes, label):
    if file_obj.size > max_bytes:
        raise ValidationError(f"{label} exceeds {max_bytes // (1024 * 1024)}MB limit.")


def _validate_content_type(file_obj, allowed_types, label):
    content_type = getattr(file_obj, "content_type", "") or ""
    if content_type not in allowed_types:
        raise ValidationError(f"{label} must be one of: {', '.join(sorted(allowed_types))}.")


def validate_image_file(file_obj):
    _validate_file_size(file_obj, IMAGE_MAX_BYTES, "Image")
    _validate_content_type(file_obj, DEFAULT_IMAGE_TYPES, "Image")


def validate_attachment_file(file_obj):
    _validate_file_size(file_obj, ATTACHMENT_MAX_BYTES, "Attachment")
    _validate_content_type(file_obj, DEFAULT_ATTACHMENT_TYPES, "Attachment")


def validate_document_file(file_obj):
    _validate_file_size(file_obj, DOCUMENT_MAX_BYTES, "Document")
    _validate_content_type(file_obj, DEFAULT_DOCUMENT_TYPES, "Document")


def generate_upload_path(prefix, filename):
    _, ext = os.path.splitext(filename)
    ext = ext.lower() or ".bin"
    return f"{prefix}/{uuid.uuid4().hex}{ext}"
