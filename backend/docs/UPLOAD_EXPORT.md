# Upload and Export Behavior

## Document Uploads
- Endpoint: `POST /api/v1/documents/`
- Required: multipart form with `file`, `title`, `document_type`.
- Optional: `metadata` JSON (string or object).
- Zero-retention: files are only used in-memory for hashing.
- Validation: MIME allowlist and size caps enforced.

## Document Verification
- Endpoint: `POST /api/v1/documents/verify/` (public)
- Requires `file` and `reference_number`.

## Ticket Attachments
- Ticket create accepts `attachments[]`.
- Ticket comments accept `attachments[]`.

## Exports
- Users: `GET /api/v1/users/export/`
- Audit logs: `GET /api/v1/audit-logs/export/`
- Default response: JSON envelope with CSV payload.
- Streaming: add `?stream=true` to return `text/csv` attachment directly.

## Document Download
- `GET /api/v1/documents/{id}/download/` returns 410 with JSON error.
