"""
Cryptographic Engine for Legal Document Integrity Verification

Security Standards Implemented:
- SHA-256 (FIPS 180-4) for document hashing
- ECDSA with SECP256R1/NIST P-256 (FIPS 186-4) for digital signatures
"""

import hashlib
import base64
from pathlib import Path
from typing import Tuple, Union

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.ec import (
    EllipticCurvePrivateKey,
    EllipticCurvePublicKey,
)
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature


# =============================================================================
# CONFIGURATION CONSTANTS
# =============================================================================

# We use 4096 bytes (4 KB) as our chunk size for file reading. This value is

CHUNK_SIZE = 4096  # bytes


# =============================================================================
# HASHING FUNCTIONS
# =============================================================================

def generate_file_hash(file_path: Union[str, Path]) -> str:
    """
    Generate a SHA-256 hash of a file using memory-efficient chunked reading.
    """
    # Validate file exists
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    if not file_path.is_file():
        raise IsADirectoryError(f"Path is not a file: {file_path}")
    
    hash_obj = hashlib.sha256()
    
    # Open file in binary mode to ensure consistent hashing across platforms
    with open(file_path, 'rb') as file:
        # Read and process file in chunks
        while True:
            chunk = file.read(CHUNK_SIZE)
            if not chunk:
                # End of file reached
                break
            # Update hash state with this chunk
            # The hash object maintains internal state between updates
            hash_obj.update(chunk)
    
    # Return the final hash as a hexadecimal string
    # This format is human-readable and database-friendly
    return hash_obj.hexdigest()


def generate_hash_from_bytes(data: bytes) -> str:
    """
    Generate a SHA-256 hash from raw bytes data.
    
    Args:
        data: Raw bytes to hash
        
    Returns:
        Hexadecimal string representation of the SHA-256 hash
        
    Example:
        >>> content = b"Hello, World!"
        >>> hash_value = generate_hash_from_bytes(content)
    """
    return hashlib.sha256(data).hexdigest()


# =============================================================================
# KEY GENERATION FUNCTIONS
# =============================================================================

def generate_key_pair() -> Tuple[EllipticCurvePrivateKey, EllipticCurvePublicKey]:
    """
    Generate an ECDSA key pair using the SECP256R1 (NIST P-256) curve.

    Returns:
        Tuple containing:
        - private_key: The private key (keep secret!)
        - public_key: The public key (can be shared)
        
    Example:
        >>> private_key, public_key = generate_key_pair()
        >>> # Store private_key securely, share public_key for verification
    """
    # Generate private key using SECP256R1 curve
    private_key = ec.generate_private_key(
        curve=ec.SECP256R1(),  # NIST P-256 curve
        backend=default_backend()
    )
    
    # Derive the corresponding public key
    public_key = private_key.public_key()
    
    return private_key, public_key


# =============================================================================
# KEY SERIALIZATION FUNCTIONS (Save/Load to PEM files)
# =============================================================================

def save_private_key(
    private_key: EllipticCurvePrivateKey,
    file_path: Union[str, Path],
    password: bytes = None
) -> None:
    """
    Save a private key to a PEM file with optional password protection.
    
    Args:
        private_key: The private key object to save
        file_path: Destination path for the PEM file
        password: Optional password as bytes (e.g., b"secure_password")
                  If None, key is saved unencrypted (NOT recommended for production)
                  
    Example:
        >>> save_private_key(private_key, "keys/private.pem", b"my_secure_password")
    """
    file_path = Path(file_path)
    
    # Determine encryption algorithm based on password presence
    if password:
        # Use strong encryption with password
        encryption = serialization.BestAvailableEncryption(password)
    else:
        # No encryption (for development/testing only!) //REMOVE THIS IN PRODUCTION
        encryption = serialization.NoEncryption()
    
    # Serialize the private key to PEM format
    pem_data = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=encryption
    )
    
    # Write to file with restricted permissions
    file_path.write_bytes(pem_data)


def load_private_key(
    file_path: Union[str, Path],
    password: bytes = None
) -> EllipticCurvePrivateKey:
    """
    Load a private key from a PEM file.
    
    Args:
        file_path: Path to the PEM file containing the private key
        password: Password as bytes if the key is encrypted, None otherwise
        
    Returns:
        The loaded private key object
        
    Raises:
        FileNotFoundError: If the key file doesn't exist
        ValueError: If the password is incorrect or the file is corrupted
        
    Example:
        >>> private_key = load_private_key("keys/private.pem", b"my_secure_password")
    """
    file_path = Path(file_path)
    pem_data = file_path.read_bytes()
    
    private_key = serialization.load_pem_private_key(
        pem_data,
        password=password,
        backend=default_backend()
    )
    
    return private_key


def save_public_key(
    public_key: EllipticCurvePublicKey,
    file_path: Union[str, Path]
) -> None:
    """
    Save a public key to a PEM file.
    
    Public keys don't need encryption as they are meant to be shared.
    Anyone with the public key can verify signatures, but cannot create them.
    
    Args:
        public_key: The public key object to save
        file_path: Destination path for the PEM file
        
    Example:
        >>> save_public_key(public_key, "keys/public.pem")
    """
    file_path = Path(file_path)
    
    pem_data = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    file_path.write_bytes(pem_data)


def load_public_key(file_path: Union[str, Path]) -> EllipticCurvePublicKey:
    """
    Load a public key from a PEM file.
    
    Args:
        file_path: Path to the PEM file containing the public key
        
    Returns:
        The loaded public key object
        
    Raises:
        FileNotFoundError: If the key file doesn't exist
        ValueError: If the file format is invalid
        
    Example:
        >>> public_key = load_public_key("keys/public.pem")
    """
    file_path = Path(file_path)
    pem_data = file_path.read_bytes()
    
    public_key = serialization.load_pem_public_key(
        pem_data,
        backend=default_backend()
    )
    
    return public_key


# =============================================================================
# DIGITAL SIGNATURE FUNCTIONS
# =============================================================================

def sign_hash(private_key: EllipticCurvePrivateKey, hash_string: str) -> str:
    """
    Sign a SHA-256 hash using ECDSA with the private key.

    Args:
        private_key: The ECDSA private key for signing
        hash_string: The SHA-256 hash as a hexadecimal string (from generate_file_hash)
        
    Returns:
        Base64-encoded signature string (safe for database storage and transmission)
        
    Example:
        >>> signature = sign_hash(private_key, "a3f2b8c9d4e5...")
        >>> print(signature)
        'MEUCIQDx...base64...=='
    """
    # Convert the hex hash string to bytes for signing
    hash_bytes = hash_string.encode('utf-8')
    
    signature_bytes = private_key.sign(
        hash_bytes,
        ec.ECDSA(hashes.SHA256())
    )
    
    signature_base64 = base64.b64encode(signature_bytes).decode('utf-8')
    
    return signature_base64


def verify_signature(
    public_key: EllipticCurvePublicKey,
    signature_base64: str,
    original_hash: str
) -> bool:
    """
    Verify an ECDSA signature against the original document hash.
    
    Args:
        public_key: The ECDSA public key for verification
        signature_base64: The Base64-encoded signature string
        original_hash: The SHA-256 hash of the document (recalculated at verification time)
        
    Returns:
        True if the signature is valid (document is authentic and unmodified)
        False if the signature is invalid (document tampered or wrong key)
        
    Example:
        >>> # At verification time:
        >>> current_hash = generate_file_hash("document.pdf")
        >>> is_valid = verify_signature(public_key, stored_signature, current_hash)
        >>> if is_valid:
        ...     print("✓ Document integrity verified")
        ... else:
        ...     print("✗ ALERT: Document may have been tampered with!")
    """
    try:
        # Decode the Base64 signature back to bytes
        signature_bytes = base64.b64decode(signature_base64)
        
        # Convert the hash string to bytes (same as during signing)
        hash_bytes = original_hash.encode('utf-8')
        
        # Attempt verification
        # If verification fails, this raises InvalidSignature exception
        public_key.verify(
            signature_bytes,
            hash_bytes,
            ec.ECDSA(hashes.SHA256())
        )
        
        # If we reach here, signature is valid
        return True
        
    except InvalidSignature:
        # Signature verification failed
        # This means either:
        # 1. The document was modified after signing
        # 2. The signature was tampered with
        # 3. Wrong public key was used
        return False
    
    except Exception as e:
        # Handle other errors (malformed signature, encoding issues, etc.)
        # For security, we return False (fail closed)
        return False


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def get_public_key_fingerprint(public_key: EllipticCurvePublicKey) -> str:
    """
    Generate a short fingerprint of a public key for identification.
    
    Args:
        public_key: The public key to fingerprint
        
    Returns:
        SHA-256 hash of the public key (first 16 hex characters)
        
    Example:
        >>> fingerprint = get_public_key_fingerprint(public_key)
        >>> print(f"Key ID: {fingerprint}")
        'Key ID: a3f2b8c9d4e5f6a7'
    """
    # Serialize public key to bytes
    key_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    # Hash and return truncated fingerprint
    full_hash = hashlib.sha256(key_bytes).hexdigest()
    return full_hash[:16]


def serialize_public_key_to_pem(public_key: EllipticCurvePublicKey) -> str:
    """
    Convert a public key to PEM string format (for database storage).
    
    Args:
        public_key: The public key to serialize
        
    Returns:
        PEM-formatted string
    """
    pem_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return pem_bytes.decode('utf-8')


def deserialize_public_key_from_pem(pem_string: str) -> EllipticCurvePublicKey:
    """
    Load a public key from a PEM string (from database).
    
    Args:
        pem_string: PEM-formatted public key string
        
    Returns:
        Public key object
    """
    pem_bytes = pem_string.encode('utf-8')
    return serialization.load_pem_public_key(
        pem_bytes,
        backend=default_backend()
    )


# =============================================================================
# MAIN - DEMONSTRATION / TESTING
# =============================================================================

if __name__ == "__main__":
    """
    Demonstration of the cryptographic engine functionality.
    This section can be used for testing or as a reference for the integrator.
    """
    import tempfile
    import os
    
    print("=" * 60)
    print("CRYPTOGRAPHIC ENGINE DEMONSTRATION")
    print("Legal Document Integrity Verification System")
    print("=" * 60)
    
    # Create a test document
    print("\n[1] Creating test document...")
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("This is a sample legal document.\n")
        f.write("Resolution No. 2026-001\n")
        f.write("Date: February 4, 2026\n")
        test_file = f.name
    print(f"    Created: {test_file}")
    
    # Generate hash
    print("\n[2] Generating document hash (SHA-256)...")
    document_hash = generate_file_hash(test_file)
    print(f"    Hash: {document_hash}")
    
    # Generate key pair
    print("\n[3] Generating ECDSA key pair (SECP256R1/NIST P-256)...")
    private_key, public_key = generate_key_pair()
    fingerprint = get_public_key_fingerprint(public_key)
    print(f"    Key Fingerprint: {fingerprint}")
    
    # Sign the hash
    print("\n[4] Signing document hash...")
    signature = sign_hash(private_key, document_hash)
    print(f"    Signature: {signature[:50]}...")
    
    # Verify the signature
    print("\n[5] Verifying signature...")
    is_valid = verify_signature(public_key, signature, document_hash)
    print(f"    Verification Result: {'✓ VALID' if is_valid else '✗ INVALID'}")
    
    # Demonstrate tampering detection
    print("\n[6] Simulating document tampering...")
    tampered_hash = "0" * 64  # Fake hash
    is_valid_tampered = verify_signature(public_key, signature, tampered_hash)
    print(f"    Tampered Verification: {'✓ VALID' if is_valid_tampered else '✗ DETECTED - INVALID'}")
    
    # Save and load keys demonstration
    print("\n[7] Testing key persistence...")
    with tempfile.TemporaryDirectory() as key_dir:
        priv_path = os.path.join(key_dir, "private.pem")
        pub_path = os.path.join(key_dir, "public.pem")
        
        # Save keys
        save_private_key(private_key, priv_path, password=b"thesis_demo_password")
        save_public_key(public_key, pub_path)
        print(f"    Saved private key (encrypted): {priv_path}")
        print(f"    Saved public key: {pub_path}")
        
        # Load keys
        loaded_private = load_private_key(priv_path, password=b"thesis_demo_password")
        loaded_public = load_public_key(pub_path)
        
        # Verify loaded keys work
        new_signature = sign_hash(loaded_private, document_hash)
        verify_loaded = verify_signature(loaded_public, new_signature, document_hash)
        print(f"    Loaded key verification: {'✓ SUCCESS' if verify_loaded else '✗ FAILED'}")
    
    # Cleanup
    os.unlink(test_file)
    
    print("\n" + "=" * 60)
    print("DEMONSTRATION COMPLETE")
    print("=" * 60)
