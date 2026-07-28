from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase

from enterprise_integrity.models import AuditLog


class AuditLogApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        User = get_user_model()
        self.staff = User.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="AdminPass123!",
            role=User.ROLE_ADMIN,
        )
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "adminuser", "password": "AdminPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        AuditLog.objects.create(
            user=self.staff,
            action="AUTH_LOGIN_FAILED",
            resource_type="auth",
            resource_id="staff",
            severity=AuditLog.SEVERITY_WARNING,
        )
        AuditLog.objects.create(
            user=self.staff,
            action="USER_CREATED",
            resource_type="user",
            resource_id="123",
            severity=AuditLog.SEVERITY_INFO,
        )

    def tearDown(self):
        cache.clear()

    def test_audit_log_list_and_filters(self):
        response = self.client.get("/api/v1/audit-logs/?page_size=1")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/?action=USER_CREATED")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/?resource_type=user")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/?severity=warning")
        self.assertEqual(response.status_code, 200)

    def test_audit_log_stats_and_queries(self):
        response = self.client.get("/api/v1/audit-logs/stats/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/audit-logs/user/{self.staff.id}/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/by-action/?action=USER_CREATED")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/resource/user/123/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/security/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/failed-logins/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/timeline/?granularity=day")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/action-types/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/resource-types/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/search/?q=USER_CREATED")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/audit-logs/recent/?limit=5")
        self.assertEqual(response.status_code, 200)

    def test_audit_log_create_and_export(self):
        response = self.client.post(
            "/api/v1/audit-logs/",
            {"action": "CUSTOM_EVENT", "resource_type": "test", "resource_id": "1"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["data"]["log_hash"])
        self.assertIn("previous_hash", response.data["data"])

        response = self.client.get("/api/v1/audit-logs/export/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["filename"], "audit_logs.csv")

        response = self.client.get("/api/v1/audit-logs/export/?stream=true")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response.get("Content-Type", ""))

    def test_audit_log_permission_denied(self):
        User = get_user_model()
        client_user = User.objects.create_user(
            username="client",
            email="client@example.com",
            password="ClientPass123!",
            role=User.ROLE_CLIENT,
        )
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "client", "password": "ClientPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get("/api/v1/audit-logs/")
        self.assertEqual(response.status_code, 403)
