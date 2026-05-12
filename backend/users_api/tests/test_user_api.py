from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class UserApiTests(APITestCase):
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
        response = self.client.post("/api/v1/auth/login/", {"username": "admin", "password": "AdminPass123!"}, format="json")
        self.token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_user_create_update_role(self):
        response = self.client.post(
            "/api/v1/users/",
            {
                "username": "staff2",
                "email": "staff2@example.com",
                "password": "StaffPass123!",
                "first_name": "Staff",
                "last_name": "Two",
                "role": "staff",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        user_id = response.data["data"]["id"]

        response = self.client.patch(f"/api/v1/users/{user_id}/", {"department": "Compliance"}, format="json")
        self.assertEqual(response.status_code, 200)

        response = self.client.patch(f"/api/v1/users/{user_id}/role/", {"role": "verifier"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_user_retrieve_delete(self):
        response = self.client.post(
            "/api/v1/users/",
            {
                "username": "to-delete",
                "email": "todelete@example.com",
                "password": "DeletePass123!",
                "role": "staff",
            },
            format="json",
        )
        user_id = response.data["data"]["id"]

        response = self.client.get(f"/api/v1/users/{user_id}/")
        self.assertEqual(response.status_code, 200)

        response = self.client.delete(f"/api/v1/users/{user_id}/")
        self.assertEqual(response.status_code, 200)

    def test_user_activity_stats_search_roles_bulk_export(self):
        response = self.client.post(
            "/api/v1/users/",
            {
                "username": "activity-user",
                "email": "activity@example.com",
                "password": "ActivityPass123!",
                "role": "staff",
            },
            format="json",
        )
        user_id = response.data["data"]["id"]

        response = self.client.get(f"/api/v1/users/{user_id}/activity/?page_size=1")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/users/stats/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/users/search/?q=activity")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/users/roles/")
        self.assertEqual(response.status_code, 200)

        response = self.client.post(
            "/api/v1/users/bulk-update/",
            {"user_ids": [user_id], "updates": {"department": "Ops"}},
            format="json",
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/users/export/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["filename"], "users.csv")

        response = self.client.get("/api/v1/users/export/?stream=true")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response.get("Content-Type", ""))

    def test_user_permissions_non_admin(self):
        User = get_user_model()
        staff = User.objects.create_user(
            username="staffer",
            email="staffer@example.com",
            password="StaffPass123!",
            role=User.ROLE_STAFF,
        )
        response = self.client.post("/api/v1/auth/login/", {"username": "staffer", "password": "StaffPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get("/api/v1/users/")
        self.assertEqual(response.status_code, 403)
