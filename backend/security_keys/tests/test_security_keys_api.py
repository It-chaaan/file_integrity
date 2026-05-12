from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class SecurityKeyApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="AdminPass123!",
            role=User.ROLE_ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "admin", "password": "AdminPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_security_key_list_retrieve(self):
        response = self.client.post(
            "/api/v1/security-keys/",
            {"name": "Key1", "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn0v1\n-----END PUBLIC KEY-----"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        key_id = response.data["data"]["id"]

        response = self.client.get("/api/v1/security-keys/?page_size=1")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/security-keys/{key_id}/")
        self.assertEqual(response.status_code, 200)

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
