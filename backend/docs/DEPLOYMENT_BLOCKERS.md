# Deployment Blockers

## Current Blocker
- CI test DB not yet created (requires DBA SQL run)

## Resolution
- Run [backend/docs/DBA_TEST_DB_SETUP.sql](../docs/DBA_TEST_DB_SETUP.sql)
- Set `POSTGRES_TEST_DB` in CI environment
- Run tests with `--keepdb`
