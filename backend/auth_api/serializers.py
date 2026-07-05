from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from common.client_ip import get_client_ip
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


def get_user_role(user):
    if getattr(user, "role", None):
        return user.role
    if user.is_superuser or user.is_staff:
        return "admin"
    return "client"


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False, allow_blank=False)
    role = serializers.SerializerMethodField()
    role_label = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    two_factor_enabled = serializers.BooleanField(read_only=True)
    current_ip = serializers.SerializerMethodField()
    current_device_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "role_label",
            "department",
            "phone",
            "profile_photo",
            "profile_photo_url",
            "two_factor_enabled",
            "current_ip",
            "current_device_label",
            "is_active",
            "last_activity",
            "created_at",
            "updated_at",
            "is_staff",
            "is_superuser",
        ]
        read_only_fields = [
            "id",
            "is_staff",
            "is_superuser",
            "role",
            "role_label",
            "full_name",
            "profile_photo_url",
            "last_activity",
            "created_at",
            "updated_at",
        ]

    @extend_schema_field(serializers.CharField())
    def get_role(self, obj):
        return get_user_role(obj)

    def get_role_label(self, obj):
        roles = dict(getattr(obj, "ROLE_CHOICES", []))
        return roles.get(get_user_role(obj), get_user_role(obj))

    def get_full_name(self, obj):
        return " ".join(filter(None, [obj.first_name, obj.last_name]))

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_profile_photo_url(self, obj):
        request = self.context.get("request")
        if not obj.profile_photo:
            return None
        url = obj.profile_photo.url
        return request.build_absolute_uri(url) if request else url

    def get_current_ip(self, obj):
        request = self.context.get("request")
        return get_client_ip(request) if request else ""

    def get_current_device_label(self, obj):
        request = self.context.get("request")
        if not request:
            return ""

        user_agent = (request.META.get("HTTP_USER_AGENT", "") or "").lower()
        if "iphone" in user_agent:
            platform = "iPhone"
        elif "ipad" in user_agent:
            platform = "iPad"
        elif "android" in user_agent:
            platform = "Android"
        elif "windows" in user_agent:
            platform = "Windows"
        elif "mac os x" in user_agent or "macintosh" in user_agent:
            platform = "macOS"
        elif "linux" in user_agent:
            platform = "Linux"
        else:
            platform = "Unknown device"

        if "edg/" in user_agent or "edge/" in user_agent:
            browser = "Edge"
        elif "chrome/" in user_agent and "edg/" not in user_agent:
            browser = "Chrome"
        elif "firefox/" in user_agent:
            browser = "Firefox"
        elif "safari/" in user_agent and "chrome/" not in user_agent:
            browser = "Safari"
        else:
            browser = "Browser"

        return f"{browser} on {platform}"

    def update(self, instance, validated_data):
        raw_name = validated_data.pop("name", None)
        if raw_name is not None:
            normalized_name = " ".join(str(raw_name).split())
            if normalized_name:
                parts = normalized_name.split(" ", 1)
                validated_data["first_name"] = parts[0]
                validated_data["last_name"] = parts[1] if len(parts) > 1 else ""

        request = self.context.get("request")
        if request and getattr(request, "user", None) == instance:
            validated_data.pop("department", None)
            validated_data.pop("role", None)
            validated_data.pop("is_staff", None)
            validated_data.pop("is_superuser", None)
            validated_data.pop("is_active", None)
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "department",
            "phone",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        validate_password(attrs.get("password"))
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.role = getattr(User, "ROLE_CLIENT", "client")
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs.get("new_password") != attrs.get("new_password2"):
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        validate_password(attrs.get("new_password"))
        return attrs


class AuthTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = get_user_role(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class ProfilePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["profile_photo"]


class TwoFactorVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    pending_token = serializers.CharField(required=False, allow_blank=False)
    remember_device = serializers.BooleanField(required=False, default=False)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        validate_password(attrs.get("password"))
        return attrs


class DetailResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()


class TwoFactorSetupSerializer(serializers.Serializer):
    secret = serializers.CharField()
    otpauth_url = serializers.CharField()


class TwoFactorChallengeSerializer(serializers.Serializer):
    requires_two_factor = serializers.BooleanField()
    pending_token = serializers.CharField()
    expires_in = serializers.IntegerField()
    client_ip = serializers.CharField(required=False, allow_blank=True)
    device_label = serializers.CharField(required=False, allow_blank=True)
    user = UserSerializer()
