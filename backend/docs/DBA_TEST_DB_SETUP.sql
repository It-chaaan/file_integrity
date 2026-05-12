-- Dedicated test DB setup for CI
-- Replace variables before running.

-- Variables (psql):
--   \set app_user app_user
--   \set test_db ecommerce_secure_db_test
--   \set app_password '***'

-- 1) Create role if needed (skip if already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user') THEN
        EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password');
    END IF;
END $$;

-- 2) Create dedicated test database owned by application user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'test_db') THEN
        EXECUTE format('CREATE DATABASE %I OWNER %I', :'test_db', :'app_user');
    END IF;
END $$;

-- 3) Restrict access: revoke default privileges, then grant minimal permissions
REVOKE ALL ON DATABASE :"test_db" FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE :"test_db" TO :"app_user";

-- 4) Ensure schema create permissions for migrations
\connect :test_db
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";

-- 5) Ensure default privileges for tables/sequences in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO :"app_user";

-- Verification queries
-- DB exists and owner
SELECT d.datname, r.rolname AS owner
FROM pg_database d
JOIN pg_roles r ON r.oid = d.datdba
WHERE d.datname = :'test_db';

-- DB privileges
SELECT datname, datacl FROM pg_database WHERE datname = :'test_db';

-- Schema privileges
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';
