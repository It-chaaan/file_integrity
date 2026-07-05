from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.core import signing
import hashlib
from django.utils import timezone
import pyotp
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.utils import extend_schema

from common.responses import error_response, success_response
from common.audit import log_audit_event
from common.client_ip import get_client_ip
from enterprise_integrity.models import AuditLog
from .crypto import (
    decrypt_mfa_secret,
    encrypt_mfa_secret,
    get_mfa_encryption_configuration_error,
)
from .serializers import (
    AuthTokenSerializer,
    ChangePasswordSerializer,
    DetailResponseSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfilePhotoSerializer,
    RegisterSerializer,
    TwoFactorSetupSerializer,
    TwoFactorVerifySerializer,
    UserSerializer,
)

User = get_user_model()
TWO_FACTOR_LOGIN_SALT = "two-factor-login"
TWO_FACTOR_LOGIN_MAX_AGE_SECONDS = 600
TRUSTED_DEVICE_SALT = "trusted-device-login"
TRUSTED_DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30


def get_device_label(request):
    user_agent = (request.META.get("HTTP_USER_AGENT", "") or "").strip()
    normalized = user_agent.lower()

    if "iphone" in normalized or "ipad" in normalized or "ios" in normalized:
        platform = "iPhone" if "iphone" in normalized else "iPad" if "ipad" in normalized else "iOS"
    elif "android" in normalized:
        platform = "Android"
    elif "windows" in normalized:
        platform = "Windows"
    elif "mac os x" in normalized or "macintosh" in normalized:
        platform = "macOS"
    elif "linux" in normalized:
        platform = "Linux"
    else:
        platform = "Unknown device"

    if "edg/" in normalized or "edge/" in normalized:
        browser = "Edge"
    elif "chrome/" in normalized and "edg/" not in normalized:
        browser = "Chrome"
    elif "firefox/" in normalized:
        browser = "Firefox"
    elif "safari/" in normalized and "chrome/" not in normalized:
        browser = "Safari"
    else:
        browser = "Browser"

    return f"{browser} on {platform}".strip()


def get_user_agent_hash(request):
    user_agent = (request.META.get("HTTP_USER_AGENT", "") or "").strip()
    return hashlib.sha256(user_agent.encode("utf-8")).hexdigest()


def build_device_context(request):
    return {
        "client_ip": get_client_ip(request),
        "device_label": get_device_label(request),
    }


def build_trusted_device_token(user, request):
    payload = {
        "uid": user.pk,
        "ua_hash": get_user_agent_hash(request),
        "device_label": get_device_label(request),
        "client_ip": get_client_ip(request),
        "purpose": "trusted_device",
    }
    return signing.dumps(payload, salt=TRUSTED_DEVICE_SALT)


def validate_trusted_device_token(user, request, token):
    if not token:
        return False

    try:
        payload = signing.loads(token, salt=TRUSTED_DEVICE_SALT, max_age=TRUSTED_DEVICE_MAX_AGE_SECONDS)
    except signing.BadSignature:
        return False

    expected_user_agent_hash = get_user_agent_hash(request)
    return (
        payload.get("purpose") == "trusted_device"
        and payload.get("uid") == user.pk
        and payload.get("ua_hash") == expected_user_agent_hash
    )


def build_pending_two_factor_payload(user):
    pending_token = signing.dumps(
        {
            "uid": user.pk,
            "username": user.username,
            "purpose": "login",
        },
        salt=TWO_FACTOR_LOGIN_SALT,
    )
    return {
        "requires_two_factor": True,
        "pending_token": pending_token,
        "expires_in": TWO_FACTOR_LOGIN_MAX_AGE_SECONDS,
        "user": UserSerializer(user).data,
    }


def build_two_factor_login_challenge(user, request):
    challenge = build_pending_two_factor_payload(user)
    challenge.update(build_device_context(request))
    challenge["trusted_device_available"] = True
    return challenge


def issue_auth_tokens_for_user(user):
    refresh = AuthTokenSerializer.get_token(user)
    access = refresh.access_token
    return {
        "refresh": str(refresh),
        "access": str(access),
        "user": UserSerializer(user).data,
        "requires_two_factor": False,
    }


def get_user_two_factor_secret(user):
    return decrypt_mfa_secret(getattr(user, "two_factor_secret", ""))


class LoginView(TokenObtainPairView):
    serializer_class = AuthTokenSerializer
    throttle_scope = "auth_burst"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            AuditLog.objects.create(
                user=None,
                action="AUTH_LOGIN_FAILED",
                resource_type="auth",
                resource_id=str(request.data.get("username", "")),
                details={"username": request.data.get("username")},
                metadata={"username": request.data.get("username")},
                ip_address=get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                severity=AuditLog.SEVERITY_WARNING,
                status=AuditLog.STATUS_FAILED,
            )
            return error_response("Invalid credentials.", errors=serializer.errors, status_code=401)

        user = serializer.user
        if user.two_factor_enabled and get_user_two_factor_secret(user):
            trusted_device_token = request.data.get("trusted_device_token")
            if validate_trusted_device_token(user, request, trusted_device_token):
                user.last_activity = timezone.now()
                user.save(update_fields=["last_activity"])
                log_audit_event(
                    request=request,
                    user=user,
                    action="AUTH_LOGIN_SUCCESS",
                    resource_type="auth",
                    resource_id=str(user.id),
                    details={
                        "username": user.username,
                        "mfa": True,
                        "trusted_device": True,
                        **build_device_context(request),
                    },
                    metadata={
                        "username": user.username,
                        "mfa": True,
                        "trusted_device": True,
                        **build_device_context(request),
                    },
                )
                response_data = issue_auth_tokens_for_user(user)
                response_data["trusted_device"] = True
                return success_response(response_data, message="Login successful")

            log_audit_event(
                request=request,
                user=user,
                action="AUTH_LOGIN_CHALLENGE_ISSUED",
                resource_type="auth",
                resource_id=user.id,
                details={"username": user.username, **build_device_context(request)},
            )
            return success_response(
                build_two_factor_login_challenge(user, request),
                message="Two-factor authentication required",
            )

        user.last_activity = timezone.now()
        user.save(update_fields=["last_activity"])
        AuditLog.objects.create(
            user=user,
            action="AUTH_LOGIN_SUCCESS",
            resource_type="auth",
            resource_id=str(user.id),
            details={"username": user.username},
            metadata={"username": user.username},
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            severity=AuditLog.SEVERITY_INFO,
            status=AuditLog.STATUS_SUCCESS,
        )

        return success_response(serializer.validated_data, message="Login successful")


class RefreshView(TokenRefreshView):
    throttle_scope = "auth_burst"
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        log_audit_event(
            request=request,
            user=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
            action="AUTH_REFRESH",
            resource_type="auth",
            resource_id=getattr(request.user, "id", "") if getattr(request, "user", None) else "",
        )
        return success_response(response.data, message="Token refreshed")


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    throttle_scope = "auth_burst"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        log_audit_event(
            request=request,
            user=user,
            action="AUTH_REGISTERED",
            resource_type="auth",
            resource_id=user.id,
            metadata={"username": user.username, "email": user.email},
        )
        return success_response(UserSerializer(user, context={"request": request}).data, message="User created", status_code=201)


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=None, responses={200: DetailResponseSerializer})
    def post(self, request):
        log_audit_event(
            request=request,
            user=request.user if getattr(request, "user", None) and request.user.is_authenticated else None,
            action="AUTH_LOGOUT",
            resource_type="auth",
            resource_id=getattr(request.user, "id", "") if getattr(request, "user", None) else "",
            details={"username": getattr(request.user, "username", "") if getattr(request, "user", None) else ""},
        )
        return success_response({"detail": "Logged out."}, message="Logged out")


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        return success_response(UserSerializer(request.user, context={"request": request}).data)

    @extend_schema(request=UserSerializer, responses={200: UserSerializer})
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="PROFILE_UPDATED",
            resource_type="user",
            resource_id=request.user.id,
            details={"username": request.user.username},
        )
        return success_response(serializer.data, message="Profile updated")


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "auth_sensitive"

    @extend_schema(request=ChangePasswordSerializer, responses={200: DetailResponseSerializer})
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not check_password(serializer.validated_data["old_password"], user.password):
            log_audit_event(
                request=request,
                user=request.user,
                action="PASSWORD_CHANGE_FAILED",
                resource_type="auth",
                resource_id=request.user.id,
                details={"reason": "invalid_old_password"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response("Old password is incorrect.", status_code=400)

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="PASSWORD_CHANGED",
            resource_type="auth",
            resource_id=request.user.id,
            details={"username": request.user.username},
        )
        return success_response({"detail": "Password updated."}, message="Password updated")


class ProfilePhotoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ProfilePhotoSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = ProfilePhotoSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="PROFILE_PHOTO_UPDATED",
            resource_type="user",
            resource_id=request.user.id,
            details={"username": request.user.username},
        )
        return success_response(UserSerializer(request.user, context={"request": request}).data, message="Profile photo updated")

    @extend_schema(request=None, responses={200: UserSerializer})
    def delete(self, request):
        request.user.profile_photo.delete(save=True)
        log_audit_event(
            request=request,
            user=request.user,
            action="PROFILE_PHOTO_REMOVED",
            resource_type="user",
            resource_id=request.user.id,
            details={"username": request.user.username},
        )
        return success_response(UserSerializer(request.user, context={"request": request}).data, message="Profile photo removed")


class EnableTwoFactorView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "auth_sensitive"

    @extend_schema(request=None, responses={200: TwoFactorSetupSerializer})
    def post(self, request):
        existing_secret = get_user_two_factor_secret(request.user)
        if request.user.two_factor_enabled and existing_secret:
            return success_response({"detail": "2FA already enabled."}, message="2FA already enabled")

        configuration_error = get_mfa_encryption_configuration_error()
        if configuration_error:
            log_audit_event(
                request=request,
                user=request.user,
                action="TWO_FACTOR_SETUP_FAILED",
                resource_type="auth",
                resource_id=request.user.id,
                details={"reason": "missing_encryption_secret"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response(configuration_error, status_code=400)

        secret = pyotp.random_base32()
        try:
            request.user.two_factor_secret = encrypt_mfa_secret(secret)
        except RuntimeError as exc:
            log_audit_event(
                request=request,
                user=request.user,
                action="TWO_FACTOR_SETUP_FAILED",
                resource_type="auth",
                resource_id=request.user.id,
                details={"reason": "encryption_error"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response(str(exc), status_code=400)
        request.user.save(update_fields=["two_factor_secret"])

        totp = pyotp.TOTP(secret)
        otpauth_url = totp.provisioning_uri(name=request.user.username, issuer_name="Parity")

        log_audit_event(
            request=request,
            user=request.user,
            action="TWO_FACTOR_SETUP",
            resource_type="auth",
            resource_id=request.user.id,
            details={"username": request.user.username},
        )
        return success_response({"secret": secret, "otpauth_url": otpauth_url}, message="2FA setup generated")


class VerifyTwoFactorView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth_sensitive"

    @extend_schema(request=TwoFactorVerifySerializer, responses={200: DetailResponseSerializer})
    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        acting_user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        pending_token = serializer.validated_data.get("pending_token")

        if acting_user:
            user = acting_user
            failure_action = "TWO_FACTOR_VERIFY_FAILED"
            success_action = "TWO_FACTOR_ENABLED"
            missing_message = "2FA not configured."
            invalid_message = "Invalid 2FA code."
        else:
            if not pending_token:
                return error_response("Pending MFA token is required.", status_code=400)

            try:
                payload = signing.loads(
                    pending_token,
                    salt=TWO_FACTOR_LOGIN_SALT,
                    max_age=TWO_FACTOR_LOGIN_MAX_AGE_SECONDS,
                )
            except signing.BadSignature:
                log_audit_event(
                    request=request,
                    user=None,
                    action="AUTH_TWO_FACTOR_FAILED",
                    resource_type="auth",
                    resource_id="",
                    details={"username": user.username, **build_device_context(request)},
                    metadata={"username": user.username, **build_device_context(request)},
                    severity=AuditLog.SEVERITY_WARNING,
                )
                return error_response("Your MFA session has expired. Please sign in again.", status_code=401)

            user = User.objects.filter(pk=payload.get("uid"), username=payload.get("username")).first()
            if not user or not user.two_factor_enabled or not get_user_two_factor_secret(user):
                log_audit_event(
                    request=request,
                    user=None,
                    action="AUTH_TWO_FACTOR_FAILED",
                    resource_type="auth",
                    resource_id=str(payload.get("uid", "")),
                    details={"reason": "user_not_available_for_mfa"},
                    status=AuditLog.STATUS_FAILED,
                    severity=AuditLog.SEVERITY_WARNING,
                )
                return error_response("MFA is not available for this account. Please sign in again.", status_code=401)

            failure_action = "AUTH_TWO_FACTOR_FAILED"
            success_action = "AUTH_LOGIN_SUCCESS"
            missing_message = "MFA is not configured for this account."
            invalid_message = "Invalid authentication code."

        decrypted_secret = get_user_two_factor_secret(user)
        if not decrypted_secret:
            log_audit_event(
                request=request,
                user=acting_user or user,
                action=failure_action,
                resource_type="auth",
                resource_id=user.id,
                details={"reason": "not_configured"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response(missing_message, status_code=400)

        totp = pyotp.TOTP(decrypted_secret)
        if not totp.verify(serializer.validated_data["code"], valid_window=1):
            log_audit_event(
                request=request,
                user=acting_user or user,
                action=failure_action,
                resource_type="auth",
                resource_id=user.id,
                details={"reason": "invalid_code"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response(invalid_message, status_code=400)

        if acting_user:
            user.two_factor_enabled = True
            user.save(update_fields=["two_factor_enabled"])
            log_audit_event(
                request=request,
                user=user,
                action=success_action,
                resource_type="auth",
                resource_id=user.id,
                details={"username": user.username},
            )
            return success_response({"detail": "2FA verified."}, message="2FA verified")

        user.last_activity = timezone.now()
        user.save(update_fields=["last_activity"])
        trusted_device_token = None
        if serializer.validated_data.get("remember_device"):
            trusted_device_token = build_trusted_device_token(user, request)
        log_audit_event(
            request=request,
            user=user,
            action=success_action,
            resource_type="auth",
            resource_id=user.id,
            details={"username": user.username, "mfa": True, **build_device_context(request)},
            metadata={"username": user.username, "mfa": True, **build_device_context(request)},
        )
        response_data = issue_auth_tokens_for_user(user)
        if trusted_device_token:
            response_data["trusted_device_token"] = trusted_device_token
            response_data["trusted_device_expires_in"] = TRUSTED_DEVICE_MAX_AGE_SECONDS
        return success_response(response_data, message="Login successful")


class DisableTwoFactorView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = "auth_sensitive"

    @extend_schema(request=TwoFactorVerifySerializer, responses={200: DetailResponseSerializer})
    def post(self, request):
        serializer = TwoFactorVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decrypted_secret = get_user_two_factor_secret(request.user)
        if not decrypted_secret:
            log_audit_event(
                request=request,
                user=request.user,
                action="TWO_FACTOR_DISABLE_FAILED",
                resource_type="auth",
                resource_id=request.user.id,
                details={"reason": "not_configured"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response("2FA not configured.", status_code=400)

        totp = pyotp.TOTP(decrypted_secret)
        if not totp.verify(serializer.validated_data["code"], valid_window=1):
            log_audit_event(
                request=request,
                user=request.user,
                action="TWO_FACTOR_DISABLE_FAILED",
                resource_type="auth",
                resource_id=request.user.id,
                details={"reason": "invalid_code"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response("Invalid 2FA code.", status_code=400)

        request.user.two_factor_enabled = False
        request.user.two_factor_secret = ""
        request.user.save(update_fields=["two_factor_enabled", "two_factor_secret"])
        log_audit_event(
            request=request,
            user=request.user,
            action="TWO_FACTOR_DISABLED",
            resource_type="auth",
            resource_id=request.user.id,
            details={"username": request.user.username},
        )
        return success_response({"detail": "2FA disabled."}, message="2FA disabled")


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth_burst"

    @extend_schema(request=PasswordResetRequestSerializer, responses={200: DetailResponseSerializer})
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.filter(email=serializer.validated_data["email"]).first()
        if not user:
            log_audit_event(
                request=request,
                user=None,
                action="PASSWORD_RESET_REQUESTED",
                resource_type="auth",
                resource_id="",
                details={"email": serializer.validated_data["email"], "result": "not_found"},
            )
            return success_response({"detail": "If the email exists, a reset link was sent."}, message="Reset email sent")

        token = signing.dumps({"uid": user.pk}, salt="password-reset")
        reset_url = f"{request.build_absolute_uri('/')}reset-password?token={token}"

        send_mail(
            "Password reset",
            f"Use this link to reset your password: {reset_url}",
            getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com"),
            [user.email],
            fail_silently=True,
        )

        log_audit_event(
            request=request,
            user=user,
            action="PASSWORD_RESET_REQUESTED",
            resource_type="auth",
            resource_id=user.id,
            metadata={"email": user.email},
            details={"email": user.email},
        )

        return success_response({"detail": "If the email exists, a reset link was sent."}, message="Reset email sent")


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth_burst"

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: DetailResponseSerializer})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payload = signing.loads(serializer.validated_data["token"], salt="password-reset", max_age=3600)
        except signing.BadSignature:
            log_audit_event(
                request=request,
                user=None,
                action="PASSWORD_RESET_CONFIRM_FAILED",
                resource_type="auth",
                resource_id="",
                details={"reason": "invalid_or_expired"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response("Invalid or expired token.", status_code=400)

        user = User.objects.filter(pk=payload.get("uid")).first()
        if not user:
            log_audit_event(
                request=request,
                user=None,
                action="PASSWORD_RESET_CONFIRM_FAILED",
                resource_type="auth",
                resource_id="",
                details={"reason": "user_not_found"},
                status=AuditLog.STATUS_FAILED,
                severity=AuditLog.SEVERITY_WARNING,
            )
            return error_response("Invalid token.", status_code=400)

        user.set_password(serializer.validated_data["password"])
        user.save()
        log_audit_event(
            request=request,
            user=user,
            action="PASSWORD_RESET_CONFIRMED",
            resource_type="auth",
            resource_id=user.id,
            details={"email": user.email},
        )
        return success_response({"detail": "Password reset."}, message="Password reset")
