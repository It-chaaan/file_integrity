from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
import secrets

private_key = ec.generate_private_key(ec.SECP256R1())
private_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
).decode("utf-8")

public_pem = private_key.public_key().public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
).decode("utf-8")

def env_escape(pem: str) -> str:
    return pem.replace("\n", "\\n").strip()

print("DJANGO_SECRET_KEY=" + secrets.token_urlsafe(48))
print("PARITY_ECDSA_PRIVATE_KEY_PEM=\"" + env_escape(private_pem) + "\"")
print("PARITY_ECDSA_PUBLIC_KEY_PEM=\"" + env_escape(public_pem) + "\"")
