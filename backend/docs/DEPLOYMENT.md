# Deployment Guide

## Prerequisites
- Python 3.11+
- PostgreSQL
- Environment variables configured

## Steps
1. Install dependencies: `pip install -r requirements.txt`
2. Run migrations: `python manage.py migrate`
3. Collect static if needed: `python manage.py collectstatic`
4. Run server: `python manage.py runserver` or via WSGI server

## Health Checks
- `/api/schema/` should return OpenAPI JSON
- `/api/docs/` and `/api/redoc/` should render UI

## Security
- Ensure HTTPS in production
- Set secure cookie and HSTS settings
- Configure CORS allowlist
