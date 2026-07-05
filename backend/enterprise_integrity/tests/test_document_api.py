import json
import os
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from security_keys.key_material import build_encrypted_ecdsa_key_pair
from security_keys.models import SecurityKey

from enterprise_integrity.models import DocumentRecord


class DocumentApiTests(APITestCase):
    def setUp(self):
        self.previous_key_secret = os.environ.get("PARITY_KEY_ENCRYPTION_SECRET")
        os.environ["PARITY_KEY_ENCRYPTION_SECRET"] = "test-document-key-secret"

        public_key_pem, encrypted_private_key = build_encrypted_ecdsa_key_pair()
        SecurityKey.objects.create(
            name="Primary Signing Key",
            algorithm=SecurityKey.ALGORITHM_ECDSA,
            key_type="signing",
            public_key=public_key_pem,
            private_key=encrypted_private_key,
            status=SecurityKey.STATUS_ACTIVE,
        )

        User = get_user_model()
        self.user = User.objects.create_user(
            username="clientuser",
            email="client@example.com",
            password="ClientPass123!",
            role=User.ROLE_CLIENT,
        )
        response = self.client.post("/api/v1/auth/login/", {"username": "clientuser", "password": "ClientPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def tearDown(self):
        if self.previous_key_secret is None:
            os.environ.pop("PARITY_KEY_ENCRYPTION_SECRET", None)
        else:
            os.environ["PARITY_KEY_ENCRYPTION_SECRET"] = self.previous_key_secret

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
        self.assertEqual(response.data["data"]["document_hash"], "*****")
        self.assertEqual(response.data["data"]["hash"], "*****")
        self.assertEqual(response.data["data"]["short_hash"], "*****")
        self.assertEqual(response.data["data"]["signature"], "*****")
        reference_number = response.data["data"]["reference_number"]

        self.client.credentials()
        verify_file = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/verify/",
            {"file": verify_file, "reference_number": reference_number},
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["data"]["isAuthentic"])
        self.assertNotIn("signature", response.data["data"])
        self.assertNotIn("uploadedBy", response.data["data"])
        self.assertNotIn("hash", response.data["data"])

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
        doc_id = response.data["data"]["id"]
        doc_hash = DocumentRecord.objects.get(id=doc_id).document_hash

        response = self.client.post(
            "/api/v1/documents/batch-verify/",
            {"files": [SimpleUploadedFile("doc.txt", payload, content_type="text/plain")]},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)

        self.client.credentials()
        response = self.client.get(f"/api/v1/documents/search-by-hash/?hash={doc_hash}")
        self.assertEqual(response.status_code, 401)

        response = self.client.post("/api/v1/auth/login/", {"username": "clientuser", "password": "ClientPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(f"/api/v1/documents/search-by-hash/?hash={doc_hash}")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("signature", response.data["data"])
        self.assertNotIn("document_hash", response.data["data"])

    def test_super_admin_can_see_sensitive_document_fields(self):
        User = get_user_model()
        super_admin = User.objects.create_user(
            username="superadmin",
            email="superadmin@example.com",
            password="SuperAdminPass123!",
            role=User.ROLE_SUPER_ADMIN,
        )
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "superadmin", "password": "SuperAdminPass123!"},
            format="json",
        )
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        payload = b"admin payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Admin Sample",
                "document_type": "contract",
                "file": upload,
                "metadata": json.dumps({"department": "Legal"}),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        self.assertNotEqual(response.data["data"]["document_hash"], "*****")
        self.assertNotEqual(response.data["data"]["short_hash"], "*****")
        self.assertNotEqual(response.data["data"]["signature"], "*****")

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
        verifier = User.objects.create_user(
            username="verifier",
            email="verifier@example.com",
            password="VerifyPass123!",
            role=User.ROLE_VERIFIER,
        )
        response = self.client.post("/api/v1/auth/login/", {"username": "verifier", "password": "VerifyPass123!"}, format="json")
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

    def test_document_verify_tampered_and_wrong_reference(self):
        payload = b"original payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Original",
                "document_type": "contract",
                "file": upload,
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        reference_number = response.data["data"]["reference_number"]

        self.client.credentials()

        tampered = SimpleUploadedFile("doc.txt", b"tampered payload", content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/verify/",
            {"file": tampered, "reference_number": reference_number},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["data"]["found"])
        self.assertFalse(response.data["data"]["isAuthentic"])
        self.assertNotIn("signature", response.data["data"])

        wrong_ref = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/verify/",
            {"file": wrong_ref, "reference_number": "DOC-2099-AAAAAA"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["data"]["found"])
        self.assertFalse(response.data["data"]["isAuthentic"])
        self.assertNotIn("documentType", response.data["data"])
