from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase


class TicketApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="StaffPass123!",
            role=User.ROLE_STAFF,
        )
        response = self.client.post("/api/v1/auth/login/", {"username": "staff", "password": "StaffPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_ticket_create_comment(self):
        response = self.client.post(
            "/api/v1/tickets/",
            {"title": "Issue", "description": "Need help", "category": "technical", "priority": "high"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        ticket_id = response.data["data"]["id"]

        attachment = SimpleUploadedFile("note.txt", b"note", content_type="text/plain")
        response = self.client.post(
            f"/api/v1/tickets/{ticket_id}/comments/",
            {"comment": "Investigating", "attachments": [attachment]},
        )
        self.assertEqual(response.status_code, 201)

    def test_ticket_list_retrieve_update_delete(self):
        response = self.client.post(
            "/api/v1/tickets/",
            {"title": "Issue", "description": "Need help", "category": "technical", "priority": "high"},
            format="multipart",
        )
        ticket_id = response.data["data"]["id"]

        response = self.client.get("/api/v1/tickets/?search=Issue&page_size=1")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/tickets/{ticket_id}/")
        self.assertEqual(response.status_code, 200)

        response = self.client.patch(f"/api/v1/tickets/{ticket_id}/", {"priority": "urgent"}, format="multipart")
        self.assertEqual(response.status_code, 200)

        response = self.client.delete(f"/api/v1/tickets/{ticket_id}/")
        self.assertEqual(response.status_code, 200)

    def test_ticket_status_assign_and_lists(self):
        response = self.client.post(
            "/api/v1/tickets/",
            {"title": "Assign", "description": "Need help", "category": "technical", "priority": "high"},
            format="multipart",
        )
        ticket_id = response.data["data"]["id"]

        response = self.client.patch(f"/api/v1/tickets/{ticket_id}/status/", {"status": "in_progress"}, format="json")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/tickets/{ticket_id}/comments/")
        self.assertEqual(response.status_code, 200)

        response = self.client.post(f"/api/v1/tickets/{ticket_id}/close/")
        self.assertEqual(response.status_code, 200)

        response = self.client.post(f"/api/v1/tickets/{ticket_id}/reopen/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/tickets/stats/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/tickets/categories/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/tickets/search/?q=Assign")
        self.assertEqual(response.status_code, 200)

    def test_ticket_assign_permission_and_errors(self):
        User = get_user_model()
        client_user = User.objects.create_user(
            username="client",
            email="client@example.com",
            password="ClientPass123!",
            role=User.ROLE_CLIENT,
        )
        response = self.client.post(
            "/api/v1/tickets/",
            {"title": "Assign", "description": "Need help", "category": "technical", "priority": "high"},
            format="multipart",
        )
        ticket_id = response.data["data"]["id"]

        response = self.client.post("/api/v1/auth/login/", {"username": "client", "password": "ClientPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.patch(f"/api/v1/tickets/{ticket_id}/assign/", {"assigned_to": client_user.id}, format="json")
        self.assertEqual(response.status_code, 403)

        response = self.client.patch(f"/api/v1/tickets/{ticket_id}/status/", {"status": "invalid"}, format="json")
        self.assertEqual(response.status_code, 400)

        response = self.client.post(f"/api/v1/tickets/{ticket_id}/comments/", {"comment": ""}, format="json")
        self.assertEqual(response.status_code, 400)
