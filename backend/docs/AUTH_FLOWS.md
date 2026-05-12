# Auth Flows

## Login
1. POST `/api/v1/auth/login/` with username/password.
2. Receive access and refresh tokens in the response envelope.
3. Use `Authorization: Bearer <access>` for authenticated requests.

## Refresh
1. POST `/api/v1/auth/refresh/` with refresh token.
2. Receive new access token.

## Logout
- POST `/api/v1/auth/logout/` to record audit log.

## Password Reset
1. POST `/api/v1/auth/password-reset/` with email.
2. Receive a generic success response (non-enumerating).
3. POST `/api/v1/auth/password-reset-confirm/` with token and new passwords.

## 2FA
- Enable: POST `/api/v1/auth/enable-2fa/` returns secret + otpauth URL.
- Verify: POST `/api/v1/auth/verify-2fa/` with TOTP code.
- Disable: POST `/api/v1/auth/disable-2fa/` with TOTP code.
