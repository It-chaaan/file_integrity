# CI Test Database Setup (Dedicated)

This project uses a dedicated test database (no CREATEDB required for the app user).

## 1) DBA SQL Script

Run the SQL in [backend/docs/DBA_TEST_DB_SETUP.sql](../docs/DBA_TEST_DB_SETUP.sql) as a privileged user.

### Using psql (example)

```bash
psql -U postgres -v app_user=app_user -v app_password=your_password -v test_db=ecommerce_secure_db_test -f backend/docs/DBA_TEST_DB_SETUP.sql
```

## 2) Verification Steps (DBA)

Run these in psql:

```sql
SELECT d.datname, r.rolname AS owner
FROM pg_database d
JOIN pg_roles r ON r.oid = d.datdba
WHERE d.datname = 'ecommerce_secure_db_test';

SELECT datname, datacl FROM pg_database WHERE datname = 'ecommerce_secure_db_test';

\connect ecommerce_secure_db_test
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';
```

## 3) Environment Configuration

### Required .env (local)

```env
DJANGO_ENV=development
DJANGO_SECRET_KEY=replace_me
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173

POSTGRES_DB=ecommerce_secure_db
POSTGRES_TEST_DB=ecommerce_secure_db_test
POSTGRES_USER=app_user
POSTGRES_PASSWORD=app_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### CI example

```env
DJANGO_ENV=test
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=localhost

POSTGRES_DB=ecommerce_secure_db
POSTGRES_TEST_DB=ecommerce_secure_db_test
POSTGRES_USER=app_user
POSTGRES_PASSWORD=app_password
POSTGRES_HOST=ci-postgres
POSTGRES_PORT=5432
```

### Docker example (compose snippet)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_password
      POSTGRES_DB: ecommerce_secure_db
    ports:
      - "5432:5432"
```

After the container starts, run the DBA SQL to create the test DB.

## 4) Test Execution (CI-ready)

```bash
python manage.py test auth_api users_api enterprise_integrity tickets security_keys --verbosity 2 --keepdb
```

## 5) Coverage

```bash
coverage run --rcfile backend/.coveragerc backend/manage.py test auth_api users_api enterprise_integrity tickets security_keys --verbosity 2 --keepdb
coverage report --rcfile backend/.coveragerc
coverage xml --rcfile backend/.coveragerc
```

## 6) OpenAPI Verification

```bash
python manage.py spectacular --file backend/openapi.yaml
python manage.py spectacular --file backend/openapi.json --format openapi-json
```

## 7) Documentation Verification

- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- Schema: `/api/schema/`
- Docs index: [backend/docs/README.md](../docs/README.md)
