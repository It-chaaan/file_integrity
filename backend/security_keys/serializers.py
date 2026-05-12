from rest_framework import serializers

from .models import SecurityKey


class SecurityKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityKey
        fields = ["id", "name", "public_key", "fingerprint", "last_used", "created_at"]
        read_only_fields = ["fingerprint", "last_used", "created_at"]
