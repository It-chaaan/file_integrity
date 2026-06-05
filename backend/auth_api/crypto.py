import base64
import hashlib
import os
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken


ENCRYPTED_MFA_PREFIX = "mfa:enc:v1:"


def has_mfa_encryption_secret_configured() -> bool:
    raw_secret = (
        os.getenv("PARITY_MFA_ENCRYPTION_SECRET", "").strip()
        or os.getenv("PARITY_KEY_ENCRYPTION_SECRET", "").strip()
    )
    return bool(raw_secret or os.getenv("DJANGO_ENV") == "test")


def _build_fernet(secret: Optional[str] = None) -> Fernet:
    raw_secret = (
        (secret or os.getenv("PARITY_MFA_ENCRYPTION_SECRET", "")).strip()
        or os.getenv("PARITY_KEY_ENCRYPTION_SECRET", "").strip()
    )
    if not raw_secret:
        if os.getenv("DJANGO_ENV") == "test":
            raw_secret = "parity-test-mfa-encryption-secret"
        else:
            raise RuntimeError(
                "Missing required environment variable: PARITY_MFA_ENCRYPTION_SECRET "
                "(or PARITY_KEY_ENCRYPTION_SECRET as fallback)"
            )

    key_material = hashlib.sha256(raw_secret.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(key_material))


def encrypt_mfa_secret(plaintext_secret: str) -> str:
    if not plaintext_secret:
        return ""
    if plaintext_secret.startswith(ENCRYPTED_MFA_PREFIX):
        return plaintext_secret

    token = _build_fernet().encrypt(plaintext_secret.encode("utf-8")).decode("utf-8")
    return f"{ENCRYPTED_MFA_PREFIX}{token}"


def decrypt_mfa_secret(stored_value: str) -> str:
    if not stored_value:
        return ""
    if not stored_value.startswith(ENCRYPTED_MFA_PREFIX):
        return stored_value

    token = stored_value[len(ENCRYPTED_MFA_PREFIX):]
    try:
        return _build_fernet().decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Stored MFA secret could not be decrypted.") from exc


def is_encrypted_mfa_secret(stored_value: str) -> bool:
    return bool(stored_value and stored_value.startswith(ENCRYPTED_MFA_PREFIX))


def get_mfa_encryption_configuration_error() -> str | None:
    if has_mfa_encryption_secret_configured():
        return None
    return (
        "Missing MFA encryption secret. Configure "
        "PARITY_MFA_ENCRYPTION_SECRET or PARITY_KEY_ENCRYPTION_SECRET before enabling MFA."
    )
