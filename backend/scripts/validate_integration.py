import io
import json
import os
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.utils import timezone
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile


def _banner(title):
    print(f"\n=== {title} ===")


def _assert(condition, message):
    if not condition:
        raise AssertionError(message)


def _payload(response):
    if hasattr(response, "data"):
        return response.data
    try:
        return response.json()
    except Exception:
        return response.content.decode("utf-8", errors="ignore")


def _make_image_bytes():
    try:
        from PIL import Image
    except ImportError:
        return b"\xFF\xD8\xFF\xE0" + b"0" * 100
    image = Image.new("RGB", (4, 4), color=(120, 180, 200))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def run():
    _banner("Setup")
    if "testserver" not in settings.ALLOWED_HOSTS:
        settings.ALLOWED_HOSTS.append("testserver")
    User = get_user_model()
    admin_user, _ = User.objects.get_or_create(
        username="admin", defaults={"email": "admin@example.com", "role": User.ROLE_ADMIN}
    )
    admin_user.set_password("AdminPass123!")
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()

    client = APIClient()

    _banner("Login")
    resp = client.post("/api/v1/auth/login/", {"username": "admin", "password": "AdminPass123!"}, format="json")
    _assert(resp.status_code == 200, f"Login failed: {resp.status_code} {_payload(resp)}")
    access = _payload(resp).get("data", {}).get("access")
    refresh = _payload(resp).get("data", {}).get("refresh")
    _assert(access and refresh, "Missing tokens in login response")

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    _banner("Create User")
    resp = client.post(
        "/api/v1/users/",
        {
            "username": "staff1",
            "email": "staff1@example.com",
            "password": "StaffPass123!",
            "first_name": "Staff",
            "last_name": "One",
            "role": "staff",
        },
        format="json",
    )
    if resp.status_code == 201:
        user_id = _payload(resp)["data"]["id"]
    else:
        user = User.objects.get(username="staff1")
        user_id = user.id

    _banner("Update User")
    resp = client.patch(f"/api/v1/users/{user_id}/", {"department": "IT"}, format="json")
    _assert(resp.status_code == 200, f"User update failed: {resp.status_code} {_payload(resp)}")

    _banner("Deactivate/Activate User")
    resp = client.post(f"/api/v1/users/{user_id}/deactivate/", format="json")
    _assert(resp.status_code == 200, f"Deactivate failed: {resp.status_code} {_payload(resp)}")
    resp = client.post(f"/api/v1/users/{user_id}/activate/", format="json")
    _assert(resp.status_code == 200, f"Activate failed: {resp.status_code} {_payload(resp)}")

    _banner("Update Role")
    resp = client.patch(f"/api/v1/users/{user_id}/role/", {"role": "verifier"}, format="json")
    _assert(resp.status_code == 200, f"Role update failed: {resp.status_code} {_payload(resp)}")

    _banner("Password Reset Flow")
    resp = client.post("/api/v1/auth/password-reset/", {"email": "staff1@example.com"}, format="json")
    _assert(resp.status_code == 200, f"Password reset request failed: {resp.status_code} {_payload(resp)}")
    token = signing.dumps({"uid": user_id}, salt="password-reset")
    resp = client.post(
        "/api/v1/auth/password-reset-confirm/",
        {"token": token, "password": "NewPass123!", "password2": "NewPass123!"},
        format="json",
    )
    _assert(resp.status_code == 200, f"Password reset confirm failed: {resp.status_code} {_payload(resp)}")

    _banner("Refresh Token")
    resp = client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
    _assert(resp.status_code == 200, f"Refresh failed: {resp.status_code} {_payload(resp)}")

    _banner("2FA Flow")
    resp = client.post("/api/v1/auth/enable-2fa/", format="json")
    _assert(resp.status_code == 200, f"Enable 2FA failed: {resp.status_code} {_payload(resp)}")
    secret = _payload(resp).get("data", {}).get("secret")
    _assert(secret, "Missing 2FA secret")

    import pyotp
    code = pyotp.TOTP(secret).now()
    resp = client.post("/api/v1/auth/verify-2fa/", {"code": code}, format="json")
    _assert(resp.status_code == 200, f"Verify 2FA failed: {resp.status_code} {_payload(resp)}")
    code = pyotp.TOTP(secret).now()
    resp = client.post("/api/v1/auth/disable-2fa/", {"code": code}, format="json")
    _assert(resp.status_code == 200, f"Disable 2FA failed: {resp.status_code} {_payload(resp)}")

    _banner("Profile Photo")
    photo = SimpleUploadedFile("profile.jpg", _make_image_bytes(), content_type="image/jpeg")
    resp = client.post("/api/v1/auth/me/photo/", {"profile_photo": photo})
    _assert(resp.status_code == 200, f"Profile photo upload failed: {resp.status_code} {_payload(resp)}")
    resp = client.delete("/api/v1/auth/me/photo/")
    _assert(resp.status_code == 200, f"Profile photo delete failed: {resp.status_code} {_payload(resp)}")

    _banner("Security Key CRUD")
    resp = client.post("/api/v1/security-keys/", {"name": "primary", "public_key": "fake-key"}, format="json")
    _assert(resp.status_code == 201, f"Security key create failed: {resp.status_code} {_payload(resp)}")
    key_id = _payload(resp)["data"]["id"]
    resp = client.patch(f"/api/v1/security-keys/{key_id}/", {"name": "primary-rotated"}, format="json")
    _assert(resp.status_code == 200, f"Security key update failed: {resp.status_code} {_payload(resp)}")
    resp = client.delete(f"/api/v1/security-keys/{key_id}/")
    _assert(resp.status_code == 200, f"Security key delete failed: {resp.status_code} {_payload(resp)}")

    _banner("Document Upload + Verify")
    doc_payload = f"hello world {timezone.now().isoformat()}".encode("utf-8")
    doc_file = SimpleUploadedFile("doc.txt", doc_payload, content_type="text/plain")
    resp = client.post(
        "/api/v1/documents/",
        {
            "title": "Sample Doc",
            "document_type": "contract",
            "file": doc_file,
            "metadata": json.dumps({"department": "Legal", "uploaded_by": "admin@example.com"}),
        },
        format="multipart",
    )
    _assert(resp.status_code == 201, f"Document upload failed: {resp.status_code} {_payload(resp)}")
    reference_number = _payload(resp)["data"]["reference_number"]

    verify_file = SimpleUploadedFile("doc.txt", doc_payload, content_type="text/plain")
    resp = client.post("/api/v1/documents/verify/", {"file": verify_file, "reference_number": reference_number})
    _assert(resp.status_code == 200, f"Document verify failed: {resp.status_code} {_payload(resp)}")

    _banner("Tickets CRUD + Comments")
    resp = client.post(
        "/api/v1/tickets/",
        {"title": "Issue", "description": "Need help", "category": "technical", "priority": "high"},
        format="multipart",
    )
    _assert(resp.status_code == 201, f"Ticket create failed: {resp.status_code} {_payload(resp)}")
    ticket_id = _payload(resp)["data"]["id"]

    resp = client.patch(f"/api/v1/tickets/{ticket_id}/", {"status": "in_progress"}, format="multipart")
    _assert(resp.status_code == 200, f"Ticket update failed: {resp.status_code} {_payload(resp)}")

    comment_attachment = SimpleUploadedFile("note.txt", b"note", content_type="text/plain")
    resp = client.post(
        f"/api/v1/tickets/{ticket_id}/comments/",
        {"comment": "Investigating", "attachments": [comment_attachment]},
    )
    _assert(resp.status_code == 201, f"Ticket comment failed: {resp.status_code} {_payload(resp)}")

    resp = client.post(f"/api/v1/tickets/{ticket_id}/close/", format="json")
    _assert(resp.status_code == 200, f"Ticket close failed: {resp.status_code} {_payload(resp)}")

    resp = client.delete(f"/api/v1/tickets/{ticket_id}/")
    _assert(resp.status_code == 200, f"Ticket delete failed: {resp.status_code} {_payload(resp)}")

    _banner("Pagination / Search / Filter")
    resp = client.get("/api/v1/users/?page=1&page_size=5&ordering=-created_at")
    _assert(resp.status_code == 200, f"User list failed: {resp.status_code} {_payload(resp)}")

    resp = client.get("/api/v1/tickets/?search=Issue")
    _assert(resp.status_code == 200, f"Ticket search failed: {resp.status_code} {_payload(resp)}")

    resp = client.get("/api/v1/audit-logs/?ordering=-created_at")
    _assert(resp.status_code == 200, f"Audit logs failed: {resp.status_code} {_payload(resp)}")

    _banner("Logout")
    resp = client.post("/api/v1/auth/logout/", format="json")
    _assert(resp.status_code == 200, f"Logout failed: {resp.status_code} {_payload(resp)}")

    print("\nAll validations passed.")


if __name__ == "__main__":
    run()
