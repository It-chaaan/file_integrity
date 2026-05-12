# API Reference

Response envelope:

```json
{"success": true, "message": "OK", "data": {...}}
```

Error envelope:

```json
{"success": false, "message": "Error", "errors": {...}}
```

## Auth
### POST /api/v1/auth/login/
- Auth: No
- Request: `{ "username": "", "password": "" }`
- Response: `{ access, refresh, user }`
- Errors: 401 invalid credentials

### POST /api/v1/auth/refresh/
- Auth: No
- Request: `{ "refresh": "" }`
- Response: `{ access }`

### POST /api/v1/auth/logout/
- Auth: Optional
- Request: none
- Response: `{ detail }`

### POST /api/v1/auth/register/
- Auth: No
- Request: `{ username, email, password, password2, ... }`
- Response: user

### GET /api/v1/auth/me/
- Auth: Yes
- Response: user

### PATCH /api/v1/auth/me/
- Auth: Yes
- Request: user fields
- Response: user

### POST /api/v1/auth/me/photo/
- Auth: Yes
- Request: multipart `{ profile_photo }`
- Response: user

### DELETE /api/v1/auth/me/photo/
- Auth: Yes
- Response: user

### POST /api/v1/auth/change-password/
- Auth: Yes
- Request: `{ old_password, new_password, new_password2 }`
- Response: `{ detail }`

### POST /api/v1/auth/enable-2fa/
- Auth: Yes
- Response: `{ secret, otpauth_url }`

### POST /api/v1/auth/verify-2fa/
- Auth: Yes
- Request: `{ code }`
- Response: `{ detail }`

### POST /api/v1/auth/disable-2fa/
- Auth: Yes
- Request: `{ code }`
- Response: `{ detail }`

### POST /api/v1/auth/password-reset/
- Auth: No
- Request: `{ email }`
- Response: `{ detail }`

### POST /api/v1/auth/password-reset-confirm/
- Auth: No
- Request: `{ token, password, password2 }`
- Response: `{ detail }`

## Users
### GET /api/v1/users/
- Auth: admin/super
- Query: `search`, `role`, `is_active`, `ordering`, `page`, `page_size`
- Response: paginated list

### POST /api/v1/users/
- Auth: admin/super
- Request: `{ username, email, password, role, ... }`
- Response: user

### GET /api/v1/users/{id}/
- Auth: admin/super
- Response: user

### PATCH /api/v1/users/{id}/
- Auth: admin/super
- Request: user fields
- Response: user

### DELETE /api/v1/users/{id}/
- Auth: admin/super
- Response: `{ detail }`

### POST /api/v1/users/{id}/deactivate/
- Auth: admin/super
- Response: user

### POST /api/v1/users/{id}/activate/
- Auth: admin/super
- Response: user

### PATCH /api/v1/users/{id}/role/
- Auth: admin/super
- Request: `{ role }`
- Response: user

### POST /api/v1/users/{id}/reset-password/
- Auth: admin/super
- Request: `{ password, password2 }`
- Response: `{ detail }`

### GET /api/v1/users/{id}/activity/
- Auth: admin/super
- Query: `page`, `page_size`
- Response: paginated list

### GET /api/v1/users/stats/
- Auth: admin/super
- Response: totals + by_role

### GET /api/v1/users/search/
- Auth: admin/super
- Query: `q`
- Response: list

### GET /api/v1/users/roles/
- Auth: admin/super
- Response: list

### POST /api/v1/users/bulk-update/
- Auth: admin/super
- Request: `{ user_ids, updates }`
- Response: `{ detail }`

### GET /api/v1/users/export/
- Auth: admin/super
- Query: `stream=true` for CSV download
- Response: JSON envelope or CSV attachment

## Documents
### GET /api/v1/documents/
- Auth: Yes
- Query: `search`, `status`, `document_type`, `date_from`, `date_to`, `ordering`, `page`, `page_size`
- Response: paginated list

### POST /api/v1/documents/
- Auth: verifier/staff/admin
- Request: multipart `{ file, title, document_type, metadata? }`
- Response: document record

### POST /api/v1/documents/verify/
- Auth: No
- Request: multipart `{ file, reference_number }`
- Response: verification result

### POST /api/v1/documents/batch-verify/
- Auth: No
- Request: multipart `{ files[] }`
- Response: results + count

### GET /api/v1/documents/search-by-hash/
- Auth: No
- Query: `hash=`
- Response: `{ found: bool, ... }`

### GET /api/v1/documents/stats/
- Auth: Yes
- Response: totals by status

### GET /api/v1/documents/types/
- Auth: Yes
- Response: list of types

### GET /api/v1/documents/{id}/verifications/
- Auth: Yes
- Response: list

### GET /api/v1/documents/{id}/download/
- Auth: Yes
- Response: 410 error envelope

## Audit Logs
### GET /api/v1/audit-logs/
- Auth: staff/admin
- Query: `action`, `resource_type`, `user_id`, `severity`, `search`, `page`, `page_size`
- Response: paginated list

### POST /api/v1/audit-logs/
- Auth: staff/admin
- Request: `{ action, resource_type, resource_id?, metadata? }`
- Response: audit log

### GET /api/v1/audit-logs/stats/
- Auth: staff/admin
- Response: totals + top actions

### GET /api/v1/audit-logs/user/{user_id}/
- Auth: staff/admin
- Response: list/paginated

### GET /api/v1/audit-logs/by-action/
- Auth: staff/admin
- Query: `action`
- Response: list/paginated

### GET /api/v1/audit-logs/resource/{resource_type}/{resource_id}/
- Auth: staff/admin
- Response: list/paginated

### GET /api/v1/audit-logs/security/
- Auth: staff/admin
- Response: list/paginated

### GET /api/v1/audit-logs/failed-logins/
- Auth: staff/admin
- Response: list

### GET /api/v1/audit-logs/timeline/
- Auth: staff/admin
- Query: `granularity=day|week|month`
- Response: list

### GET /api/v1/audit-logs/export/
- Auth: staff/admin
- Query: `stream=true` for CSV download
- Response: JSON envelope or CSV attachment

### GET /api/v1/audit-logs/action-types/
- Auth: staff/admin
- Response: list

### GET /api/v1/audit-logs/resource-types/
- Auth: staff/admin
- Response: list

### GET /api/v1/audit-logs/search/
- Auth: staff/admin
- Query: `q`
- Response: list

### GET /api/v1/audit-logs/recent/
- Auth: staff/admin
- Query: `limit=`
- Response: list

## Tickets
### GET /api/v1/tickets/
- Auth: Yes
- Query: `search`, `status`, `priority`, `category`, `assigned_to`, `created_by`, `ordering`, `page`, `page_size`
- Response: paginated list

### POST /api/v1/tickets/
- Auth: Yes
- Request: multipart `{ title, description, category, priority, attachments? }`
- Response: ticket

### PATCH /api/v1/tickets/{id}/status/
- Auth: Yes
- Request: `{ status }`
- Response: ticket

### PATCH /api/v1/tickets/{id}/assign/
- Auth: staff/admin
- Request: `{ assigned_to }`
- Response: ticket

### POST /api/v1/tickets/{id}/comments/
- Auth: Yes
- Request: multipart `{ comment, attachments? }`
- Response: comment

### POST /api/v1/tickets/{id}/close/
- Auth: Yes
- Response: ticket

### POST /api/v1/tickets/{id}/reopen/
- Auth: Yes
- Response: ticket

### GET /api/v1/tickets/stats/
- Auth: Yes
- Response: totals by status

### GET /api/v1/tickets/categories/
- Auth: Yes
- Response: list

### GET /api/v1/tickets/search/
- Auth: Yes
- Query: `q=`
- Response: list

## Security Keys
### GET /api/v1/security-keys/
- Auth: admin/super
- Query: `page`, `page_size`
- Response: paginated list

### POST /api/v1/security-keys/
- Auth: admin/super
- Request: `{ name, public_key }`
- Response: key

### GET /api/v1/security-keys/{id}/
- Auth: admin/super
- Response: key

### PATCH /api/v1/security-keys/{id}/
- Auth: admin/super
- Response: key

### DELETE /api/v1/security-keys/{id}/
- Auth: admin/super
- Response: `{ detail }`
