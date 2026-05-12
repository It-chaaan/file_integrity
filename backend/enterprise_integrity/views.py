from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import Count, Q
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek
import csv
import io
from django.http import StreamingHttpResponse
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework import permissions

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
    build_reference_number,
    compute_hash_and_signature,
    format_short_hash,
    get_verification_public_key_pem,
    parse_metadata_value,
)
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from common.permissions import (
    IsAdminOrSuper,
    IsStaffOrAdmin,
    IsStaffOrAdminOrClient,
    IsVerifierOrStaffOrAdmin,
    IsStaffOrAdminOrVerifierOrClient,
)
from common.audit import log_audit_event


class DocumentViewSet(ModelViewSet):
    queryset = DocumentRecord.objects.all().order_by("-created_at")
    serializer_class = DocumentResponseSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in {"verify_document", "batch_verify", "search_by_hash"}:
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsStaffOrAdminOrClient()]
        if self.action in {"partial_update", "destroy"}:
            return [permissions.IsAuthenticated(), IsStaffOrAdmin()]
        return [permissions.IsAuthenticated(), IsVerifierOrStaffOrAdmin()]

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        if getattr(self.request, "user", None) and self.request.user.is_authenticated:
            if self.request.user.role == "client":
                queryset = queryset.filter(uploaded_by=self.request.user.username)
            elif self.request.user.role not in {"verifier", "staff", "admin", "super_admin"}:
                return queryset.none()

        search = params.get("search")
        status_value = params.get("status")
        document_type = params.get("document_type")
        date_from = parse_date(params.get("date_from", ""))
        date_to = parse_date(params.get("date_to", ""))
        ordering = params.get("ordering")

        if search:
            queryset = queryset.filter(
                Q(reference_number__icontains=search)
                | Q(title__icontains=search)
                | Q(file_name__icontains=search)
                | Q(document_type__icontains=search)
                | Q(department__icontains=search)
                | Q(uploaded_by__icontains=search)
                | Q(document_hash__icontains=search)
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
            "reference_number",
            "-reference_number",
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
            return error_response(
                "Zero-retention policy requires in-memory uploads only.",
                errors={"error_code": "ZERO_RETENTION_MEMORY_ONLY"},
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)

        metadata = parse_metadata_value(serializer.validated_data.get("metadata"))
        if getattr(request.user, "role", None) == "client":
            metadata = {**metadata, "uploaded_by": request.user.username}
        sha256_hash, signature, public_key_pem, fingerprint = compute_hash_and_signature(file_bytes)

        # Persist only hash/signature metadata via the ORM (no file retention).
        document = DocumentRecord.objects.create(
            reference_number=build_reference_number(),
            title=serializer.validated_data["title"],
            document_type=serializer.validated_data["document_type"],
            description=serializer.validated_data.get("description", ""),
            file_name=uploaded_file.name,
            file_size=getattr(uploaded_file, "size", 0),
            file_type=getattr(uploaded_file, "content_type", "") or "",
            department=str(metadata.get("department", "")),
            uploaded_by=str(metadata.get("uploaded_by", "")),
            document_hash=sha256_hash,
            short_hash=format_short_hash(sha256_hash),
            signature=signature,
            signer_public_key_pem=public_key_pem,
            signer_fingerprint=fingerprint,
            status="verified",
            metadata=metadata,
        )

        # Explicitly drop references to uploaded content after hash/signature are computed.
        del file_bytes

        log_audit_event(
            request=request,
            user=request.user,
            action="DOCUMENT_CREATED",
            resource_type="document",
            resource_id=document.id,
            details={"reference_number": document.reference_number},
            metadata={"reference_number": document.reference_number},
        )

        response_serializer = DocumentResponseSerializer(document)
        return success_response(response_serializer.data, message="Document created", status_code=status.HTTP_201_CREATED)

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
        return success_response(response_serializer.data, message="Document updated")

    @action(detail=False, methods=["post"], url_path="verify")
    def verify_document(self, request):
        uploaded_file = request.FILES.get("file")
        reference_number = request.data.get("reference_number") or request.data.get("referenceNumber")

        if not uploaded_file:
            return error_response("Missing file field.", status_code=status.HTTP_400_BAD_REQUEST)

        if not reference_number:
            return error_response("Missing reference_number field.", status_code=status.HTTP_400_BAD_REQUEST)

        if not isinstance(uploaded_file, InMemoryUploadedFile):
            return error_response(
                "Zero-retention policy requires in-memory uploads only.",
                errors={"error_code": "ZERO_RETENTION_MEMORY_ONLY"},
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        file_bytes = uploaded_file.read()
        uploaded_file.seek(0)

        sha256_hash = generate_hash_from_bytes(file_bytes)
        document = DocumentRecord.objects.filter(reference_number=reference_number).first()

        found = document is not None
        is_authentic = False
        verify_status = VERIFY_STATUS_NOT_FOUND

        if document:
            pem_value = document.signer_public_key_pem or get_verification_public_key_pem()
            public_key = deserialize_public_key_from_pem(pem_value)
            hash_matches = sha256_hash == document.document_hash
            is_authentic = hash_matches and verify_signature(public_key, document.signature, sha256_hash)
            verify_status = VERIFY_STATUS_VERIFIED if is_authentic else VERIFY_STATUS_SIGNATURE_INVALID

        VerificationAttempt.objects.create(
            document=document,
            file_name=uploaded_file.name,
            file_size=getattr(uploaded_file, "size", 0),
            document_hash=sha256_hash,
            found=found,
            is_authentic=is_authentic,
            status=verify_status,
        )

        del file_bytes

        log_audit_event(
            request=request,
            user=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
            action="DOCUMENT_VERIFY",
            resource_type="document",
            resource_id=document.id if document else "",
            details={"reference_number": reference_number, "found": found, "is_authentic": is_authentic},
            metadata={"reference_number": reference_number, "found": found, "is_authentic": is_authentic},
        )

        response_payload = {
            "filename": uploaded_file.name,
            "fileName": uploaded_file.name,
            "hash": sha256_hash,
            "found": found,
            "isAuthentic": is_authentic,
            "status": verify_status,
            "referenceNumber": reference_number,
        }

        if document:
            response_payload.update(
                {
                    "documentId": document.reference_number,
                    "referenceNumber": document.reference_number,
                    "documentType": document.document_type,
                    "fileSize": document.file_size,
                    "uploadDate": document.verified_at,
                    "uploadedBy": document.uploaded_by,
                    "signature": document.signature,
                }
            )

        return success_response(response_payload)

    @action(detail=False, methods=["post"], url_path="batch-verify")
    def batch_verify(self, request):
        files = request.FILES.getlist("files")

        if not files:
            return error_response("Missing files field.", status_code=status.HTTP_400_BAD_REQUEST)

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
            document = DocumentRecord.objects.filter(document_hash=sha256_hash).first()
            found = document is not None

            is_authentic = False
            verify_status = VERIFY_STATUS_NOT_FOUND
            if document:
                pem_value = document.signer_public_key_pem or get_verification_public_key_pem()
                public_key = deserialize_public_key_from_pem(pem_value)
                is_authentic = verify_signature(public_key, document.signature, sha256_hash)
                verify_status = VERIFY_STATUS_VERIFIED if is_authentic else VERIFY_STATUS_SIGNATURE_INVALID

            VerificationAttempt.objects.create(
                document=document,
                file_name=uploaded_file.name,
                file_size=getattr(uploaded_file, "size", 0),
                document_hash=sha256_hash,
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
                    "documentId": document.reference_number if document else None,
                    "referenceNumber": document.reference_number if document else None,
                }
            )

            del file_bytes

        log_audit_event(
            request=request,
            user=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
            action="DOCUMENT_BATCH_VERIFY",
            resource_type="document",
            resource_id="batch",
            details={"count": len(results)},
            metadata={"count": len(results)},
        )

        return success_response({"results": results, "count": len(results)})

    @action(detail=False, methods=["get"], url_path="search-by-hash")
    def search_by_hash(self, request):
        hash_value = request.query_params.get("hash")
        if not hash_value:
            return error_response("hash query parameter is required.", status_code=status.HTTP_400_BAD_REQUEST)

        document = DocumentRecord.objects.filter(document_hash=hash_value).first()
        if not document:
            return success_response({"found": False})

        payload = DocumentResponseSerializer(document).data
        payload["found"] = True
        return success_response(payload)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        aggregates = DocumentRecord.objects.aggregate(
            total=Count("id"),
            verified=Count("id", filter=Q(status="verified")),
            pending=Count("id", filter=Q(status="pending")),
            failed=Count("id", filter=Q(status="failed")),
            expired=Count("id", filter=Q(status="expired")),
        )
        return success_response(aggregates)

    @action(detail=False, methods=["get"], url_path="types")
    def types(self, request):
        db_types = list(
            DocumentRecord.objects.order_by("document_type")
            .values_list("document_type", flat=True)
            .distinct()
        )

        if not db_types:
            db_types = DEFAULT_DOCUMENT_TYPES

        return success_response(db_types)

    @action(detail=True, methods=["get"], url_path="verifications")
    def verifications(self, request, pk=None):
        document = self.get_object()
        attempts = document.verification_attempts.all().order_by("-checked_at")
        serializer = VerificationAttemptSerializer(attempts, many=True)
        return success_response(serializer.data)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        self.get_object()
        return error_response(
            "Zero-retention architecture active: original files are never persisted and cannot be downloaded.",
            errors={"error_code": "ZERO_RETENTION_NO_FILE_COPY"},
            status_code=status.HTTP_410_GONE,
        )


class AuditLogViewSet(ModelViewSet):
    queryset = AuditLog.objects.all().order_by("-created_at")
    serializer_class = AuditLogSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuper]

    http_method_names = ["get", "post", "head", "options"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(user=request.user)
        return success_response(AuditLogSerializer(instance).data, message="Audit log created", status_code=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        action = params.get("action")
        resource_type = params.get("resource_type")
        user_id = params.get("user_id")
        search = params.get("search")
        severity = params.get("severity")

        if action:
            queryset = queryset.filter(action=action)

        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)

        if user_id:
            queryset = queryset.filter(user_id=str(user_id))

        if severity:
            queryset = queryset.filter(severity=severity)

        if search:
            queryset = queryset.filter(
                Q(action__icontains=search)
                | Q(resource_type__icontains=search)
                | Q(resource_id__icontains=search)
            )

        return queryset

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        totals = AuditLog.objects.aggregate(total=Count("id"))
        by_action = (
            AuditLog.objects.values("action")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        return success_response({"total": totals["total"], "top_actions": list(by_action)})

    @action(detail=False, methods=["get"], url_path="user/(?P<user_id>[^/.]+)")
    def by_user(self, request, user_id=None):
        queryset = self.get_queryset().filter(user_id=user_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(AuditLogSerializer(page, many=True).data)
        return success_response(AuditLogSerializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="by-action")
    def by_action(self, request):
        action_value = request.query_params.get("action")
        queryset = self.get_queryset().filter(action=action_value) if action_value else self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(AuditLogSerializer(page, many=True).data)
        return success_response(AuditLogSerializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="resource/(?P<resource_type>[^/.]+)/(?P<resource_id>[^/.]+)")
    def by_resource(self, request, resource_type=None, resource_id=None):
        queryset = self.get_queryset().filter(resource_type=resource_type, resource_id=resource_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(AuditLogSerializer(page, many=True).data)
        return success_response(AuditLogSerializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="security")
    def security(self, request):
        queryset = self.get_queryset().filter(severity__in=[AuditLog.SEVERITY_WARNING, AuditLog.SEVERITY_CRITICAL])
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(AuditLogSerializer(page, many=True).data)
        return success_response(AuditLogSerializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="failed-logins")
    def failed_logins(self, request):
        queryset = self.get_queryset().filter(action="AUTH_LOGIN_FAILED")
        return success_response(AuditLogSerializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="timeline")
    def timeline(self, request):
        granularity = request.query_params.get("granularity", "day")
        trunc_map = {
            "day": TruncDay("created_at"),
            "week": TruncWeek("created_at"),
            "month": TruncMonth("created_at"),
        }
        trunc = trunc_map.get(granularity, TruncDay("created_at"))
        data = (
            AuditLog.objects.annotate(period=trunc)
            .values("period")
            .annotate(count=Count("id"))
            .order_by("period")
        )
        return success_response(list(data))

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        stream = str(request.query_params.get("stream", "")).lower() in {"1", "true", "yes"}
        header = [
            "id",
            "user",
            "action",
            "resource_type",
            "resource_id",
            "status",
            "severity",
            "details",
            "created_at",
        ]
        if stream:
            class Echo:
                def write(self, value):
                    return value

            writer = csv.writer(Echo())
            def row_iter():
                yield header
                for log in self.get_queryset():
                    yield [
                        log.id,
                        log.user_id,
                        log.action,
                        log.resource_type,
                        log.resource_id,
                        log.status,
                        log.severity,
                        log.details,
                        log.created_at,
                    ]

            response = StreamingHttpResponse(
                (writer.writerow(row) for row in row_iter()),
                content_type="text/csv",
            )
            response["Content-Disposition"] = "attachment; filename=audit_logs.csv"
            return response

        output = io.StringIO()
        csv_writer = csv.writer(output)
        csv_writer.writerow(header)
        for log in self.get_queryset():
            csv_writer.writerow([
                log.id,
                log.user_id,
                log.action,
                log.resource_type,
                log.resource_id,
                log.status,
                log.severity,
                log.details,
                log.created_at,
            ])
        return success_response(
            {
                "filename": "audit_logs.csv",
                "content_type": "text/csv",
                "content": output.getvalue(),
            },
            message="Audit logs exported",
        )

    @action(detail=False, methods=["get"], url_path="action-types")
    def action_types(self, request):
        actions = AuditLog.objects.values_list("action", flat=True).distinct().order_by("action")
        return success_response(list(actions))

    @action(detail=False, methods=["get"], url_path="resource-types")
    def resource_types(self, request):
        resources = AuditLog.objects.values_list("resource_type", flat=True).distinct().order_by("resource_type")
        return success_response(list(resources))

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        query = request.query_params.get("q", "")
        queryset = self.get_queryset().filter(
            Q(action__icontains=query)
            | Q(resource_type__icontains=query)
            | Q(resource_id__icontains=query)
        )
        return success_response(AuditLogSerializer(queryset, many=True).data)

    @action(detail=False, methods=["get"], url_path="recent")
    def recent(self, request):
        limit = int(request.query_params.get("limit", 10))
        queryset = self.get_queryset().order_by("-created_at")[:limit]
        return success_response(AuditLogSerializer(queryset, many=True).data)
