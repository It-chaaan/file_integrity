import json
import os
import secrets
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePrivateKey

try:
    from crypto_engine import (
        generate_hash_from_bytes,
        generate_key_pair,
        get_public_key_fingerprint,
        serialize_public_key_to_pem,
        sign_hash,
    )
except ImportError:
    from backend.crypto_engine import (
        generate_hash_from_bytes,
        generate_key_pair,
        get_public_key_fingerprint,
        serialize_public_key_to_pem,
        sign_hash,
    )


_PRIVATE_KEY_CACHE: Optional[EllipticCurvePrivateKey] = None


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
    private_key = get_signing_private_key()
    public_key = private_key.public_key()

    signature = sign_hash(private_key, sha256_hash)
    public_key_pem = serialize_public_key_to_pem(public_key)
    fingerprint = get_public_key_fingerprint(public_key)

    return sha256_hash, signature, public_key_pem, fingerprint


def get_signing_private_key() -> EllipticCurvePrivateKey:
    global _PRIVATE_KEY_CACHE

    if _PRIVATE_KEY_CACHE is not None:
        return _PRIVATE_KEY_CACHE

    pem_value = os.getenv("PARITY_ECDSA_PRIVATE_KEY_PEM", "").strip()
    if "\\n" in pem_value:
        pem_value = pem_value.replace("\\n", "\n")

    if pem_value:
        key_bytes = pem_value.encode("utf-8")
        key = serialization.load_pem_private_key(key_bytes, password=None)
        _PRIVATE_KEY_CACHE = key
        return key

    private_key, _ = generate_key_pair()
    _PRIVATE_KEY_CACHE = private_key
    return private_key


def get_verification_public_key_pem() -> str:
    pem_value = os.getenv("PARITY_ECDSA_PUBLIC_KEY_PEM", "").strip()
    if "\\n" in pem_value:
        pem_value = pem_value.replace("\\n", "\n")
    if pem_value:
        return pem_value

    private_key = get_signing_private_key()
    return serialize_public_key_to_pem(private_key.public_key())


def format_short_hash(sha256_hash: str) -> str:
    if len(sha256_hash) <= 13:
        return sha256_hash
    return f"{sha256_hash[:6]}...{sha256_hash[-4:]}"
