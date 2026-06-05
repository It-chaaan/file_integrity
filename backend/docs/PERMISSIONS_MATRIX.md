# Permissions Matrix

Roles: `super_admin`, `admin`, `staff`, `verifier`, `client`

## Auth
- Login/refresh/logout/register/password reset: public
- Me, change password, 2FA: authenticated

## Users
- List/retrieve/create/update/delete: admin or super_admin
- Role changes, deactivate/activate, password reset: admin or super_admin
- Super-admin accounts can only be modified by super_admin

## Documents
- Verify, batch-verify: public
- Search-by-hash: authenticated document roles only
- Create: client, staff, admin, super_admin
- Update/delete: staff, admin, super_admin
- List/search/stats/types/verifications/download: verifier, staff, admin, super_admin
- Client document access is scoped to own uploads

## Audit Logs
- All endpoints require admin or super_admin

## Tickets
- Create: public and authenticated users
- List/retrieve/comments: client, verifier, staff, admin, super_admin
- Update/status/assign/close/reopen/stats/categories: staff, admin, super_admin
- Client ticket access is scoped to own tickets

## Security Keys
- All endpoints require super_admin

## Frontend Portal Visibility
- `/admin/*`: super_admin and admin only
- `/staff/*`: super_admin, admin, staff, verifier
- verifier users land on `/staff/verify`
- client users land on public routes and cannot access either portal
