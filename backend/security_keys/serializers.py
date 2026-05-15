from rest_framework import serializers

from .models import SecurityKey

try:
    from crypto_engine import generate_key_pair, serialize_public_key_to_pem
except ImportError:
    from backend.crypto_engine import generate_key_pair, serialize_public_key_to_pem


class SecurityKeySerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    rotated_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SecurityKey
        fields = [
            "id",
            "name",
            "algorithm",
            "key_type",
            "public_key",
            "private_key",
            "fingerprint",
            "status",
            "created_at",
            "expires_at",
            "rotated_from",
            "rotation_reason",
            "last_used",
            "created_by",
            "created_by_name",
            "rotated_by",
            "rotated_by_name",
        ]
        read_only_fields = [
            "public_key",
            "private_key",
            "fingerprint",
            "status",
            "last_used",
            "created_at",
            "created_by",
        ]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return "System"
    
    def get_rotated_by_name(self, obj):
        if obj.rotated_by:
            return f"{obj.rotated_by.first_name} {obj.rotated_by.last_name}".strip() or obj.rotated_by.username
        return None
    
    def create(self, validated_data):
        """Auto-generate ECDSA key pair when creating a new key."""
        # Generate key pair
        private_key, public_key = generate_key_pair()
        public_key_pem = serialize_public_key_to_pem(public_key)
        
        # Serialize private key for storage
        from cryptography.hazmat.primitives import serialization
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode("utf-8")
        
        validated_data['public_key'] = public_key_pem
        validated_data['private_key'] = private_key_pem
        
        return super().create(validated_data)
