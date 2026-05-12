import json
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase


class DocumentApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username="verifier",
            email="verifier@example.com",
            password="VerifyPass123!",
            role=User.ROLE_VERIFIER,
        )
        response = self.client.post("/api/v1/auth/login/", {"username": "verifier", "password": "VerifyPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_document_upload_and_verify(self):
        payload = b"hello world"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Sample",
                "document_type": "contract",
                "file": upload,
                "metadata": json.dumps({"department": "Legal"}),
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        reference_number = response.data["data"]["reference_number"]

        verify_file = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/verify/",
            {"file": verify_file, "reference_number": reference_number},
        )
        self.assertEqual(response.status_code, 200)

    def test_document_list_filters_and_stats(self):
        payload = b"doc payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Policy",
                "document_type": "policy",
                "file": upload,
                "metadata": json.dumps({"department": "Legal", "uploaded_by": "QA"}),
            },
            format="multipart",
        )
        doc_id = response.data["data"]["id"]

        response = self.client.get("/api/v1/documents/?search=Policy&page_size=1")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/documents/stats/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/v1/documents/types/")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/documents/{doc_id}/verifications/")
        self.assertEqual(response.status_code, 200)

    def test_document_batch_verify_and_search(self):
        payload = b"batch payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Batch",
                "document_type": "contract",
                "file": upload,
                "metadata": json.dumps({"department": "Ops"}),
            },
            format="multipart",
        )
        doc_hash = response.data["data"]["document_hash"]

        response = self.client.post(
            "/api/v1/documents/batch-verify/",
            {"files": [SimpleUploadedFile("doc.txt", payload, content_type="text/plain")]},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/documents/search-by-hash/?hash={doc_hash}")
        self.assertEqual(response.status_code, 200)

    def test_document_update_delete_download_error(self):
        payload = b"delete payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Update",
                "document_type": "contract",
                "file": upload,
                "metadata": json.dumps({"department": "QA"}),
            },
            format="multipart",
        )
        doc_id = response.data["data"]["id"]

        response = self.client.patch(f"/api/v1/documents/{doc_id}/", {"status": "expired"}, format="json")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/documents/{doc_id}/download/")
        self.assertEqual(response.status_code, 410)

        response = self.client.delete(f"/api/v1/documents/{doc_id}/")
        self.assertEqual(response.status_code, 200)

    def test_document_permissions_and_errors(self):
        payload = b"perm payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")

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

        response = self.client.post(
            "/api/v1/documents/",
            {"title": "Denied", "document_type": "contract", "file": upload},
            format="multipart",
        )
        self.assertEqual(response.status_code, 403)

        response = self.client.post("/api/v1/documents/verify/", {})
        self.assertEqual(response.status_code, 400)
