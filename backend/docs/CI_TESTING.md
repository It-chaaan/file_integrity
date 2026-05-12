# CI and Testing Guide

## Test Database (Dedicated)
- Configure `POSTGRES_TEST_DB` in CI.
- Pre-create the test database if the DB user cannot create databases.
- Use `--keepdb` in CI to reuse the test database between runs.

## Commands
- Unit tests:
  - `python manage.py test auth_api users_api enterprise_integrity tickets security_keys --verbosity 2 --keepdb`

- Coverage:
  - `coverage run --rcfile backend/.coveragerc backend/manage.py test auth_api users_api enterprise_integrity tickets security_keys --verbosity 2 --keepdb`
  - `coverage report --rcfile backend/.coveragerc`
  - `coverage xml --rcfile backend/.coveragerc`

## Notes
- Email backend uses locmem during test runs.
- Password hashing is reduced for test speed.
