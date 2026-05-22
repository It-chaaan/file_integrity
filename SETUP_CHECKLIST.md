# Complete Setup & Integration Checklist

## Overview

You now have a complete performance monitoring and storage system. This checklist walks you through the setup steps to get everything working end-to-end.

**What You Have:**
- ✅ Real-time CPU/GPU/Memory monitoring during crypto operations
- ✅ Automatic metrics storage in Django database
- ✅ REST API for querying metrics
- ✅ Django admin interface for browsing metrics
- ✅ React component for displaying metrics in organized table

---

## Phase 1: Backend Setup

### Step 1.1: Ensure Dependencies Installed

```bash
# Verify psutil and pynvml are installed
pip list | grep -E "psutil|pynvml|cryptography|django"

# Should show:
# cryptography 46.0.4
# Django 6.0.4
# djangorestframework 3.17.1
# psutil 7.2.2
# pynvml 12.535.161 (optional, for GPU)

# If missing, install:
pip install -r requirements.txt
```

### Step 1.2: Add App to INSTALLED_APPS

**File:** `backend/config/settings.py`

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'enterprise_integrity',  # ← Add this line
    # ... other apps
]
```

### Step 1.3: Add API URLs

**File:** `backend/config/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('auth_api.urls')),
    path('api/enterprise/', include('enterprise_integrity.urls')),
    path('api/metrics/', include('enterprise_integrity.performance_metrics_urls')),  # ← Add this
    # ... other routes
]
```

### Step 1.4: Create Database Migrations

```bash
# From backend directory
python manage.py makemigrations enterprise_integrity
python manage.py migrate

# Should show something like:
# Applying enterprise_integrity.0001_initial... OK
```

### Step 1.5: Verify Django Admin Setup

**File:** `backend/enterprise_integrity/admin.py`

Make sure this is present (should already be created):

```python
from django.contrib import admin
from .performance_metrics_admin import PerformanceMetricsAdmin
from .models import PerformanceMetrics

admin.site.register(PerformanceMetrics, PerformanceMetricsAdmin)
```

### Step 1.6: Test Django Admin

```bash
# Start Django server
python manage.py runserver

# Visit: http://localhost:8000/admin/
# Login with your admin account
# Navigate to: Enterprise Integrity → Performance Metrics
# Should show empty table (no metrics yet)
```

---

## Phase 2: Test Monitoring Functions

### Step 2.1: Validate Monitoring Setup

```bash
python validate_monitoring_setup.py

# Should show:
# ✓ psutil module found
# ✓ CPU monitoring available
# ✓ GPU monitoring available (or "GPU monitoring not available - CPU only mode")
# ✓ All tests passed
```

### Step 2.2: Run Example with Metrics Storage

Create `backend/test_integration.py`:

```python
import os
import tempfile
from crypto_performance_monitor import CryptoOperationMonitor
from enterprise_integrity.metrics_integration import save_hash_metrics

# Generate a test file
with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
    f.write('x' * (1024 * 1024))  # 1MB test file
    temp_file = f.name

try:
    # Monitor hashing
    monitor = CryptoOperationMonitor(verbose=True)
    result = monitor.hash_file_with_monitoring(temp_file)
    
    # Save to database (no user since this is a test)
    metrics = save_hash_metrics(result, filename='test_file.txt', user=None)
    
    print(f"\n✓ Metrics saved! ID: {metrics.id}")
    print(f"  File: {metrics.filename}")
    print(f"  Time: {metrics.elapsed_ms:.2f}ms")
    print(f"  CPU: {metrics.cpu_process_percent:.1f}%")
    
finally:
    os.unlink(temp_file)
```

Run it:
```bash
python test_integration.py
```

Check Django admin - metric should appear!

---

## Phase 3: API Testing

### Step 3.1: Get All Metrics

```bash
curl http://localhost:8000/api/metrics/performance-metrics/
```

Should return:
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "filename": "test_file.txt",
      "operation_type": "hash",
      "elapsed_ms": 45.23,
      "cpu_process_percent": 38.5,
      "memory_delta_mb": 2.1,
      ...
    }
  ]
}
```

### Step 3.2: Get Summary Stats

```bash
curl http://localhost:8000/api/metrics/performance-metrics/summary/
```

Should return:
```json
{
  "total_operations": 1,
  "avg_elapsed_ms": 45.23,
  "avg_cpu_percent": 38.5,
  "avg_memory_delta_mb": 2.1,
  ...
}
```

### Step 3.3: Export Data

```bash
# Export as CSV
curl http://localhost:8000/api/metrics/performance-metrics/export/?format=csv > metrics.csv

# Export as JSON
curl http://localhost:8000/api/metrics/performance-metrics/export/?format=json > metrics.json
```

---

## Phase 4: Frontend Setup

### Step 4.1: Install Dependencies (if needed)

```bash
cd frontend
npm install @mui/material @emotion/react @emotion/styled axios
```

These should already be in your `package.json`, but verify:

```bash
npm list @mui/material axios
```

### Step 4.2: Add Component to Your App

**File:** `frontend/src/App.jsx` (or wherever you route your pages)

```jsx
import PerformanceMetricsTable from './components/PerformanceMetricsTable';

function App() {
  return (
    <div>
      {/* Your other components */}
      <PerformanceMetricsTable />
    </div>
  );
}
```

Or create a dedicated page:

**File:** `frontend/src/pages/MetricsPage.jsx`

```jsx
import React from 'react';
import PerformanceMetricsTable from '../components/PerformanceMetricsTable';
import { Container } from '@mui/material';

function MetricsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PerformanceMetricsTable />
    </Container>
  );
}

export default MetricsPage;
```

Add to your routes:
```jsx
import MetricsPage from './pages/MetricsPage';

const routes = [
  // ... other routes
  { path: '/metrics', element: <MetricsPage /> },
];
```

### Step 4.3: Test Frontend Component

```bash
# Start frontend dev server
cd frontend
npm run dev

# Visit: http://localhost:5173/metrics
# Should see empty table with filters and summary cards
```

---

## Phase 5: Integrate with File Upload Workflow

### Step 5.1: Choose Integration Pattern

Pick one:

**Option A: Simple function**
```python
from crypto_performance_monitor import CryptoOperationMonitor
from enterprise_integrity.metrics_integration import save_hash_metrics

def hash_file_with_storage(file_path, filename, user):
    monitor = CryptoOperationMonitor(verbose=False)
    result = monitor.hash_file_with_monitoring(file_path)
    metrics = save_hash_metrics(result, filename, user=user)
    return result['hash'], metrics.id
```

**Option B: API endpoint** (See `EXAMPLE_UPLOAD_VIEWS.py`)
```python
@api_view(['POST'])
def hash_file_endpoint(request):
    # ... complete implementation
```

**Option C: Viewset with actions** (See `EXAMPLE_UPLOAD_VIEWS.py`)
```python
class FileProcessingViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def hash(self, request):
        # ...
```

### Step 5.2: Implement in Your Upload View

Wherever you currently hash/sign/verify files, add metrics storage.

Example - your current code:
```python
def upload_file(request):
    file = request.FILES['file']
    hash_value = calculate_hash(file.path)
    # ... save file to DB
    return {'hash': hash_value}
```

Updated with metrics:
```python
from crypto_performance_monitor import CryptoOperationMonitor
from enterprise_integrity.metrics_integration import save_hash_metrics

def upload_file(request):
    file = request.FILES['file']
    
    # Monitor the hashing
    monitor = CryptoOperationMonitor(verbose=False)
    result = monitor.hash_file_with_monitoring(file.path)
    hash_value = result['hash']
    
    # Save metrics
    metrics = save_hash_metrics(
        result,
        filename=file.name,
        user=request.user if request.user.is_authenticated else None
    )
    
    # ... save file to DB
    return {
        'hash': hash_value,
        'metrics_id': metrics.id if metrics else None,
        'time_ms': result['metrics']['data']['elapsed_ms']
    }
```

### Step 5.3: Complete Workflow Integration

For hash + sign + verify:

```python
def complete_workflow(request):
    file = request.FILES['file']
    
    monitor = CryptoOperationMonitor(verbose=False)
    result = monitor.full_workflow_monitoring(file.path)
    
    # Save workflow metrics (single entry captures all steps)
    metrics = save_workflow_metrics(
        result,
        filename=file.name,
        is_valid=result['is_valid'],
        user=request.user if request.user.is_authenticated else None
    )
    
    return {
        'hash': result['hash'],
        'signature': result['signature'],
        'is_valid': result['is_valid'],
        'metrics_id': metrics.id if metrics else None,
        'total_time_ms': result['summary']['total_elapsed_ms']
    }
```

---

## Phase 6: End-to-End Testing

### Step 6.1: Test Upload → Hash → Metrics Flow

```bash
# Upload a file via your frontend or API
curl -X POST -F "file=@test.txt" http://localhost:8000/api/hash/

# Response should include:
# "metrics_id": 2
```

### Step 6.2: Check Django Admin

```
Visit: http://localhost:8000/admin/enterprise_integrity/performancemetrics/
- Should see new entry with filename "test.txt"
- Should show CPU, memory, and timing metrics
- Status should be "completed"
```

### Step 6.3: Check Frontend Table

```
Visit: http://localhost:8000/metrics/
- Table should display the new metric
- Summary cards should update
- Should be able to filter by operation type
- Should be able to export as CSV/JSON
```

---

## Phase 7: Production Deployment

### Step 7.1: Environment Variables

```bash
# Add to your .env file
DATABASE_URL=postgresql://user:pass@host/dbname  # For production DB
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
```

### Step 7.2: Configure Production Database

If using PostgreSQL (recommended):

```bash
# Install psycopg2
pip install psycopg2-binary

# Run migrations
python manage.py migrate
```

### Step 7.3: Create Superuser for Admin

```bash
python manage.py createsuperuser
# Follow prompts
```

### Step 7.4: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 7.5: Set Up Gunicorn/Nginx

(This is standard Django deployment - not specific to metrics)

---

## Troubleshooting

### Issue: "No module named 'enterprise_integrity'"

**Solution:**
```bash
# Make sure you're in backend directory
cd backend

# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Try again
python manage.py migrate
```

### Issue: "PerformanceMetrics model not found"

**Solution:**
1. Check `INSTALLED_APPS` includes `'enterprise_integrity'`
2. Run migrations: `python manage.py migrate`
3. Check migrations folder exists: `backend/enterprise_integrity/migrations/`

### Issue: Metrics not appearing in admin

**Solution:**
1. Check admin.py registration: `admin.site.register(PerformanceMetrics, PerformanceMetricsAdmin)`
2. Verify migrations ran: `python manage.py showmigrations enterprise_integrity`
3. Check user authentication (metrics require valid user)

### Issue: Frontend table shows "401 Unauthorized"

**Solution:**
1. Check API authentication settings in settings.py
2. Make sure user is logged in
3. Check CORS settings if frontend and backend on different ports

### Issue: GPU monitoring not available

**Solution (Normal!):**
- pynvml is optional, system works with CPU monitoring only
- If you want GPU support: `pip install pynvml`
- Requires NVIDIA GPU and CUDA drivers

---

## Files Created/Modified

### New Files Created:
- ✅ `backend/enterprise_integrity/performance_metrics_model.py` - Django model
- ✅ `backend/enterprise_integrity/performance_metrics_serializers.py` - DRF serializers
- ✅ `backend/enterprise_integrity/performance_metrics_views.py` - API viewset
- ✅ `backend/enterprise_integrity/performance_metrics_urls.py` - URL routing
- ✅ `backend/enterprise_integrity/metrics_integration.py` - Integration utilities
- ✅ `backend/enterprise_integrity/performance_metrics_admin.py` - Admin interface
- ✅ `frontend/src/components/PerformanceMetricsTable.jsx` - React component
- ✅ `backend/METRICS_STORAGE_INTEGRATION.md` - Integration guide
- ✅ `backend/EXAMPLE_UPLOAD_VIEWS.py` - Example implementations

### Files to Verify/Modify:
- [ ] `backend/config/settings.py` - Add to INSTALLED_APPS
- [ ] `backend/config/urls.py` - Add API routes
- [ ] `backend/enterprise_integrity/admin.py` - Ensure PerformanceMetrics registered
- [ ] Your upload views - Add metrics storage calls

---

## Quick Start Summary

```bash
# 1. Backend setup
cd backend
python manage.py migrate
python manage.py runserver

# 2. Test in another terminal
python test_integration.py

# 3. Check admin
# Visit http://localhost:8000/admin/

# 4. Frontend setup
cd frontend
npm run dev

# 5. Check metrics table
# Visit http://localhost:5173/metrics
```

---

## Next Steps

1. **Integrate with your upload workflow** - Use examples in `EXAMPLE_UPLOAD_VIEWS.py`
2. **Monitor real operations** - All crypto operations will now be tracked
3. **Set up alerts** (optional) - Add monitoring for high CPU/memory usage
4. **Backup your data** - Schedule regular database backups
5. **Optimize queries** - Use database indexes for faster filtering

---

## Support & Documentation

For detailed information, see:
- `README_MONITORING.md` - Monitoring system overview
- `PERFORMANCE_MONITORING_GUIDE.md` - Advanced usage
- `METRICS_STORAGE_INTEGRATION.md` - Storage and API details
- `EXAMPLE_UPLOAD_VIEWS.py` - Code examples
