"""
Mock data generator for API testing without database
"""
import hashlib
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from .constants import (
    DEFAULT_DOCUMENT_TYPES,
    DOCUMENT_STATUS_CHOICES,
    STATUS_VERIFIED,
    VERIFY_STATUS_VERIFIED,
    VERIFY_STATUS_NOT_FOUND,
    VERIFY_STATUS_SIGNATURE_INVALID,
)


def generate_mock_hash(length: int = 64) -> str:
    """Generate a random hex hash string"""
    return ''.join(random.choices('0123456789abcdef', k=length))


def generate_mock_fingerprint() -> str:
    """Generate a mock key fingerprint"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))


def generate_mock_signature() -> str:
    """Generate a mock digital signature"""
    return f"SIGNATURE_{generate_mock_hash(128)}"


def generate_mock_public_key() -> str:
    """Generate a mock PEM public key"""
    key_body = generate_mock_hash(256)
    return f"-----BEGIN PUBLIC KEY-----\n{key_body}\n-----END PUBLIC KEY-----"


def generate_document_id() -> str:
    """Generate a mock document ID"""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"DOC-{timestamp}-{random_suffix}"


def generate_random_date(days_back: int = 365) -> datetime:
    """Generate a random datetime within the last N days"""
    random_days = random.randint(0, days_back)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    return datetime.now(timezone.utc) - timedelta(
        days=random_days, hours=random_hours, minutes=random_minutes
    )


def generate_mock_document(index: int = None) -> Dict[str, Any]:
    """Generate a single mock document record"""
    document_type = random.choice(DEFAULT_DOCUMENT_TYPES)
    file_name = f"document_{index or random.randint(1, 1000)}.{random.choice(['pdf', 'docx', 'txt'])}"
    created_at = generate_random_date()
    
    return {
        "id": f"{generate_mock_hash(32)}",  # UUID-like string
        "document_id": generate_document_id(),
        "title": f"{document_type} - {random.choice(['Q1', 'Q2', 'Q3', 'Q4'])} {random.randint(2023, 2024)}",
        "document_type": document_type,
        "description": f"Mock description for {document_type.lower()}",
        "file_name": file_name,
        "file_size": random.randint(1024, 10485760),  # 1KB to 10MB
        "file_type": random.choice(["application/pdf", "application/msword", "text/plain"]),
        "department": random.choice(["Legal", "Finance", "HR", "Operations", "IT", "Compliance"]),
        "uploaded_by": random.choice([
            "john.doe@company.com", "jane.smith@company.com", 
            "mike.johnson@company.com", "sarah.wilson@company.com"
        ]),
        "sha256_hash": generate_mock_hash(64),
        "short_hash": generate_mock_hash(13),
        "signature": generate_mock_signature(),
        "signer_public_key_pem": generate_mock_public_key(),
        "signer_fingerprint": generate_mock_fingerprint(),
        "status": random.choice([choice[0] for choice in DOCUMENT_STATUS_CHOICES]),
        "metadata": {
            "department": random.choice(["Legal", "Finance", "HR", "Operations", "IT", "Compliance"]),
            "uploaded_by": random.choice([
                "john.doe@company.com", "jane.smith@company.com", 
                "mike.johnson@company.com", "sarah.wilson@company.com"
            ]),
            "version": f"v{random.randint(1, 5)}.{random.randint(0, 9)}",
            "confidentiality": random.choice(["Public", "Internal", "Confidential", "Restricted"]),
        },
        "created_at": created_at.isoformat(),
        "updated_at": created_at.isoformat(),
    }


def generate_mock_documents(count: int = 25) -> List[Dict[str, Any]]:
    """Generate a list of mock document records"""
    return [generate_mock_document(i) for i in range(1, count + 1)]


def generate_mock_verification_attempt(document: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate a mock verification attempt"""
    if document is None:
        document = generate_mock_document()
    
    found = random.choice([True, False])
    is_authentic = found and random.choice([True, True, False])  # 66% chance if found
    
    if not found:
        status = VERIFY_STATUS_NOT_FOUND
    elif is_authentic:
        status = VERIFY_STATUS_VERIFIED
    else:
        status = VERIFY_STATUS_SIGNATURE_INVALID
    
    return {
        "id": random.randint(1, 10000),
        "document_id": document["document_id"],
        "file_name": document["file_name"],
        "file_size": document["file_size"],
        "sha256_hash": document["sha256_hash"],
        "found": found,
        "is_authentic": is_authentic,
        "status": status,
        "checked_at": generate_random_date(days_back=30).isoformat(),
    }


def generate_mock_audit_log() -> Dict[str, Any]:
    """Generate a mock audit log entry"""
    actions = [
        "CREATE", "UPDATE", "DELETE", "VIEW", "VERIFY", 
        "UPLOAD", "DOWNLOAD", "EXPORT", "IMPORT"
    ]
    resource_types = ["Document", "User", "System", "Configuration", "Audit"]
    
    return {
        "id": random.randint(1, 10000),
        "action": random.choice(actions),
        "resource_type": random.choice(resource_types),
        "resource_id": generate_mock_hash(32) if random.random() > 0.3 else "",
        "details": f"Mock audit log entry for {random.choice(actions).lower()} operation",
        "metadata": {
            "user_id": f"user_{random.randint(1, 100)}",
            "ip_address": f"192.168.{random.randint(0, 255)}.{random.randint(1, 254)}",
            "user_agent": "Mozilla/5.0 (Mock Browser)",
            "session_id": generate_mock_hash(32),
        },
        "timestamp": generate_random_date(days_back=90).isoformat(),
    }


def generate_mock_audit_logs(count: int = 50) -> List[Dict[str, Any]]:
    """Generate a list of mock audit log entries"""
    return [generate_mock_audit_log() for _ in range(count)]


class MockDataManager:
    """Manager for mock data with pagination and filtering support"""
    
    def __init__(self):
        self.documents = generate_mock_documents(25)
        self.verification_attempts = []
        self.audit_logs = generate_mock_audit_logs(50)
    
    def get_documents(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get documents with optional filtering"""
        results = self.documents.copy()
        
        if filters:
            if 'search' in filters:
                search_term = filters['search'].lower()
                results = [
                    doc for doc in results
                    if any(
                        search_term in str(doc.get(field, '')).lower()
                        for field in ['document_id', 'title', 'file_name', 'document_type', 'department', 'uploaded_by', 'sha256_hash']
                    )
                ]
            
            if 'status' in filters:
                results = [doc for doc in results if doc['status'] == filters['status']]
            
            if 'document_type' in filters:
                results = [doc for doc in results if doc['document_type'] == filters['document_type']]
            
            if 'date_from' in filters:
                results = [
                    doc for doc in results
                    if doc['created_at'][:10] >= filters['date_from']
                ]
            
            if 'date_to' in filters:
                results = [
                    doc for doc in results
                    if doc['created_at'][:10] <= filters['date_to']
                ]
            
            if 'ordering' in filters:
                reverse = filters['ordering'].startswith('-')
                order_field = filters['ordering'].lstrip('-')
                results.sort(key=lambda x: x.get(order_field, ''), reverse=reverse)
        
        return results
    
    def get_document_by_id(self, document_id: str) -> Dict[str, Any]:
        """Get a single document by ID"""
        for doc in self.documents:
            if doc['document_id'] == document_id or doc['id'] == document_id:
                return doc
        return None
    
    def get_document_by_hash(self, sha256_hash: str) -> Dict[str, Any]:
        """Get a document by SHA256 hash"""
        for doc in self.documents:
            if doc['sha256_hash'] == sha256_hash:
                return doc
        return None
    
    def get_verification_attempts(self, document_id: str = None) -> List[Dict[str, Any]]:
        """Get verification attempts, optionally filtered by document"""
        if document_id:
            return [
                attempt for attempt in self.verification_attempts
                if attempt['document_id'] == document_id
            ]
        return self.verification_attempts
    
    def add_verification_attempt(self, attempt: Dict[str, Any]):
        """Add a new verification attempt"""
        attempt['id'] = max([a['id'] for a in self.verification_attempts], default=0) + 1
        self.verification_attempts.append(attempt)
        return attempt
    
    def get_audit_logs(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get audit logs with optional filtering"""
        results = self.audit_logs.copy()
        
        if filters:
            if 'action' in filters:
                results = [log for log in results if log['action'] == filters['action']]
            
            if 'resource_type' in filters:
                results = [log for log in results if log['resource_type'] == filters['resource_type']]
            
            if 'user_id' in filters:
                results = [
                    log for log in results
                    if log['metadata'].get('user_id') == str(filters['user_id'])
                ]
            
            if 'search' in filters:
                search_term = filters['search'].lower()
                results = [
                    log for log in results
                    if search_term in log['action'].lower() or search_term in log['details'].lower()
                ]
        
        return results
    
    def get_document_stats(self) -> Dict[str, int]:
        """Get document statistics"""
        stats = {
            "total": len(self.documents),
            "verified": len([d for d in self.documents if d['status'] == 'verified']),
            "pending": len([d for d in self.documents if d['status'] == 'pending']),
            "failed": len([d for d in self.documents if d['status'] == 'failed']),
            "expired": len([d for d in self.documents if d['status'] == 'expired']),
        }
        return stats
    
    def get_audit_log_stats(self) -> Dict[str, Any]:
        """Get audit log statistics"""
        total = len(self.audit_logs)
        action_counts = {}
        for log in self.audit_logs:
            action = log['action']
            action_counts[action] = action_counts.get(action, 0) + 1
        
        top_actions = sorted(action_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "total": total,
            "top_actions": [{"action": action, "count": count} for action, count in top_actions]
        }
    
    def get_document_types(self) -> List[str]:
        """Get unique document types from mock data"""
        types = list(set(doc['document_type'] for doc in self.documents))
        if not types:
            types = DEFAULT_DOCUMENT_TYPES
        return sorted(types)


# Global mock data manager instance
mock_data_manager = MockDataManager()