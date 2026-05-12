from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
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
    role = serializers.SerializerMethodField()
    role_label = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()

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
            "profile_photo",
            "profile_photo_url",
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
