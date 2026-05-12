from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "role_label",
            "department",
            "phone",
            "is_active",
            "last_activity",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "last_activity"]

    def get_full_name(self, obj):
        return " ".join(filter(None, [obj.first_name, obj.last_name]))

    def get_role_label(self, obj):
        roles = dict(getattr(obj, "ROLE_CHOICES", []))
        return roles.get(obj.role, obj.role)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "department",
            "phone",
            "is_active",
        ]

    def validate_password(self, value):
        if value is None or len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class PasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value
