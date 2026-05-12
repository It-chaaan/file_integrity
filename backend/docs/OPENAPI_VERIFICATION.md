# OpenAPI Verification

## Routes
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- Schema JSON: `/api/schema/`

## Artifacts
- YAML: `backend/openapi.yaml`
- JSON: `backend/openapi.json`

## Regenerate

```bash
python manage.py spectacular --file backend/openapi.yaml
python manage.py spectacular --file backend/openapi.json --format openapi-json
```
