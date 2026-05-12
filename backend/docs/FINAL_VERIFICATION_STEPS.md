# Final Verification Steps (Post-DB Setup)

Run these once the dedicated test DB exists.

## 1) Full Test Suite

```bash
python manage.py test auth_api users_api enterprise_integrity tickets security_keys --verbosity 2 --keepdb
```

## 2) Coverage

```bash
coverage run --rcfile backend/.coveragerc backend/manage.py test auth_api users_api enterprise_integrity tickets security_keys --verbosity 2 --keepdb
coverage report --rcfile backend/.coveragerc
coverage xml --rcfile backend/.coveragerc
```

## 3) OpenAPI

```bash
python manage.py spectacular --file backend/openapi.yaml
python manage.py spectacular --file backend/openapi.json --format openapi-json
```

## 4) Documentation Review

Verify:
- `/api/docs/`, `/api/redoc/`, `/api/schema/`
- Docs index: [backend/docs/README.md](../docs/README.md)
- Endpoint inventory matches schema
- Examples match response envelope
