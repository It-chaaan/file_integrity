import json
import os
import secrets
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePrivateKey
from django.utils import timezone

try:
    from crypto_engine import (
        generate_hash_from_bytes,
        get_public_key_fingerprint,
        serialize_public_key_to_pem,
        sign_hash,
    )
except ImportError:
    from backend.crypto_engine import (
        generate_hash_from_bytes,
        get_public_key_fingerprint,
        serialize_public_key_to_pem,
        sign_hash,
    )


_PRIVATE_KEY_CACHE: Optional[EllipticCurvePrivateKey] = None
_PRIVATE_KEY_CACHE_SOURCE_ID: Optional[int] = None


def reset_signing_private_key_cache() -> None:
    global _PRIVATE_KEY_CACHE, _PRIVATE_KEY_CACHE_SOURCE_ID
    _PRIVATE_KEY_CACHE = None
    _PRIVATE_KEY_CACHE_SOURCE_ID = None


def parse_metadata_value(raw_value: Any) -> Dict[str, Any]:
    if raw_value is None or raw_value == "":
        return {}

    if isinstance(raw_value, dict):
        return raw_value

    if isinstance(raw_value, str):
        try:
            parsed = json.loads(raw_value)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}

    return {}


def build_document_id(now: Optional[datetime] = None) -> str:
    current = now or datetime.utcnow()
    suffix = secrets.token_hex(3).upper()
    return f"DOC-{current.year}-{suffix}"


def build_reference_number(now: Optional[datetime] = None) -> str:
    return build_document_id(now)


def compute_hash_and_signature(file_bytes: bytes) -> Tuple[str, str, str, str]:
    sha256_hash = generate_hash_from_bytes(file_bytes)
    private_key, security_key = get_signing_private_key()
    public_key = private_key.public_key()

    signature = sign_hash(private_key, sha256_hash)
    public_key_pem = serialize_public_key_to_pem(public_key)
    fingerprint = get_public_key_fingerprint(public_key)

    if security_key is not None:
        security_key.last_used = timezone.now()
        security_key.save(update_fields=["last_used"])

    return sha256_hash, signature, public_key_pem, fingerprint


def get_signing_private_key() -> Tuple[EllipticCurvePrivateKey, Optional[Any]]:
    """
    Load the signing private key from the database or .env.
    
    Priority:
    1. Database (active ECDSA signing key)
    2. .env (PARITY_ECDSA_PRIVATE_KEY_PEM for backward compatibility)
    """
    global _PRIVATE_KEY_CACHE, _PRIVATE_KEY_CACHE_SOURCE_ID

    if _PRIVATE_KEY_CACHE is not None:
        if _PRIVATE_KEY_CACHE_SOURCE_ID is not None:
            try:
                from security_keys.models import SecurityKey
                security_key = SecurityKey.objects.filter(pk=_PRIVATE_KEY_CACHE_SOURCE_ID).first()
                return _PRIVATE_KEY_CACHE, security_key
            except Exception:
                reset_signing_private_key_cache()
        return _PRIVATE_KEY_CACHE, None

    # Try to load from database first
    try:
        from security_keys.models import SecurityKey
        from security_keys.crypto import decrypt_private_key
        active_key = SecurityKey.objects.filter(
            algorithm=SecurityKey.ALGORITHM_ECDSA,
            key_type="signing",
            status=SecurityKey.STATUS_ACTIVE
        ).filter(
            expires_at__isnull=True
        ).first() or SecurityKey.objects.filter(
            algorithm=SecurityKey.ALGORITHM_ECDSA,
            key_type="signing",
            status=SecurityKey.STATUS_ACTIVE,
            expires_at__gt=timezone.now(),
        ).first()
        
        if active_key and active_key.private_key:
            decrypted_private_key = decrypt_private_key(active_key.private_key)
            if "BEGIN PRIVATE KEY" not in decrypted_private_key:
                raise RuntimeError("Stored signing key is malformed.")
            key_bytes = decrypted_private_key.encode("utf-8")
            key = serialization.load_pem_private_key(key_bytes, password=None)
            _PRIVATE_KEY_CACHE = key
            _PRIVATE_KEY_CACHE_SOURCE_ID = active_key.id
            return key, active_key
    except Exception:
        reset_signing_private_key_cache()

    # Fallback to .env for backward compatibility
    pem_value = os.getenv("PARITY_ECDSA_PRIVATE_KEY_PEM", "").strip()
    if "\\n" in pem_value:
        pem_value = pem_value.replace("\\n", "\n")

    if pem_value:
        key_bytes = pem_value.encode("utf-8")
        key = serialization.load_pem_private_key(key_bytes, password=None)
        _PRIVATE_KEY_CACHE = key
        _PRIVATE_KEY_CACHE_SOURCE_ID = None
        return key, None

    raise RuntimeError(
        "No active ECDSA signing key is configured. Create one in Security or set PARITY_ECDSA_PRIVATE_KEY_PEM."
    )


def get_verification_public_key_pem() -> str:
    """
    Get the public key for verification from database or .env.
    
    Priority:
    1. Database (active ECDSA signing key's public part)
    2. .env (PARITY_ECDSA_PUBLIC_KEY_PEM for backward compatibility)
    """
    # Try to load from database first
    try:
        from security_keys.models import SecurityKey
        active_key = SecurityKey.objects.filter(
            algorithm=SecurityKey.ALGORITHM_ECDSA,
            key_type="signing",
            status=SecurityKey.STATUS_ACTIVE
        ).filter(
            expires_at__isnull=True
        ).first() or SecurityKey.objects.filter(
            algorithm=SecurityKey.ALGORITHM_ECDSA,
            key_type="signing",
            status=SecurityKey.STATUS_ACTIVE,
            expires_at__gt=timezone.now(),
        ).first()
        
        if active_key and active_key.public_key:
            return active_key.public_key
    except Exception:
        pass

    # Fallback to .env for backward compatibility
    pem_value = os.getenv("PARITY_ECDSA_PUBLIC_KEY_PEM", "").strip()
    if "\\n" in pem_value:
        pem_value = pem_value.replace("\\n", "\n")
    if pem_value:
        return pem_value

    raise RuntimeError(
        "No active ECDSA verification key is configured. Create one in Security or set PARITY_ECDSA_PUBLIC_KEY_PEM."
    )


def format_short_hash(sha256_hash: str) -> str:
    if len(sha256_hash) <= 13:
        return sha256_hash
    return f"{sha256_hash[:6]}...{sha256_hash[-4:]}"
