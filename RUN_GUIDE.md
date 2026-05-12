# Production Run Guide

This guide covers a production-like setup for the Automated Document Integrity Verification System.

## 1) Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

## 2) Configure Environment Variables
1. Copy the template and fill in real values:
   - `.env.example` -> `.env`
2. Set the ECDSA keys and database credentials in `.env`.

## 3) Generate ECDSA P-256 Keys
Use OpenSSL to generate an ECDSA key pair (P-256):

```bash
openssl ecparam -name prime256v1 -genkey -noout -out parity_private.pem
openssl ec -in parity_private.pem -pubout -out parity_public.pem
```

Store the PEM contents in `.env`:
- `PARITY_ECDSA_PRIVATE_KEY_PEM`
- `PARITY_ECDSA_PUBLIC_KEY_PEM`

## 4) Backend (Django)
From `backend/`:

```bash
pip install -r requirements.txt
python manage.py makemigrations enterprise_integrity
python manage.py migrate
```

Run with Gunicorn:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
```

## 5) Frontend (Vite)
From `frontend/`:

```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 5173
```

For production hosting, serve the `dist/` directory with a static server or CDN.

## 6) Zero-Retention Verification
Uploads are processed in memory only. The server stores only:
- SHA-256 hash
- ECDSA signature
- Metadata (no file content, no file paths)

## 7) Health Checks
- Backend API: `GET /api/v1/documents/`
- Frontend: load the site and verify API connectivity
