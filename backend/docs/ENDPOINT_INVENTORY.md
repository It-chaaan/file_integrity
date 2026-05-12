# Endpoint Inventory

Base path: `/api` and `/api/v1`
Response envelope (success):

```json
{"success": true, "message": "OK", "data": {...}}
```

Response envelope (error):

```json
{"success": false, "message": "Error", "errors": {...}}
```

## Auth
- POST /api/v1/auth/login/
- POST /api/v1/auth/refresh/
- POST /api/v1/auth/logout/
- POST /api/v1/auth/register/
- GET /api/v1/auth/me/
- PATCH /api/v1/auth/me/
- POST /api/v1/auth/me/photo/
- DELETE /api/v1/auth/me/photo/
- POST /api/v1/auth/change-password/
- POST /api/v1/auth/enable-2fa/
- POST /api/v1/auth/verify-2fa/
- POST /api/v1/auth/disable-2fa/
- POST /api/v1/auth/password-reset/
- POST /api/v1/auth/password-reset-confirm/

## Users
- GET /api/v1/users/
- POST /api/v1/users/
- GET /api/v1/users/{id}/
- PATCH /api/v1/users/{id}/
- DELETE /api/v1/users/{id}/
- POST /api/v1/users/{id}/deactivate/
- POST /api/v1/users/{id}/activate/
- PATCH /api/v1/users/{id}/role/
- POST /api/v1/users/{id}/reset-password/
- GET /api/v1/users/{id}/activity/
- GET /api/v1/users/stats/
- GET /api/v1/users/search/
- GET /api/v1/users/roles/
- POST /api/v1/users/bulk-update/
- GET /api/v1/users/export/

## Documents
- GET /api/v1/documents/
- POST /api/v1/documents/
- GET /api/v1/documents/{id}/
- PATCH /api/v1/documents/{id}/
- DELETE /api/v1/documents/{id}/
- POST /api/v1/documents/verify/
- POST /api/v1/documents/batch-verify/
- GET /api/v1/documents/search-by-hash/
- GET /api/v1/documents/stats/
- GET /api/v1/documents/types/
- GET /api/v1/documents/{id}/verifications/
- GET /api/v1/documents/{id}/download/

## Audit Logs
- GET /api/v1/audit-logs/
- POST /api/v1/audit-logs/
- GET /api/v1/audit-logs/{id}/
- GET /api/v1/audit-logs/stats/
- GET /api/v1/audit-logs/user/{user_id}/
- GET /api/v1/audit-logs/by-action/
- GET /api/v1/audit-logs/resource/{resource_type}/{resource_id}/
- GET /api/v1/audit-logs/security/
- GET /api/v1/audit-logs/failed-logins/
- GET /api/v1/audit-logs/timeline/
- GET /api/v1/audit-logs/export/
- GET /api/v1/audit-logs/action-types/
- GET /api/v1/audit-logs/resource-types/
- GET /api/v1/audit-logs/search/
- GET /api/v1/audit-logs/recent/

## Tickets
- GET /api/v1/tickets/
- POST /api/v1/tickets/
- GET /api/v1/tickets/{id}/
- PATCH /api/v1/tickets/{id}/
- DELETE /api/v1/tickets/{id}/
- PATCH /api/v1/tickets/{id}/status/
- PATCH /api/v1/tickets/{id}/assign/
- POST /api/v1/tickets/{id}/comments/
- GET /api/v1/tickets/{id}/comments/
- POST /api/v1/tickets/{id}/close/
- POST /api/v1/tickets/{id}/reopen/
- GET /api/v1/tickets/stats/
- GET /api/v1/tickets/categories/
- GET /api/v1/tickets/search/

## Security Keys
- GET /api/v1/security-keys/
- POST /api/v1/security-keys/
- GET /api/v1/security-keys/{id}/
- PATCH /api/v1/security-keys/{id}/
- DELETE /api/v1/security-keys/{id}/

## Docs
- GET /api/schema/
- GET /api/docs/
- GET /api/redoc/
