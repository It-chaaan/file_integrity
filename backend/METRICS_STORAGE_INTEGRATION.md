"""
Integration Guide: Performance Metrics Storage & Display

This guide shows how to integrate the monitoring system with file
upload, verification, and display in a table.
"""

# ==============================================================================
# PART 1: DJANGO SETUP
# ==============================================================================

"""
Step 1: Add to INSTALLED_APPS (in settings.py)
---------------------------------------------

INSTALLED_APPS = [
    ...
    'enterprise_integrity',  # Your app with metrics models
]


Step 2: Register API URLs (in config/urls.py)
----------------------------------------------

from django.urls import path, include
from enterprise_integrity.performance_metrics_urls import urlpatterns as metrics_urls

urlpatterns = [
    ...
    path('api/', include('enterprise_integrity.performance_metrics_urls')),
    ...
]

Or add to your existing API router:

from enterprise_integrity.performance_metrics_views import PerformanceMetricsViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'performance-metrics', PerformanceMetricsViewSet)
urlpatterns = [
    path('api/', include(router.urls)),
]


Step 3: Create and Run Migrations
----------------------------------

python manage.py makemigrations
python manage.py migrate


Step 4: Access Django Admin
---------------------------

Go to: /admin/enterprise_integrity/performancemetrics/

Features:
- Browse all stored metrics
- Filter by operation type, status, user, date
- Search by filename or hash
- Export as CSV or JSON
- View detailed metrics visualization
"""

# ==============================================================================
# PART 2: INTEGRATE WITH FILE UPLOAD WORKFLOW
# ==============================================================================

"""
Example: Hash File with Metrics Storage
----------------------------------------

from crypto_performance_monitor import CryptoOperationMonitor
from enterprise_integrity.metrics_integration import save_hash_metrics

def upload_and_hash_file(uploaded_file, user):
    '''Process uploaded file with monitoring.'''
    
    # Monitor the hashing operation
    monitor = CryptoOperationMonitor(verbose=True)
    result = monitor.hash_file_with_monitoring(uploaded_file.path)
    
    # Save metrics to database
    metrics = save_hash_metrics(
        result,
        filename=uploaded_file.name,
        user=user
    )
    
    # Use the hash value
    hash_value = result['hash']
    
    return {
        'hash': hash_value,
        'metrics_id': metrics.id if metrics else None,
        'time_ms': result['metrics']['data']['elapsed_ms'],
    }


Example: Sign File with Metrics Storage
----------------------------------------

from enterprise_integrity.metrics_integration import save_sign_metrics

def sign_file(file_path, private_key, user):
    '''Sign file with monitoring.'''
    
    # Get file hash first
    monitor = CryptoOperationMonitor(verbose=False)
    hash_result = monitor.hash_file_with_monitoring(file_path)
    hash_value = hash_result['hash']
    
    # Sign with monitoring
    sign_result = monitor.sign_with_monitoring(
        private_key,
        hash_value,
        file_path
    )
    
    # Save metrics to database
    metrics = save_sign_metrics(
        sign_result,
        filename=Path(file_path).name,
        user=user
    )
    
    return {
        'signature': sign_result['signature'],
        'metrics_id': metrics.id if metrics else None,
    }


Example: Verify File with Metrics Storage
------------------------------------------

from enterprise_integrity.metrics_integration import save_verify_metrics

def verify_file(file_path, public_key, signature, user):
    '''Verify file signature with monitoring.'''
    
    monitor = CryptoOperationMonitor(verbose=False)
    
    # Get current file hash
    hash_result = monitor.hash_file_with_monitoring(file_path)
    current_hash = hash_result['hash']
    
    # Verify with monitoring
    verify_result = monitor.verify_with_monitoring(
        public_key,
        signature,
        current_hash,
        Path(file_path).name
    )
    
    # Save metrics to database
    is_valid = verify_result['is_valid']
    metrics = save_verify_metrics(
        verify_result,
        filename=Path(file_path).name,
        is_valid=is_valid,
        user=user
    )
    
    return {
        'is_valid': is_valid,
        'metrics_id': metrics.id if metrics else None,
        'time_ms': verify_result['metrics']['data']['elapsed_ms'],
    }


Example: Complete Workflow with Metrics Storage
------------------------------------------------

from enterprise_integrity.metrics_integration import save_workflow_metrics

def process_complete_workflow(file_path, private_key, user):
    '''Run complete workflow (hash → sign → verify) with monitoring.'''
    
    monitor = CryptoOperationMonitor(verbose=True)
    
    # Run complete workflow with monitoring
    result = monitor.full_workflow_monitoring(file_path)
    
    # Save metrics to database
    metrics = save_workflow_metrics(
        result,
        filename=Path(file_path).name,
        is_valid=result['is_valid'],
        user=user
    )
    
    return {
        'hash': result['hash'],
        'signature': result['signature'],
        'is_valid': result['is_valid'],
        'metrics_id': metrics.id if metrics else None,
        'total_time_ms': result['summary']['total_elapsed_ms'],
    }
"""

# ==============================================================================
# PART 3: DJANGO VIEW INTEGRATION
# ==============================================================================

"""
Example: Django REST Framework View
------------------------------------

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from crypto_performance_monitor import CryptoOperationMonitor
from enterprise_integrity.metrics_integration import save_hash_metrics
import tempfile

@api_view(['POST'])
def hash_file_view(request):
    '''API endpoint to upload and hash a file.'''
    
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    try:
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        # Monitor hashing
        monitor = CryptoOperationMonitor(verbose=False)
        result = monitor.hash_file_with_monitoring(tmp_path)
        
        # Save metrics
        metrics = save_hash_metrics(
            result,
            filename=uploaded_file.name,
            user=request.user
        )
        
        # Cleanup
        import os
        os.unlink(tmp_path)
        
        return Response({
            'hash': result['hash'],
            'file_size_mb': result['file_size_mb'],
            'time_ms': result['metrics']['data']['elapsed_ms'],
            'cpu_percent': result['metrics']['data']['cpu']['process_percent'],
            'memory_delta_mb': result['metrics']['data']['memory']['delta_mb'],
            'metrics_id': metrics.id if metrics else None,
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


Example: Complete File Upload with Verification
-------------------------------------------------

@api_view(['POST'])
def upload_and_verify_view(request):
    '''Upload file, hash it, sign it, and verify.'''
    
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    try:
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        # Run complete workflow with monitoring
        monitor = CryptoOperationMonitor(verbose=False)
        result = monitor.full_workflow_monitoring(tmp_path)
        
        # Save metrics
        metrics = save_workflow_metrics(
            result,
            filename=uploaded_file.name,
            is_valid=result['is_valid'],
            user=request.user
        )
        
        # Cleanup
        import os
        os.unlink(tmp_path)
        
        return Response({
            'filename': uploaded_file.name,
            'hash': result['hash'][:32] + '...',
            'signature': result['signature'][:32] + '...',
            'is_valid': result['is_valid'],
            'total_time_ms': result['summary']['total_elapsed_ms'],
            'peak_cpu_percent': result['summary']['peak_cpu_percent'],
            'metrics_id': metrics.id if metrics else None,
            'steps': {
                'hash_time_ms': result['steps']['hash']['data']['elapsed_ms'],
                'sign_time_ms': result['steps']['sign']['data']['elapsed_ms'],
                'verify_time_ms': result['steps']['verify']['data']['elapsed_ms'],
            }
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
"""

# ==============================================================================
# PART 4: REACT INTEGRATION
# ==============================================================================

"""
Step 1: Import Component in Your App
-------------------------------------

import PerformanceMetricsTable from './components/PerformanceMetricsTable';

function App() {
    return (
        <div>
            ...
            <PerformanceMetricsTable />
            ...
        </div>
    );
}


Step 2: Create a Dashboard Page
--------------------------------

// pages/MetricsPage.jsx
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


Step 3: Add Route to Your App
------------------------------

import MetricsPage from './pages/MetricsPage';

const routes = [
    ...
    {
        path: '/metrics',
        element: <MetricsPage />,
        name: 'Performance Metrics'
    },
    ...
];
"""

# ==============================================================================
# PART 5: QUERY EXAMPLES
# ==============================================================================

"""
Get All Metrics:
    GET /api/performance-metrics/

Get Specific Metric Details:
    GET /api/performance-metrics/1/

Filter by Operation Type:
    GET /api/performance-metrics/?operation_type=hash

Filter by User:
    GET /api/performance-metrics/?user=john_doe

Search by Filename:
    GET /api/performance-metrics/?search=document.pdf

Get Summary Statistics:
    GET /api/performance-metrics/summary/
    
    Returns:
    {
        "total_operations": 45,
        "avg_elapsed_ms": 234.56,
        "avg_cpu_percent": 42.3,
        "avg_memory_delta_mb": 1.23,
        "avg_throughput_mbs": 125.4,
        "total_file_size_mb": 1024.5
    }

Get Stats by Operation Type:
    GET /api/performance-metrics/by_operation/
    
    Returns:
    {
        "File Hashing": {
            "count": 20,
            "avg_elapsed_ms": 150.2,
            ...
        },
        "Signature Verification": {
            "count": 15,
            "avg_elapsed_ms": 200.3,
            ...
        }
    }

Get Stats by User:
    GET /api/performance-metrics/by_user/

Get Stats by Date:
    GET /api/performance-metrics/by_date/

Export as CSV:
    GET /api/performance-metrics/export/?format=csv

Export as JSON:
    GET /api/performance-metrics/export/?format=json

Add Note to Metric:
    POST /api/performance-metrics/1/add_note/
    {
        "note": "This file had unexpected high CPU usage"
    }
"""

# ==============================================================================
# PART 6: DATABASE SCHEMA
# ==============================================================================

"""
The PerformanceMetrics model stores:

Basic Info:
- id (primary key)
- filename (max 255 chars)
- file_size_mb (float)
- operation_type (hash/keygen/sign/verify/workflow)
- user (foreign key to User, nullable)
- created_at (timestamp, auto)

CPU Metrics:
- cpu_process_percent (float)
- cpu_system_percent (float)
- cpu_threads (integer)
- cpu_user_time_ms (float)
- cpu_system_time_ms (float)

Memory Metrics:
- memory_before_mb (float)
- memory_after_mb (float)
- memory_delta_mb (float)
- memory_percent (float)

System Metrics:
- system_cpu_percent (float)
- system_memory_percent (float)

GPU Metrics (optional):
- gpu_available (boolean)
- gpu_data (JSON)

Execution Metrics:
- elapsed_ms (float)
- throughput_mbs (float, nullable)

Results:
- hash_value (max 255 chars, nullable)
- signature_valid (boolean, nullable)
- status (string: completed/valid/invalid/failed/verified)

Other:
- notes (text, nullable)

Indexes:
- created_at (for sorting)
- user + created_at (for user filtering)
- operation_type + created_at (for operation filtering)
- filename (for searching)
"""

# ==============================================================================
# PART 7: COMPLETE EXAMPLE WORKFLOW
# ==============================================================================

"""
Full Example: Upload → Hash → Sign → Verify → Display in Table
---------------------------------------------------------------

1. User uploads file via frontend (Upload.jsx)
2. Frontend sends to API endpoint
3. Backend receives file and processes:
   - Save temporarily
   - Monitor hashing
   - Monitor signing
   - Monitor verification
   - Save all metrics to database
   - Return results to frontend
4. Frontend displays file info and metrics ID
5. User navigates to /metrics page
6. React component fetches metrics from API
7. Display in organized table with:
   - Summary statistics at top
   - Searchable, filterable table
   - Sort by any column
   - Pagination
   - Export options
   - Click for detailed metrics view
   - Add notes to metrics

This creates a complete audit trail of all cryptographic operations!
"""
