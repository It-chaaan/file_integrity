from django.contrib.auth import get_user_model
from django.core import signing
from rest_framework.test import APITestCase


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="tester",
            email="tester@example.com",
            password="TestPass123!",
        )

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
