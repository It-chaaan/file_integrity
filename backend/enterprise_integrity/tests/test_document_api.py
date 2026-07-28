import json
import os
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase

from security_keys.key_material import build_encrypted_ecdsa_key_pair
from security_keys.models import SecurityKey

from enterprise_integrity.models import AuditLog, DocumentRecord


class DocumentApiTests(APITestCase):
    def setUp(self):
        cache.clear()
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
        self.staff_user = User.objects.create_user(
            username="staffuser",
            email="staff@example.com",
            password="StaffPass123!",
            role=User.ROLE_STAFF,
        )
        response = self.client.post("/api/v1/auth/login/", {"username": "clientuser", "password": "ClientPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def tearDown(self):
        cache.clear()
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
        self.assertRegex(response.data["data"]["short_hash"], r"^[0-9a-f]{6}\.{3}[0-9a-f]{4}$")
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
        self.assertEqual(response.data["data"]["status"], "VERIFIED")
        self.assertNotIn("signature", response.data["data"])
        self.assertNotIn("uploadedBy", response.data["data"])
        self.assertNotIn("hash", response.data["data"])
        self.assertIn("receipt", response.data["data"])

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
        self.assertEqual(response.data["data"]["results"][0]["status"], "VERIFIED")

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

    def test_document_update_archive_and_download_error(self):
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

        cache.clear()
        response = self.client.post("/api/v1/auth/login/", {"username": "staffuser", "password": "StaffPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.patch(f"/api/v1/documents/{doc_id}/", {"status": "expired"}, format="json")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/v1/documents/{doc_id}/download/")
        self.assertEqual(response.status_code, 410)

        response = self.client.delete(f"/api/v1/documents/{doc_id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"]["status"], "expired")
        self.assertTrue(DocumentRecord.objects.filter(id=doc_id).exists())

    def test_duplicate_document_upload_returns_existing_record(self):
        payload = b"duplicate payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        first_response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Duplicate",
                "document_type": "contract",
                "file": upload,
            },
            format="multipart",
        )
        self.assertEqual(first_response.status_code, 201)
        reference_number = first_response.data["data"]["reference_number"]

        duplicate_upload = SimpleUploadedFile("doc-copy.txt", payload, content_type="text/plain")
        duplicate_response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Duplicate copy",
                "document_type": "contract",
                "file": duplicate_upload,
            },
            format="multipart",
        )
        self.assertEqual(duplicate_response.status_code, 200)
        self.assertTrue(duplicate_response.data["data"]["duplicate"])
        self.assertEqual(duplicate_response.data["data"]["reference_number"], reference_number)
        self.assertEqual(DocumentRecord.objects.count(), 1)

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
        self.assertEqual(response.data["data"]["status"], "HASH_MISMATCH")
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

    def test_document_verify_revoked_key_and_receipt_endpoint(self):
        payload = b"revoked payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Revoked",
                "document_type": "contract",
                "file": upload,
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, 201)
        doc_id = response.data["data"]["id"]
        reference_number = response.data["data"]["reference_number"]

        key = SecurityKey.objects.get(status=SecurityKey.STATUS_ACTIVE)
        key.status = SecurityKey.STATUS_REVOKED
        key.rotation_reason = "Revoked: incident response"
        key.save()

        self.client.credentials()
        verify_response = self.client.post(
            "/api/v1/documents/verify/",
            {"file": SimpleUploadedFile("doc.txt", payload, content_type="text/plain"), "reference_number": reference_number},
            format="multipart",
        )
        self.assertEqual(verify_response.status_code, 200)
        self.assertEqual(verify_response.data["data"]["status"], "KEY_REVOKED")
        self.assertFalse(verify_response.data["data"]["isAuthentic"])

        response = self.client.post("/api/v1/auth/login/", {"username": "clientuser", "password": "ClientPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        receipt_response = self.client.get(f"/api/v1/documents/{doc_id}/verification-receipt/")
        self.assertEqual(receipt_response.status_code, 200)
        self.assertEqual(receipt_response.data["data"]["referenceNumber"], reference_number)
        self.assertIn("verificationTimestamp", receipt_response.data["data"])
        self.assertIn("signerFingerprint", receipt_response.data["data"])

    def test_document_update_creates_audit_log_chain(self):
        payload = b"audit payload"
        upload = SimpleUploadedFile("doc.txt", payload, content_type="text/plain")
        response = self.client.post(
            "/api/v1/documents/",
            {
                "title": "Audit",
                "document_type": "contract",
                "file": upload,
            },
            format="multipart",
        )
        doc_id = response.data["data"]["id"]

        cache.clear()
        response = self.client.post("/api/v1/auth/login/", {"username": "staffuser", "password": "StaffPass123!"}, format="json")
        token = response.data["data"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.patch(f"/api/v1/documents/{doc_id}/", {"title": "Audit Updated"}, format="json")
        self.assertEqual(response.status_code, 200)

        logs = list(AuditLog.objects.order_by("id"))
        self.assertGreaterEqual(len(logs), 2)
        self.assertEqual(logs[0].previous_hash, "")
        self.assertTrue(logs[0].log_hash)
        self.assertEqual(logs[1].previous_hash, logs[0].log_hash)
        self.assertTrue(logs[1].log_hash)
