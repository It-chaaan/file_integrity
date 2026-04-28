"""
Mock views for API testing without database
This file provides the same API endpoints as views.py but returns mock data
"""
import random
from datetime import datetime, timedelta, timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .constants import (
    DEFAULT_DOCUMENT_TYPES,
    DOCUMENT_STATUS_CHOICES,
    VERIFY_STATUS_NOT_FOUND,
    VERIFY_STATUS_SIGNATURE_INVALID,
    VERIFY_STATUS_VERIFIED,
)
from .serializers import (
    AuditLogSerializer,
    DocumentResponseSerializer,
    DocumentUpdateSerializer,
    DocumentUploadSerializer,
    VerificationAttemptSerializer,
)


# Helper functions to generate mock data
def generate_mock_hash(length=64):
    import string
    return ''.join(random.choices('0123456789abcdef', k=length))


def generate_mock_document(index=None):
    document_type = random.choice(DEFAULT_DOCUMENT_TYPES)
    created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 365))
    
    return {
        "id": generate_mock_hash(32),
        "document_id": f"DOC-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
        "title": f"{document_type} - Q{random.randint(1, 4)} {random.randint(2023, 2024)}",
        "document_type": document_type,
        "description": f"Mock description for {document_type.lower()}",
        "file_name": f"document_{index or random.randint(1, 1000)}.{random.choice(['pdf', 'docx', 'txt'])}",
        "file_size": random.randint(1024, 10485760),
        "file_type": random.choice(["application/pdf", "application/msword", "text/plain"]),
        "department": random.choice(["Legal", "Finance", "HR", "Operations", "IT", "Compliance"]),
        "uploaded_by": random.choice(["john.doe@company.com", "jane.smith@company.com"]),
        "sha256_hash": generate_mock_hash(64),
        "short_hash": generate_mock_hash(13),
        "signature": f"SIGNATURE_{generate_mock_hash(128)}",
        "signer_public_key_pem": f"-----BEGIN PUBLIC KEY-----\n{generate_mock_hash(256)}\n-----END PUBLIC KEY-----",
        "signer_fingerprint": generate_mock_hash(16).upper(),
        "status": random.choice([choice[0] for choice in DOCUMENT_STATUS_CHOICES]),
        "metadata": {
            "department": random.choice(["Legal", "Finance", "HR", "Operations", "IT", "Compliance"]),
            "uploaded_by": random.choice(["john.doe@company.com", "jane.smith@company.com"]),
        },
        "created_at": created_at.isoformat(),
        "updated_at": created_at.isoformat(),
    }


# Generate mock data once
MOCK_DOCUMENTS = [generate_mock_document(i) for i in range(1, 26)]
MOCK_AUDIT_LOGS = []
for _ in range(50):
    MOCK_AUDIT_LOGS.append({
        "id": random.randint(1, 10000),
        "action": random.choice(["CREATE", "UPDATE", "DELETE", "VIEW", "VERIFY"]),
        "resource_type": random.choice(["Document", "User", "System"]),
        "resource_id": generate_mock_hash(32) if random.random() > 0.3 else "",
        "details": "Mock audit log entry",
        "metadata": {"user_id": f"user_{random.randint(1, 100)}"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DocumentViewSet(ModelViewSet):
    serializer_class = DocumentResponseSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return MOCK_DOCUMENTS

    def list(self, request, *args, **kwargs):
        documents = MOCK_DOCUMENTS
        
        # Apply simple filtering
        params = request.query_params
        search = params.get("search")
        status_filter = params.get("status")
        document_type_filter = params.get("document_type")
        
        if search:
            search_lower = search.lower()
            documents = [d for d in documents if any([
                search_lower in d["document_id"].lower(),
                search_lower in d["title"].lower(),
                search_lower in d["file_name"].lower(),
                search_lower in d["document_type"].lower(),
                search_lower in d["department"].lower(),
                search_lower in d["uploaded_by"].lower(),
            ])]
        
        if status_filter:
            documents = [d for d in documents if d["status"] == status_filter]
        
        if document_type_filter:
            documents = [d for d in documents if d["document_type"] == document_type_filter]
        
        # Apply ordering
        ordering = params.get("ordering")
        if ordering:
            reverse = ordering.startswith('-')
            field = ordering.lstrip('-')
            documents.sort(key=lambda x: x.get(field, ''), reverse=reverse)
        
        # Paginate
        page = int(params.get("page", 1))
        page_size = min(int(params.get("page_size", 10)), 100)
        total = len(documents)
        start = (page - 1) * page_size
        end = start + page_size
        page_documents = documents[start:end]
        
        return Response({
            "count": total,
            "next": None,  # Simplified pagination
            "previous": None,
            "results": page_documents,
        })

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        for doc in MOCK_DOCUMENTS:
            if doc["id"] == pk or doc["document_id"] == pk:
                return Response(doc)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request, *args, **kwargs):
        # Mock document creation
        new_doc = generate_mock_document()
        new_doc["title"] = request.data.get("title", "Untitled")
        new_doc["document_type"] = request.data.get("document_type", "Unknown")
        MOCK_DOCUMENTS.insert(0, new_doc)
        return Response(new_doc, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        for doc in MOCK_DOCUMENTS:
            if doc["id"] == pk or doc["document_id"] == pk:
                # Update fields
                for key, value in request.data.items():
                    if key in doc:
                        doc[key] = value
                return Response(doc)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        global MOCK_DOCUMENTS
        MOCK_DOCUMENTS = [d for d in MOCK_DOCUMENTS if d["id"] != pk and d["document_id"] != pk]
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"], url_path="verify")
    def verify_document(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"detail": "Missing file field."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock verification - randomly found/not found
        found = random.choice([True, False])
        is_authentic = found and random.choice([True, True, False])
        
        response = {
            "filename": uploaded_file.name,
            "fileName": uploaded_file.name,
            "hash": generate_mock_hash(64),
            "found": found,
            "isAuthentic": is_authentic,
            "status": VERIFY_STATUS_VERIFIED if is_authentic else (VERIFY_STATUS_NOT_FOUND if not found else VERIFY_STATUS_SIGNATURE_INVALID),
        }
        
        if found and MOCK_DOCUMENTS:
            doc = random.choice(MOCK_DOCUMENTS)
            response.update({
                "documentId": doc["document_id"],
                "documentType": doc["document_type"],
                "fileSize": doc["file_size"],
                "uploadDate": doc["created_at"],
                "uploadedBy": doc["uploaded_by"],
                "signature": doc["signature"],
            })
        
        return Response(response)

    @action(detail=False, methods=["post"], url_path="batch-verify")
    def batch_verify(self, request):
        files = request.FILES.getlist("files")
        if not files:
            return Response({"detail": "Missing files field."}, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        for f in files:
            found = random.choice([True, False])
            results.append({
                "filename": f.name,
                "hash": generate_mock_hash(64),
                "found": found,
                "isAuthentic": found,
                "status": VERIFY_STATUS_VERIFIED if found else VERIFY_STATUS_NOT_FOUND,
                "documentId": random.choice(MOCK_DOCUMENTS)["document_id"] if found else None,
            })
        
        return Response({"results": results, "count": len(results)})

    @action(detail=False, methods=["get"], url_path="search-by-hash")
    def search_by_hash(self, request):
        hash_value = request.query_params.get("hash")
        if not hash_value:
            return Response({"detail": "hash query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # For mock, return a random document
        doc = random.choice(MOCK_DOCUMENTS) if MOCK_DOCUMENTS else generate_mock_document()
        doc["found"] = True
        return Response(doc)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        stats = {
            "total": len(MOCK_DOCUMENTS),
            "verified": len([d for d in MOCK_DOCUMENTS if d["status"] == "verified"]),
            "pending": len([d for d in MOCK_DOCUMENTS if d["status"] == "pending"]),
            "failed": len([d for d in MOCK_DOCUMENTS if d["status"] == "failed"]),
            "expired": len([d for d in MOCK_DOCUMENTS if d["status"] == "expired"]),
        }
        return Response(stats)

    @action(detail=False, methods=["get"], url_path="types")
    def types(self, request):
        types = list(set(d["document_type"] for d in MOCK_DOCUMENTS))
        if not types:
            types = DEFAULT_DOCUMENT_TYPES
        return Response(sorted(types))

    @action(detail=True, methods=["get"], url_path="verifications")
    def verifications(self, request, pk=None):
        # Return some mock verification attempts
        attempts = []
        for i in range(random.randint(0, 5)):
            attempts.append({
                "id": i + 1,
                "document_id": pk,
                "file_name": f"verified_file_{i}.pdf",
                "file_size": random.randint(1024, 1048576),
                "sha256_hash": generate_mock_hash(64),
                "found": True,
                "is_authentic": random.choice([True, False]),
                "status": random.choice([VERIFY_STATUS_VERIFIED, VERIFY_STATUS_SIGNATURE_INVALID]),
                "checked_at": datetime.now(timezone.utc).isoformat(),
            })
        return Response(attempts)

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        return Response(
            {
                "detail": "Zero-retention architecture active: original files are never persisted and cannot be downloaded.",
                "error_code": "ZERO_RETENTION_NO_FILE_COPY",
            },
            status=status.HTTP_410_GONE,
        )


class AuditLogViewSet(ModelViewSet):
    serializer_class = AuditLogSerializer
    pagination_class = StandardResultsSetPagination
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return MOCK_AUDIT_LOGS

    def list(self, request, *args, **kwargs):
        logs = MOCK_AUDIT_LOGS
        
        # Apply filtering
        params = request.query_params
        action_filter = params.get("action")
        resource_type_filter = params.get("resource_type")
        search = params.get("search")
        
        if action_filter:
            logs = [l for l in logs if l["action"] == action_filter]
        if resource_type_filter:
            logs = [l for l in logs if l["resource_type"] == resource_type_filter]
        if search:
            search_lower = search.lower()
            logs = [l for l in logs if search_lower in l["action"].lower() or search_lower in l["details"].lower()]
        
        # Paginate
        page = int(params.get("page", 1))
        page_size = min(int(params.get("page_size", 10)), 100)
        total = len(logs)
        start = (page - 1) * page_size
        end = start + page_size
        page_logs = logs[start:end]
        
        return Response({
            "count": total,
            "next": None,
            "previous": None,
            "results": page_logs,
        })

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        action_counts = {}
        for log in MOCK_AUDIT_LOGS:
            action = log["action"]
            action_counts[action] = action_counts.get(action, 0) + 1
        
        top_actions = sorted(action_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return Response({
            "total": len(MOCK_AUDIT_LOGS),
            "top_actions": [{"action": a, "count": c} for a, c in top_actions],
        })