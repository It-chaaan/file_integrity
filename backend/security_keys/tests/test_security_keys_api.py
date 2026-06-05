import os

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from security_keys.crypto import ENCRYPTED_PREFIX
from security_keys.models import SecurityKey


class SecurityKeyApiTests(APITestCase):
    def setUp(self):
        self.previous_key_secret = os.environ.get("PARITY_KEY_ENCRYPTION_SECRET")
        os.environ["PARITY_KEY_ENCRYPTION_SECRET"] = "test-security-key-secret"

        User = get_user_model()
        self.admin = User.objects.create_user(
            username="superadmin",
            email="superadmin@example.com",
            password="AdminPass123!",
            role=User.ROLE_SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "superadmin", "password": "AdminPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def tearDown(self):
        if self.previous_key_secret is None:
            os.environ.pop("PARITY_KEY_ENCRYPTION_SECRET", None)
        else:
            os.environ["PARITY_KEY_ENCRYPTION_SECRET"] = self.previous_key_secret

    def test_security_key_list_retrieve(self):
        response = self.client.post(
            "/api/v1/security-keys/",
            {"name": "Key1"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        key_id = response.data["data"]["id"]
        self.assertNotIn("private_key", response.data["data"])
        self.assertTrue(response.data["data"]["has_encrypted_private_key"])

        key = SecurityKey.objects.get(pk=key_id)
        self.assertTrue(key.private_key.startswith(ENCRYPTED_PREFIX))

        response = self.client.get("/api/v1/security-keys/?page_size=1")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("private_key", response.data["data"]["results"][0])

        response = self.client.get(f"/api/v1/security-keys/{key_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("private_key", response.data["data"])

    def test_security_key_rotation_encrypts_new_key(self):
        response = self.client.post("/api/v1/security-keys/", {"name": "Primary"}, format="json")
        self.assertEqual(response.status_code, 201)
        key_id = response.data["data"]["id"]

        response = self.client.post(
            f"/api/v1/security-keys/{key_id}/rotate/",
            {"rotation_reason": "annual rotation"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("private_key", response.data["data"])

        rotated_key = SecurityKey.objects.get(pk=response.data["data"]["id"])
        old_key = SecurityKey.objects.get(pk=key_id)
        self.assertEqual(old_key.status, SecurityKey.STATUS_ROTATED)
        self.assertTrue(rotated_key.private_key.startswith(ENCRYPTED_PREFIX))

    def test_security_key_permission_denied(self):
        User = get_user_model()
        staff = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="StaffPass123!",
            role=User.ROLE_STAFF,
        )
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "staff", "password": "StaffPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get("/api/v1/security-keys/")
        self.assertEqual(response.status_code, 403)
