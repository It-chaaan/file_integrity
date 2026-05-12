# DBA SQL Setup Checklist

## 1) Run the SQL Script

- Use [backend/docs/DBA_TEST_DB_SETUP.sql](../docs/DBA_TEST_DB_SETUP.sql)
- Replace the variables with your application user and desired test DB name.

## 2) Verify DB Exists and Owner

```sql
SELECT d.datname, r.rolname AS owner
FROM pg_database d
JOIN pg_roles r ON r.oid = d.datdba
WHERE d.datname = 'ecommerce_secure_db_test';
```

## 3) Verify Privileges

```sql
SELECT datname, datacl FROM pg_database WHERE datname = 'ecommerce_secure_db_test';
\connect ecommerce_secure_db_test
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';
```

## 4) Validate Migration Permissions

```sql
\connect ecommerce_secure_db_test
CREATE TABLE permission_check (id serial primary key);
DROP TABLE permission_check;
```

If these succeed, Django migrations and tests can run under `--keepdb`.
