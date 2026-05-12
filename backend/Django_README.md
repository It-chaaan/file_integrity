## Overview

This backend is a Django + DRF API with standardized response envelopes, JWT auth, audit logging, and zero-retention document handling.

## Quick Start

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Configure environment (.env in backend/):

```env
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173

POSTGRES_DB=ecommerce_secure_db
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

3. Run migrations:

```bash
python manage.py migrate
```

4. Start the server:

```bash
python manage.py runserver
```

## Test Database Configuration (CI-Ready)

Tests use a dedicated test database name. Configure it with:

```env
POSTGRES_TEST_DB=ecommerce_secure_db_test
```

CI options:
- **Preferred**: grant `CREATEDB` on the DB user for CI/test runs.
- **Alternative**: pre-create the test database and run tests with `--keepdb` to reuse it.

Example test run:

```bash
python manage.py test --keepdb
```

## OpenAPI Contract

Schema endpoints:
- `/api/schema/` (OpenAPI JSON)
- `/api/docs/` (Swagger UI)

Generate the committed schema file:

```bash
python manage.py spectacular --file backend/openapi.yaml
```

## Security Hardening

- Request correlation IDs via `X-Request-ID` header
- Rate limiting for auth endpoints
- MIME sniffing prevention
- Structured JSON logging with request context
- Strict upload validation and size limits
