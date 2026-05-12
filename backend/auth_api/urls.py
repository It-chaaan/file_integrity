from django.urls import path

from .views import (
    ChangePasswordView,
    DisableTwoFactorView,
    EnableTwoFactorView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfilePhotoView,
    RefreshView,
    RegisterView,
    VerifyTwoFactorView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/photo/", ProfilePhotoView.as_view(), name="auth-me-photo"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("verify-2fa/", VerifyTwoFactorView.as_view(), name="auth-verify-2fa"),
    path("enable-2fa/", EnableTwoFactorView.as_view(), name="auth-enable-2fa"),
    path("disable-2fa/", DisableTwoFactorView.as_view(), name="auth-disable-2fa"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
]
