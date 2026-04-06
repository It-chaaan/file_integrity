# Enterprise Integrity Backend Module

This Django app prepares backend routes for the frontend contract used by the enterprise document integrity UI.

## Included Components
- Models for document metadata/signature records and verification attempts
- In-memory upload processing (zero-retention enforcement)
- SHA-256 + ECDSA signing and verification using existing crypto engine
- REST endpoints under `/api/v1/documents/` and `/api/v1/audit-logs/`

## Install / Wire Up
1. Add `enterprise_integrity` to `INSTALLED_APPS`.
2. Add URL include in your root `urls.py`:
   - `path("api/", include("enterprise_integrity.urls"))`
3. Apply migrations after generating them:
   - `python manage.py makemigrations enterprise_integrity`
   - `python manage.py migrate`
4. Enforce zero-retention memory upload policy in settings:

```python
FILE_UPLOAD_HANDLERS = [
    "django.core.files.uploadhandler.MemoryFileUploadHandler",
]

# Keep this aligned with frontend max upload size (5MB currently)
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
```

5. Optionally configure persistent signing key in environment:
   - `PARITY_ECDSA_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----"`

If no key is provided, the app generates one in memory at runtime (development fallback).
