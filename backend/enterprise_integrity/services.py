import json
import os
import secrets
import time
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePrivateKey, EllipticCurvePublicKey

# Import performance monitoring
import psutil

try:
    from crypto_engine import (
        generate_hash_from_bytes,
        generate_key_pair,
        get_public_key_fingerprint,
        serialize_public_key_to_pem,
        sign_hash,
        deserialize_public_key_from_pem,
    )
except ImportError:
    from backend.crypto_engine import (
        generate_hash_from_bytes,
        generate_key_pair,
        get_public_key_fingerprint,
        serialize_public_key_to_pem,
        sign_hash,
        deserialize_public_key_from_pem,
    )


_PRIVATE_KEY_CACHE: Optional[EllipticCurvePrivateKey] = None
_VERIFICATION_PUBLIC_KEY_CACHE: Optional[EllipticCurvePublicKey] = None
_PSUTIL_PROCESS: Optional[psutil.Process] = None
_PSUTIL_CPU_PRIMED: bool = False


def _get_performance_metrics():
    """
    Get current CPU and memory metrics for the process.
    
    Returns:
        Dictionary with performance metrics
    """
    try:
        global _PSUTIL_PROCESS, _PSUTIL_CPU_PRIMED
        if _PSUTIL_PROCESS is None:
            _PSUTIL_PROCESS = psutil.Process(os.getpid())
            # Prime CPU counter - first call to cpu_percent(interval=None) always returns 0
            # So we make an initial call here and sleep briefly to get accurate readings
            _PSUTIL_PROCESS.cpu_percent(interval=None)
            time.sleep(0.1)  # Brief pause to allow CPU measurement
            _PSUTIL_CPU_PRIMED = True
        process = _PSUTIL_PROCESS
        memory_info = process.memory_info()
        memory_percent = process.memory_percent()
        cpu_percent = process.cpu_percent(interval=None)
        
        return {
            'rss_mb': round(memory_info.rss / 1024 / 1024, 2),
            'memory_percent': round(memory_percent, 2),
            'cpu_percent': round(cpu_percent, 2),
        }
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return {'rss_mb': 0, 'memory_percent': 0, 'cpu_percent': 0}


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
    """Compute hash and signature without timing information."""
    sha256_hash = generate_hash_from_bytes(file_bytes)
    private_key = get_signing_private_key()
    public_key = private_key.public_key()

    signature = sign_hash(private_key, sha256_hash)
    public_key_pem = serialize_public_key_to_pem(public_key)
    fingerprint = get_public_key_fingerprint(public_key)

    return sha256_hash, signature, public_key_pem, fingerprint


def compute_hash_and_signature_with_timing(file_bytes: bytes) -> Dict[str, Any]:
    """
    Compute hash and signature with detailed timing and performance information.
    
    Returns a dictionary containing:
    - hash: SHA-256 hash of the file
    - signature: ECDSA signature
    - public_key_pem: Public key in PEM format
    - fingerprint: Public key fingerprint
    - timing: Dictionary with timing information in milliseconds
        - hashing_ms: Time taken to compute hash
        - key_loading_ms: Time taken to load signing key
        - signing_ms: Time taken to generate signature
        - serialization_ms: Time taken to serialize public key
        - total_ms: Total time for all operations
    - performance: Dictionary with CPU and memory metrics for each operation
        - hashing: CPU/Memory metrics during hashing
        - key_loading: CPU/Memory metrics during key loading
        - signing: CPU/Memory metrics during signing
        - serialization: CPU/Memory metrics during serialization
        - total: Overall CPU/Memory metrics
    """
    result = {
        "timing": {},
        "performance": {}
    }
    
    total_start = time.perf_counter()
    metrics_before = _get_performance_metrics()
    
    # Step 1: Compute hash
    hash_start = time.perf_counter()
    hash_metrics_before = _get_performance_metrics()
    sha256_hash = generate_hash_from_bytes(file_bytes)
    hash_end = time.perf_counter()
    hash_metrics_after = _get_performance_metrics()
    
    result["timing"]["hashing_ms"] = round((hash_end - hash_start) * 1000, 3)
    result["hash"] = sha256_hash
    result["performance"]["hashing"] = {
        "elapsed_ms": round((hash_end - hash_start) * 1000, 3),
        "memory_before_mb": hash_metrics_before['rss_mb'],
        "memory_after_mb": hash_metrics_after['rss_mb'],
        "memory_delta_mb": round(hash_metrics_after['rss_mb'] - hash_metrics_before['rss_mb'], 2),
        "memory_percent": hash_metrics_after['memory_percent'],
        "cpu_percent": hash_metrics_after['cpu_percent'],
    }
    
    # Step 2: Load private key
    key_start = time.perf_counter()
    key_metrics_before = _get_performance_metrics()
    private_key = get_signing_private_key()
    key_end = time.perf_counter()
    key_metrics_after = _get_performance_metrics()
    
    result["timing"]["key_loading_ms"] = round((key_end - key_start) * 1000, 3)
    result["performance"]["key_loading"] = {
        "elapsed_ms": round((key_end - key_start) * 1000, 3),
        "memory_before_mb": key_metrics_before['rss_mb'],
        "memory_after_mb": key_metrics_after['rss_mb'],
        "memory_delta_mb": round(key_metrics_after['rss_mb'] - key_metrics_before['rss_mb'], 2),
        "memory_percent": key_metrics_after['memory_percent'],
        "cpu_percent": key_metrics_after['cpu_percent'],
    }
    
    public_key = private_key.public_key()
    
    # Step 3: Sign hash
    sign_start = time.perf_counter()
    sign_metrics_before = _get_performance_metrics()
    signature = sign_hash(private_key, sha256_hash)
    sign_end = time.perf_counter()
    sign_metrics_after = _get_performance_metrics()
    
    result["timing"]["signing_ms"] = round((sign_end - sign_start) * 1000, 3)
    result["signature"] = signature
    result["performance"]["signing"] = {
        "elapsed_ms": round((sign_end - sign_start) * 1000, 3),
        "memory_before_mb": sign_metrics_before['rss_mb'],
        "memory_after_mb": sign_metrics_after['rss_mb'],
        "memory_delta_mb": round(sign_metrics_after['rss_mb'] - sign_metrics_before['rss_mb'], 2),
        "memory_percent": sign_metrics_after['memory_percent'],
        "cpu_percent": sign_metrics_after['cpu_percent'],
    }
    
    # Step 4: Serialize public key
    serialize_start = time.perf_counter()
    serialize_metrics_before = _get_performance_metrics()
    public_key_pem = serialize_public_key_to_pem(public_key)
    serialize_end = time.perf_counter()
    serialize_metrics_after = _get_performance_metrics()
    
    result["timing"]["serialization_ms"] = round((serialize_end - serialize_start) * 1000, 3)
    result["public_key_pem"] = public_key_pem
    result["performance"]["serialization"] = {
        "elapsed_ms": round((serialize_end - serialize_start) * 1000, 3),
        "memory_before_mb": serialize_metrics_before['rss_mb'],
        "memory_after_mb": serialize_metrics_after['rss_mb'],
        "memory_delta_mb": round(serialize_metrics_after['rss_mb'] - serialize_metrics_before['rss_mb'], 2),
        "memory_percent": serialize_metrics_after['memory_percent'],
        "cpu_percent": serialize_metrics_after['cpu_percent'],
    }
    
    # Step 5: Get fingerprint
    fingerprint = get_public_key_fingerprint(public_key)
    result["fingerprint"] = fingerprint
    
    # Total time and performance
    total_end = time.perf_counter()
    metrics_after = _get_performance_metrics()
    result["timing"]["total_ms"] = round((total_end - total_start) * 1000, 3)
    result["performance"]["total"] = {
        "elapsed_ms": round((total_end - total_start) * 1000, 3),
        "memory_before_mb": metrics_before['rss_mb'],
        "memory_after_mb": metrics_after['rss_mb'],
        "memory_delta_mb": round(metrics_after['rss_mb'] - metrics_before['rss_mb'], 2),
        "memory_percent": metrics_after['memory_percent'],
        "cpu_percent": metrics_after['cpu_percent'],
    }
    
    return result


def get_signing_private_key() -> EllipticCurvePrivateKey:
    """
    Load the signing private key from the database or .env.
    
    Priority:
    1. Database (active ECDSA signing key)
    2. .env (PARITY_ECDSA_PRIVATE_KEY_PEM for backward compatibility)
    """
    global _PRIVATE_KEY_CACHE

    if _PRIVATE_KEY_CACHE is not None:
        return _PRIVATE_KEY_CACHE

    # Try to load from database first
    try:
        from security_keys.models import SecurityKey
        active_key = SecurityKey.objects.filter(
            algorithm=SecurityKey.ALGORITHM_ECDSA,
            key_type="signing",
            status=SecurityKey.STATUS_ACTIVE
        ).first()
        
        if active_key and active_key.private_key:
            key_bytes = active_key.private_key.encode("utf-8")
            key = serialization.load_pem_private_key(key_bytes, password=None)
            _PRIVATE_KEY_CACHE = key
            return key
    except Exception:
        pass

    # Fallback to .env for backward compatibility
    pem_value = os.getenv("PARITY_ECDSA_PRIVATE_KEY_PEM", "").strip()
    if "\\n" in pem_value:
        pem_value = pem_value.replace("\\n", "\n")

    if pem_value:
        key_bytes = pem_value.encode("utf-8")
        key = serialization.load_pem_private_key(key_bytes, password=None)
        _PRIVATE_KEY_CACHE = key
        return key

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


def get_verification_public_key() -> EllipticCurvePublicKey:
    """
    Return a cached verification public key object loaded from PEM.
    """
    global _VERIFICATION_PUBLIC_KEY_CACHE
    if _VERIFICATION_PUBLIC_KEY_CACHE is not None:
        return _VERIFICATION_PUBLIC_KEY_CACHE

    pem_value = get_verification_public_key_pem()
    _VERIFICATION_PUBLIC_KEY_CACHE = deserialize_public_key_from_pem(pem_value)
    return _VERIFICATION_PUBLIC_KEY_CACHE


def format_short_hash(sha256_hash: str) -> str:
    if len(sha256_hash) <= 13:
        return sha256_hash
    return f"{sha256_hash[:6]}...{sha256_hash[-4:]}"
