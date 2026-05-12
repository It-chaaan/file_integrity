# API Reference (Detailed)

This document lists all endpoints with method, auth, permissions, request/response schemas, examples, filters, and error cases.

## Response Envelope

Success:

```json
{"success": true, "message": "OK", "data": {...}}
```

Error:

```json
{"success": false, "message": "Error", "errors": {...}}
```

## Auth

### POST /api/v1/auth/login/
- Auth: No
- Request schema: `{ username: string, password: string }`
- Response schema: `{ access: string, refresh: string, user: User }`
- Example request:

```json
{"username":"tester","password":"TestPass123!"}
```

- Example response:

```json
{"success":true,"message":"Login successful","data":{"access":"...","refresh":"...","user":{"id":1,"username":"tester"}}}
```

- Errors: 401 invalid credentials

### POST /api/v1/auth/refresh/
- Auth: No
- Request schema: `{ refresh: string }`
- Response schema: `{ access: string }`

### POST /api/v1/auth/logout/
- Auth: Optional
- Request: none
- Response schema: `{ detail: string }`

### POST /api/v1/auth/register/
- Auth: No
- Request schema: `{ username, email, password, password2, first_name?, last_name?, department?, phone? }`
- Response schema: `User`

### GET /api/v1/auth/me/
- Auth: Yes
- Response schema: `User`

### PATCH /api/v1/auth/me/
- Auth: Yes
- Request schema: partial `User`
- Response schema: `User`

### POST /api/v1/auth/me/photo/
- Auth: Yes
- Request: multipart `{ profile_photo: file }`
- Response schema: `User`

### DELETE /api/v1/auth/me/photo/
- Auth: Yes
- Response schema: `User`

### POST /api/v1/auth/change-password/
- Auth: Yes
- Request schema: `{ old_password, new_password, new_password2 }`
- Response schema: `{ detail }`
- Errors: 400 password mismatch or invalid old password

### POST /api/v1/auth/enable-2fa/
- Auth: Yes
- Response schema: `{ secret, otpauth_url }`

### POST /api/v1/auth/verify-2fa/
- Auth: Yes
- Request schema: `{ code }`
- Response schema: `{ detail }`
- Errors: 400 invalid code

### POST /api/v1/auth/disable-2fa/
- Auth: Yes
- Request schema: `{ code }`
- Response schema: `{ detail }`
- Errors: 400 invalid code

### POST /api/v1/auth/password-reset/
- Auth: No
- Request schema: `{ email }`
- Response schema: `{ detail }`

### POST /api/v1/auth/password-reset-confirm/
- Auth: No
- Request schema: `{ token, password, password2 }`
- Response schema: `{ detail }`

## Users

### GET /api/v1/users/
- Auth: admin/super
- Permissions: `IsAdminOrSuper`
- Query: `search`, `role`, `is_active`, `ordering`, `page`, `page_size`
- Response schema: paginated `User[]`

### POST /api/v1/users/
- Auth: admin/super
- Request schema: `UserCreate`
- Response schema: `User`

### GET /api/v1/users/{id}/
- Auth: admin/super
- Response schema: `User`

### PATCH /api/v1/users/{id}/
- Auth: admin/super
- Request schema: partial `User`
- Response schema: `User`

### DELETE /api/v1/users/{id}/
- Auth: admin/super
- Response schema: `{ detail }`

### POST /api/v1/users/{id}/deactivate/
- Auth: admin/super
- Response schema: `User`

### POST /api/v1/users/{id}/activate/
- Auth: admin/super
- Response schema: `User`

### PATCH /api/v1/users/{id}/role/
- Auth: admin/super
- Request schema: `{ role }`
- Response schema: `User`

### POST /api/v1/users/{id}/reset-password/
- Auth: admin/super
- Request schema: `{ password, password2 }`
- Response schema: `{ detail }`

### GET /api/v1/users/{id}/activity/
- Auth: admin/super
- Response: paginated audit log summary

### GET /api/v1/users/stats/
- Auth: admin/super
- Response: totals and by_role

### GET /api/v1/users/search/
- Auth: admin/super
- Query: `q`
- Response: `User[]`

### GET /api/v1/users/roles/
- Auth: admin/super
- Response: `[{value,label}]`

### POST /api/v1/users/bulk-update/
- Auth: admin/super
- Request: `{ user_ids, updates }`
- Response: `{ detail }`

### GET /api/v1/users/export/
- Auth: admin/super
- Query: `stream=true` to stream CSV
- Response: JSON envelope or CSV attachment

## Documents

### GET /api/v1/documents/
- Auth: Yes
- Query: `search`, `status`, `document_type`, `date_from`, `date_to`, `ordering`, `page`, `page_size`
- Response: paginated documents

### POST /api/v1/documents/
- Auth: verifier/staff/admin
- Request: multipart `{ file, title, document_type, description?, metadata? }`
- Response: document

### GET /api/v1/documents/{id}/
- Auth: Yes
- Response: document

### PATCH /api/v1/documents/{id}/
- Auth: verifier/staff/admin
- Request: partial document
- Response: document

### DELETE /api/v1/documents/{id}/
- Auth: verifier/staff/admin
- Response: `{ detail }`

### POST /api/v1/documents/verify/
- Auth: No
- Request: multipart `{ file, reference_number }`
- Response: verification result

### POST /api/v1/documents/batch-verify/
- Auth: No
- Request: multipart `{ files[] }`
- Response: `{ results, count }`

### GET /api/v1/documents/search-by-hash/
- Auth: No
- Query: `hash=`
- Response: `{ found, ... }`

### GET /api/v1/documents/stats/
- Auth: Yes
- Response: totals by status

### GET /api/v1/documents/types/
- Auth: Yes
- Response: list

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
- Response: paginated logs

### POST /api/v1/audit-logs/
- Auth: staff/admin
- Request: `{ action, resource_type, resource_id?, metadata? }`
- Response: log

### GET /api/v1/audit-logs/{id}/
- Auth: staff/admin
- Response: log

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
- Query: `stream=true` for CSV
- Response: JSON envelope or CSV

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
- Response: paginated tickets

### POST /api/v1/tickets/
- Auth: Yes
- Request: multipart `{ title, description, category, priority, attachments? }`
- Response: ticket

### GET /api/v1/tickets/{id}/
- Auth: Yes
- Response: ticket

### PATCH /api/v1/tickets/{id}/
- Auth: Yes
- Request: partial ticket
- Response: ticket

### DELETE /api/v1/tickets/{id}/
- Auth: Yes
- Response: `{ detail }`

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

### GET /api/v1/tickets/{id}/comments/
- Auth: Yes
- Response: list

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
- Response: paginated keys

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
