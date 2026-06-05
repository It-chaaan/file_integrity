from cryptography.hazmat.primitives import serialization

try:
    from crypto_engine import generate_key_pair, serialize_public_key_to_pem
except ImportError:
    from backend.crypto_engine import generate_key_pair, serialize_public_key_to_pem

from .crypto import encrypt_private_key


def build_encrypted_ecdsa_key_pair() -> tuple[str, str]:
    private_key, public_key = generate_key_pair()
    public_key_pem = serialize_public_key_to_pem(public_key)
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")
    return public_key_pem, encrypt_private_key(private_key_pem)
