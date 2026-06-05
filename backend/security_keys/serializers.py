from rest_framework import serializers
from django.utils import timezone

from .models import SecurityKey
from .crypto import has_key_encryption_secret_configured, is_encrypted_private_key
from .key_material import build_encrypted_ecdsa_key_pair


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
            "has_encrypted_private_key",
        ]
        read_only_fields = [
            "public_key",
            "fingerprint",
            "status",
            "last_used",
            "created_at",
            "created_by",
            "has_encrypted_private_key",
        ]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username
        return "System"
    
    def get_rotated_by_name(self, obj):
        if obj.rotated_by:
            return f"{obj.rotated_by.first_name} {obj.rotated_by.last_name}".strip() or obj.rotated_by.username
        return None

    def get_has_encrypted_private_key(self, obj):
        return is_encrypted_private_key(obj.private_key)

    has_encrypted_private_key = serializers.SerializerMethodField()

    def validate(self, attrs):
        if self.instance is None and not has_key_encryption_secret_configured():
            raise serializers.ValidationError(
                {"non_field_errors": ["Missing PARITY_KEY_ENCRYPTION_SECRET. Configure it before creating a new signing key."]}
            )

        expires_at = attrs.get("expires_at")
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError({"expires_at": "Expiration must be in the future."})

        if (
            self.instance is None
            and
            attrs.get("algorithm", SecurityKey.ALGORITHM_ECDSA) == SecurityKey.ALGORITHM_ECDSA
            and attrs.get("key_type", "signing") == "signing"
            and SecurityKey.objects.filter(
                algorithm=SecurityKey.ALGORITHM_ECDSA,
                key_type="signing",
                status=SecurityKey.STATUS_ACTIVE,
            ).exists()
        ):
            raise serializers.ValidationError(
                {"non_field_errors": ["An active ECDSA signing key already exists. Rotate or revoke it before creating another."]}
            )
        return attrs
    
    def create(self, validated_data):
        """Auto-generate ECDSA key pair when creating a new key."""
        public_key_pem, encrypted_private_key = build_encrypted_ecdsa_key_pair()
        validated_data["public_key"] = public_key_pem
        validated_data["private_key"] = encrypted_private_key
        
        return super().create(validated_data)
