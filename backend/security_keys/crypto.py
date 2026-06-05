import base64
import hashlib
import os
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken


ENCRYPTED_PREFIX = "enc:v1:"


def has_key_encryption_secret_configured() -> bool:
    raw_secret = os.getenv("PARITY_KEY_ENCRYPTION_SECRET", "").strip()
    return bool(raw_secret or os.getenv("DJANGO_ENV") == "test")


def _build_fernet(secret: Optional[str] = None) -> Fernet:
    raw_secret = (secret or os.getenv("PARITY_KEY_ENCRYPTION_SECRET", "")).strip()
    if not raw_secret:
        if os.getenv("DJANGO_ENV") == "test":
            raw_secret = "parity-test-key-encryption-secret"
        else:
            raise RuntimeError("Missing required environment variable: PARITY_KEY_ENCRYPTION_SECRET")

    key_material = hashlib.sha256(raw_secret.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(key_material))


def encrypt_private_key(plaintext_pem: str) -> str:
    if not plaintext_pem:
        return ""
    if plaintext_pem.startswith(ENCRYPTED_PREFIX):
        return plaintext_pem

    token = _build_fernet().encrypt(plaintext_pem.encode("utf-8")).decode("utf-8")
    return f"{ENCRYPTED_PREFIX}{token}"


def decrypt_private_key(stored_value: str) -> str:
    if not stored_value:
        return ""
    if not stored_value.startswith(ENCRYPTED_PREFIX):
        return stored_value

    token = stored_value[len(ENCRYPTED_PREFIX):]
    try:
        return _build_fernet().decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Stored private key could not be decrypted.") from exc


def is_encrypted_private_key(stored_value: str) -> bool:
    return bool(stored_value and stored_value.startswith(ENCRYPTED_PREFIX))
