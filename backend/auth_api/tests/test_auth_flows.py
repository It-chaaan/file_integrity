from django.contrib.auth import get_user_model
from django.core import signing
from django.test import override_settings
import pyotp
import os
from rest_framework.test import APITestCase

from auth_api.crypto import decrypt_mfa_secret, is_encrypted_mfa_secret


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.previous_mfa_secret = os.environ.get("PARITY_MFA_ENCRYPTION_SECRET")
        os.environ["PARITY_MFA_ENCRYPTION_SECRET"] = "test-mfa-encryption-secret"
        self.user = get_user_model().objects.create_user(
            username="tester",
            email="tester@example.com",
            password="TestPass123!",
        )

    def tearDown(self):
        if self.previous_mfa_secret is None:
            os.environ.pop("PARITY_MFA_ENCRYPTION_SECRET", None)
        else:
            os.environ["PARITY_MFA_ENCRYPTION_SECRET"] = self.previous_mfa_secret
        super().tearDown()

    def test_login_refresh_logout(self):
        response = self.client.post("/api/v1/auth/login/", {"username": "tester", "password": "TestPass123!"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        access = response.data["data"]["access"]
        refresh = response.data["data"]["refresh"]

        response = self.client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.post("/api/v1/auth/logout/", format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def test_register_me_change_password(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "RegisterPass123!",
                "password2": "RegisterPass123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])

        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "newuser", "password": "RegisterPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, 200)

        response = self.client.patch("/api/v1/auth/me/", {"department": "Ops"}, format="json")
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            "/api/v1/auth/change-password/",
            {"old_password": "RegisterPass123!", "new_password": "NewPass123!", "new_password2": "NewPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        self.client.credentials()
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "newuser", "password": "NewPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_me_cannot_change_department_or_role(self):
        self.user.department = "Finance"
        self.user.role = self.user.ROLE_CLIENT
        self.user.save(update_fields=["department", "role"])

        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.patch(
            "/api/v1/auth/me/",
            {"department": "Legal", "role": "admin", "email": "tester@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertEqual(self.user.department, "Finance")
        self.assertEqual(self.user.role, self.user.ROLE_CLIENT)

    def test_me_name_updates_split_into_first_and_last_name(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.patch(
            "/api/v1/auth/me/",
            {"name": "James Carter", "email": "tester@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "James")
        self.assertEqual(self.user.last_name, "Carter")

    def test_me_requires_auth(self):
        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, 401)

    def test_password_reset_confirm(self):
        response = self.client.post("/api/v1/auth/password-reset/", {"email": "tester@example.com"}, format="json")
        self.assertEqual(response.status_code, 200)

        token = signing.dumps({"uid": self.user.pk}, salt="password-reset")
        response = self.client.post(
            "/api/v1/auth/password-reset-confirm/",
            {"token": token, "password": "ResetPass123!", "password2": "ResetPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_change_password_invalid_old_password(self):
        response = self.client.post("/api/v1/auth/login/", {"username": "tester", "password": "TestPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.post(
            "/api/v1/auth/change-password/",
            {"old_password": "WrongPass", "new_password": "NewPass123!", "new_password2": "NewPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_login_requires_mfa_when_enabled_and_verify_returns_tokens(self):
        secret = pyotp.random_base32()
        self.user.two_factor_enabled = True
        self.user.two_factor_secret = secret
        self.user.save(update_fields=["two_factor_enabled", "two_factor_secret"])

        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
            HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
            REMOTE_ADDR="198.51.100.23",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertTrue(response.data["data"]["requires_two_factor"])
        self.assertEqual(response.data["data"]["client_ip"], "198.51.100.23")
        self.assertIn("Chrome", response.data["data"]["device_label"])
        self.assertNotIn("access", response.data["data"])
        pending_token = response.data["data"]["pending_token"]

        code = pyotp.TOTP(secret).now()
        response = self.client.post(
            "/api/v1/auth/verify-2fa/",
            {"code": code, "pending_token": pending_token, "remember_device": True},
            format="json",
            HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
            REMOTE_ADDR="198.51.100.23",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])
        self.assertFalse(response.data["data"]["requires_two_factor"])
        self.assertIn("trusted_device_token", response.data["data"])

        trusted_device_token = response.data["data"]["trusted_device_token"]

        self.client.credentials()
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!", "trusted_device_token": trusted_device_token},
            format="json",
            HTTP_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
            REMOTE_ADDR="198.51.100.23",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"])
        self.assertFalse(response.data["data"].get("requires_two_factor", False))
        self.assertTrue(response.data["data"].get("trusted_device", False))

    def test_anonymous_mfa_verify_requires_pending_token(self):
        secret = pyotp.random_base32()
        self.user.two_factor_enabled = True
        self.user.two_factor_secret = secret
        self.user.save(update_fields=["two_factor_enabled", "two_factor_secret"])

        code = pyotp.TOTP(secret).now()
        response = self.client.post(
            "/api/v1/auth/verify-2fa/",
            {"code": code},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])

    def test_trusted_device_token_skips_future_mfa_challenge(self):
        secret = pyotp.random_base32()
        self.user.two_factor_enabled = True
        self.user.two_factor_secret = secret
        self.user.save(update_fields=["two_factor_enabled", "two_factor_secret"])

        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36"

        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
            HTTP_USER_AGENT=user_agent,
            REMOTE_ADDR="198.51.100.23",
        )
        pending_token = response.data["data"]["pending_token"]

        code = pyotp.TOTP(secret).now()
        response = self.client.post(
            "/api/v1/auth/verify-2fa/",
            {"code": code, "pending_token": pending_token, "remember_device": True},
            format="json",
            HTTP_USER_AGENT=user_agent,
            REMOTE_ADDR="198.51.100.23",
        )
        trusted_device_token = response.data["data"]["trusted_device_token"]

        self.client.credentials()
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!", "trusted_device_token": trusted_device_token},
            format="json",
            HTTP_USER_AGENT=user_agent,
            REMOTE_ADDR="198.51.100.23",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertFalse(response.data["data"].get("requires_two_factor", False))
        self.assertTrue(response.data["data"].get("trusted_device", False))

    def test_enable_2fa_stores_secret_encrypted_at_rest(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.post("/api/v1/auth/enable-2fa/", format="json")
        self.assertEqual(response.status_code, 200)
        plaintext_secret = response.data["data"]["secret"]

        self.user.refresh_from_db()
        self.assertNotEqual(self.user.two_factor_secret, plaintext_secret)
        self.assertTrue(is_encrypted_mfa_secret(self.user.two_factor_secret))
        self.assertEqual(decrypt_mfa_secret(self.user.two_factor_secret), plaintext_secret)

    def test_enable_2fa_returns_clear_error_when_encryption_secret_missing(self):
        os.environ.pop("PARITY_MFA_ENCRYPTION_SECRET", None)
        os.environ.pop("PARITY_KEY_ENCRYPTION_SECRET", None)

        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.post("/api/v1/auth/enable-2fa/", format="json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("Missing MFA encryption secret", response.data["message"])

    def test_login_audit_uses_forwarded_client_ip(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
            HTTP_X_FORWARDED_FOR="203.0.113.10, 10.0.0.5",
            REMOTE_ADDR="127.0.0.1",
        )
        self.assertEqual(response.status_code, 200)

        log = AuditLog.objects.filter(action="AUTH_LOGIN_SUCCESS").latest("created_at")
        self.assertEqual(log.ip_address, "203.0.113.10")

    @override_settings(TRUST_PROXY_HEADERS=False)
    def test_login_audit_falls_back_to_remote_addr_when_proxy_headers_disabled(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "TestPass123!"},
            format="json",
            HTTP_X_FORWARDED_FOR="203.0.113.10, 10.0.0.5",
            REMOTE_ADDR="127.0.0.1",
        )
        self.assertEqual(response.status_code, 200)

        log = AuditLog.objects.filter(action="AUTH_LOGIN_SUCCESS").latest("created_at")
        self.assertEqual(log.ip_address, "127.0.0.1")
