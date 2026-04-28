## Overview

The Django backend supports two modes:
- **Mock Mode**: Returns simulated data without requiring a database
- **Database Mode**: Uses the actual database (default)

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Mock Mode

Edit the `.env` file in the `backend/` directory:

```env
# Set to True to use mock data (no database required)
# Set to False to use real database
MOCK_MODE=True
```

## Files Created/Modified

### New Files Created 
1. **`enterprise_integrity/views_mock.py`** - Mock views with same endpoints as real views
2. **`enterprise_integrity/mock_data.py`** - Mock data generator 
3. **`.env`** - Environment configuration file
4. **`MOCK_MODE_GUIDE.md`** - This documentation
5. **`manage.py`** - Django management script
6. **`config/__init__.py`** - Config package initialization
7. **`config/settings.py`** - Django settings (modified by Cline for mock mode)
8. **`config/urls.py`** - Project URL configuration
9. **`config/wsgi.py`** - WSGI configuration
10. **`config/asgi.py`** - ASGI configuration
11. **`config/settings.py`** - Django settings file for configuration

### Files Modified
1. **`enterprise_integrity/urls.py`**:
   - Added conditional import based on `MOCK_MODE` setting

2. **`requirements.txt`**:
   - Added `django-cors-headers>=4.3.0`
   - Added `python-dotenv>=1.0.0`



## Switching Between Modes

### To Enable Mock Mode (No Database)
1. Set `MOCK_MODE=True` in `.env`
2. Restart the Django server
3. No database migrations needed

### To Disable Mock Mode (Use Database)
1. Set `MOCK_MODE=False` in `.env`
2. Run migrations: `python manage.py migrate`
3. Restart the Django server

## Troubleshooting

### Mock mode not working?
- Ensure `MOCK_MODE=True` in `.env`
- Restart the Django server after changing `.env`
- Check that `python-dotenv` is installed

### Import errors?
- Run `pip install -r requirements.txt`
- Ensure all dependencies are installed

### CORS errors from frontend?
- Ensure frontend is running on `localhost:5173` or `localhost:3000`
- Check that `django-cors-headers` is installed
- Verify CORS settings in `config/settings.py`

### Server port issues?
- The backend runs on `http://localhost:8000/` by default
- If port 8000 is busy, specify a different port: `python manage.py runserver 8001`
- CORS is configured to allow any localhost port
