# Production Readiness Checklist

## Completed
- Standard response envelopes across endpoints
- Rate limiting for auth endpoints
- Structured JSON logging with request correlation IDs
- Zero-retention document handling
- Upload validation and size limits
- OpenAPI schema generation with envelope wrapping

## Verify in Production
- HTTPS enabled and HSTS configured
- CORS allowlist set to production domains
- Secure cookies enabled
- CI tests and coverage reports passing
- Monitoring and alerting configured

## Known Blockers
- Test DB creation permissions in CI (use `POSTGRES_TEST_DB` + pre-create DB)
