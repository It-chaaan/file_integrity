from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import Count, Q
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

try:
    from crypto_engine import deserialize_public_key_from_pem, verify_signature
except ImportError:
    from backend.crypto_engine import deserialize_public_key_from_pem, verify_signature

try:
    from crypto_engine import generate_hash_from_bytes
except ImportError:
    from backend.crypto_engine import generate_hash_from_bytes

from .constants import (
    DEFAULT_DOCUMENT_TYPES,
    VERIFY_STATUS_NOT_FOUND,
    VERIFY_STATUS_SIGNATURE_INVALID,
    VERIFY_STATUS_VERIFIED,
)
from .models import AuditLog, DocumentRecord, VerificationAttempt
from .serializers import (
    AuditLogSerializer,
    DocumentResponseSerializer,
    DocumentUpdateSerializer,
    DocumentUploadSerializer,
    VerificationAttemptSerializer,
)
from .services import (
    build_document_id,
    compute_hash_and_signature,
    format_short_hash,
    parse_metadata_value,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DocumentViewSet(ModelViewSet):
    queryset = DocumentRecord.objects.all().order_by("-created_at")
    serializer_class = DocumentResponseSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        search = params.get("search")
        status_value = params.get("status")
        document_type = params.get("document_type")
        date_from = parse_date(params.get("date_from", ""))
        date_to = parse_date(params.get("date_to", ""))
        ordering = params.get("ordering")

        if search:
            queryset = queryset.filter(
                Q(document_id__icontains=search)
                | Q(title__icontains=search)
                | Q(file_name__icontains=search)
                | Q(document_type__icontains=search)
                | Q(department__icontains=search)
                | Q(uploaded_by__icontains=search)
                | Q(sha256_hash__icontains=search)
            )

        if status_value:
            queryset = queryset.filter(status=status_value)

        if document_type:
            queryset = queryset.filter(document_type=document_type)

        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)

        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        allowed_ordering = {
            "created_at",
            "-created_at",
            "document_id",
            "-document_id",
            "title",
            "-title",
            "status",
            "-status",
        }
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uploaded_file = serializer.validated_data["file"]
        if not isinstance(uploaded_file, InMemoryUploadedFile):
            return Response(
                {
                    "detail": "Zero-retention policy requires in-memory uploads only.",
                    "error_code": "ZERO_RETENTION_MEMORY_ONLY",
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)

        metadata = parse_metadata_value(serializer.validated_data.get("metadata"))
        sha256_hash, signature, public_key_pem, fingerprint = compute_hash_and_signature(file_bytes)

        document = DocumentRecord.objects.create(
            document_id=build_document_id(),
            title=serializer.validated_data["title"],
            document_type=serializer.validated_data["document_type"],
            description=serializer.validated_data.get("description", ""),
            file_name=uploaded_file.name,
            file_size=getattr(uploaded_file, "size", 0),
            file_type=getattr(uploaded_file, "content_type", "") or "",
            department=str(metadata.get("department", "")),
            uploaded_by=str(metadata.get("uploaded_by", "")),
            sha256_hash=sha256_hash,
            short_hash=format_short_hash(sha256_hash),
            signature=signature,
            signer_public_key_pem=public_key_pem,
            signer_fingerprint=fingerprint,
            status="verified",
            metadata=metadata,
        )

        # Explicitly drop references to uploaded content after hash/signature are computed.
        del file_bytes

        response_serializer = DocumentResponseSerializer(document)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        document = self.get_object()
        serializer = DocumentUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        for field, value in serializer.validated_data.items():
            setattr(document, field, value)

        metadata = serializer.validated_data.get("metadata")
        if metadata is not None:
            document.metadata = parse_metadata_value(metadata)
            document.department = str(document.metadata.get("department", document.department))
            document.uploaded_by = str(document.metadata.get("uploaded_by", document.uploaded_by))

        document.save()

        response_serializer = DocumentResponseSerializer(document)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="verify")
    def verify_document(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response({"detail": "Missing file field."}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(uploaded_file, InMemoryUploadedFile):
            return Response(
                {
                    "detail": "Zero-retention policy requires in-memory uploads only.",
                    "error_code": "ZERO_RETENTION_MEMORY_ONLY",
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)

        sha256_hash = generate_hash_from_bytes(file_bytes)
        document = DocumentRecord.objects.filter(sha256_hash=sha256_hash).first()

        found = document is not None
        is_authentic = False
        verify_status = VERIFY_STATUS_NOT_FOUND

        if document:
            public_key = deserialize_public_key_from_pem(document.signer_public_key_pem)
            is_authentic = verify_signature(public_key, document.signature, sha256_hash)
            verify_status = VERIFY_STATUS_VERIFIED if is_authentic else VERIFY_STATUS_SIGNATURE_INVALID

        VerificationAttempt.objects.create(
            document=document,
            file_name=uploaded_file.name,
            file_size=getattr(uploaded_file, "size", 0),
            sha256_hash=sha256_hash,
            found=found,
            is_authentic=is_authentic,
            status=verify_status,
        )

        del file_bytes

        response_payload = {
            "filename": uploaded_file.name,
            "fileName": uploaded_file.name,
            "hash": sha256_hash,
            "found": found,
            "isAuthentic": is_authentic,
            "status": verify_status,
        }

        if document:
            response_payload.update(
                {
                    "documentId": document.document_id,
                    "documentType": document.document_type,
                    "fileSize": document.file_size,
                    "uploadDate": document.created_at,
                    "uploadedBy": document.uploaded_by,
                    "signature": document.signature,
                }
            )

        return Response(response_payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="batch-verify")
    def batch_verify(self, request):
        files = request.FILES.getlist("files")

        if not files:
            return Response({"detail": "Missing files field."}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for uploaded_file in files:
            if not isinstance(uploaded_file, InMemoryUploadedFile):
                results.append(
                    {
                        "filename": uploaded_file.name,
                        "status": "REJECTED_NON_MEMORY_UPLOAD",
                        "found": False,
                        "isAuthentic": False,
                    }
                )
                continue

            file_bytes = uploaded_file.read()
            uploaded_file.seek(0)

            sha256_hash = generate_hash_from_bytes(file_bytes)
            document = DocumentRecord.objects.filter(sha256_hash=sha256_hash).first()
            found = document is not None

            is_authentic = False
            verify_status = VERIFY_STATUS_NOT_FOUND
            if document:
                public_key = deserialize_public_key_from_pem(document.signer_public_key_pem)
                is_authentic = verify_signature(public_key, document.signature, sha256_hash)
                verify_status = VERIFY_STATUS_VERIFIED if is_authentic else VERIFY_STATUS_SIGNATURE_INVALID

            VerificationAttempt.objects.create(
                document=document,
                file_name=uploaded_file.name,
                file_size=getattr(uploaded_file, "size", 0),
                sha256_hash=sha256_hash,
                found=found,
                is_authentic=is_authentic,
                status=verify_status,
            )

            results.append(
                {
                    "filename": uploaded_file.name,
                    "hash": sha256_hash,
                    "found": found,
                    "isAuthentic": is_authentic,
                    "status": verify_status,
                    "documentId": document.document_id if document else None,
                }
            )

            del file_bytes

        return Response({"results": results, "count": len(results)}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="search-by-hash")
    def search_by_hash(self, request):
        hash_value = request.query_params.get("hash")
        if not hash_value:
            return Response({"detail": "hash query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        document = DocumentRecord.objects.filter(sha256_hash=hash_value).first()
        if not document:
            return Response({"found": False}, status=status.HTTP_200_OK)

        payload = DocumentResponseSerializer(document).data
        payload["found"] = True
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        aggregates = DocumentRecord.objects.aggregate(
            total=Count("id"),
            verified=Count("id", filter=Q(status="verified")),
            pending=Count("id", filter=Q(status="pending")),
            failed=Count("id", filter=Q(status="failed")),
            expired=Count("id", filter=Q(status="expired")),
        )
        return Response(aggregates, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="types")
    def types(self, request):
        db_types = list(
            DocumentRecord.objects.order_by("document_type")
            .values_list("document_type", flat=True)
            .distinct()
        )

        if not db_types:
            db_types = DEFAULT_DOCUMENT_TYPES

        return Response(db_types, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="verifications")
    def verifications(self, request, pk=None):
        document = self.get_object()
        attempts = document.verification_attempts.all().order_by("-checked_at")
        serializer = VerificationAttemptSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        self.get_object()
        return Response(
            {
                "detail": "Zero-retention architecture active: original files are never persisted and cannot be downloaded.",
                "error_code": "ZERO_RETENTION_NO_FILE_COPY",
            },
            status=status.HTTP_410_GONE,
        )


class AuditLogViewSet(ModelViewSet):
    queryset = AuditLog.objects.all().order_by("-timestamp")
    serializer_class = AuditLogSerializer
    pagination_class = StandardResultsSetPagination

    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        action = params.get("action")
        resource_type = params.get("resource_type")
        user_id = params.get("user_id")
        search = params.get("search")

        if action:
            queryset = queryset.filter(action=action)

        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)

        if user_id:
            queryset = queryset.filter(metadata__user_id=str(user_id))

        if search:
            queryset = queryset.filter(Q(action__icontains=search) | Q(details__icontains=search))

        return queryset

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        totals = AuditLog.objects.aggregate(total=Count("id"))
        by_action = (
            AuditLog.objects.values("action")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        return Response({"total": totals["total"], "top_actions": list(by_action)})
