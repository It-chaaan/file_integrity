"""
Example Upload View with Metrics Storage
==========================================

This file shows practical examples of how to integrate the performance
monitoring system into your Django file upload and verification workflow.

Copy and adapt the code patterns shown here into your actual views.
"""

import os
import tempfile
from pathlib import Path

from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crypto_performance_monitor import CryptoOperationMonitor
from enterprise_integrity.metrics_integration import (
    save_hash_metrics,
    save_sign_metrics,
    save_verify_metrics,
    save_workflow_metrics,
    get_user_metrics,
)


# ==============================================================================
# EXAMPLE 1: Simple Hash File Endpoint
# ==============================================================================

@api_view(['POST'])
def hash_file_endpoint(request):
    """
    Hash an uploaded file and store metrics.
    
    Usage:
        curl -X POST -F "file=@document.pdf" http://localhost:8000/api/hash/
    
    Response:
        {
            "filename": "document.pdf",
            "file_size_mb": 2.5,
            "hash": "3d6a9bce...",
            "elapsed_ms": 45.23,
            "cpu_percent": 38.5,
            "memory_delta_mb": 2.1,
            "metrics_id": 42
        }
    """
    
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_file = request.FILES['file']
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        try:
            # Monitor the hashing operation
            monitor = CryptoOperationMonitor(verbose=False)
            result = monitor.hash_file_with_monitoring(tmp_path)
            
            # Save metrics to database
            metrics = save_hash_metrics(
                result,
                filename=uploaded_file.name,
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'filename': uploaded_file.name,
                'file_size_mb': result['file_size_mb'],
                'hash': result['hash'],
                'elapsed_ms': result['metrics']['data']['elapsed_ms'],
                'cpu_percent': result['metrics']['data']['cpu']['process_percent'],
                'memory_delta_mb': result['metrics']['data']['memory']['delta_mb'],
                'throughput_mbs': result.get('throughput_mbs'),
                'metrics_id': metrics.id if metrics else None,
            })
        
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except Exception as e:
        return Response(
            {'error': f'Error processing file: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==============================================================================
# EXAMPLE 2: Sign File Endpoint
# ==============================================================================

@api_view(['POST'])
def sign_file_endpoint(request):
    """
    Sign an uploaded file and store metrics.
    
    Requires:
        - file: The file to sign
        - private_key: Base64 encoded private key
    
    Usage:
        curl -X POST \
             -F "file=@document.pdf" \
             -F "private_key=<key>" \
             http://localhost:8000/api/sign/
    """
    
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if 'private_key' not in request.POST:
        return Response({'error': 'No private key provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    private_key = request.POST['private_key']
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        try:
            monitor = CryptoOperationMonitor(verbose=False)
            
            # Get file hash first
            hash_result = monitor.hash_file_with_monitoring(tmp_path)
            
            # Sign the hash
            sign_result = monitor.sign_with_monitoring(
                private_key,
                hash_result['hash'],
                uploaded_file.name
            )
            
            # Save metrics for signing operation
            metrics = save_sign_metrics(
                sign_result,
                filename=uploaded_file.name,
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'filename': uploaded_file.name,
                'hash': hash_result['hash'],
                'signature': sign_result['signature'],
                'sign_time_ms': sign_result['metrics']['data']['elapsed_ms'],
                'metrics_id': metrics.id if metrics else None,
            })
        
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==============================================================================
# EXAMPLE 3: Verify File Endpoint
# ==============================================================================

@api_view(['POST'])
def verify_file_endpoint(request):
    """
    Verify a file's signature and store metrics.
    
    Requires:
        - file: The file to verify
        - signature: Base64 encoded signature
        - public_key: Base64 encoded public key
    
    Returns:
        {
            "is_valid": true/false,
            "current_hash": "...",
            "verify_time_ms": 12.34,
            "metrics_id": 42
        }
    """
    
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if 'signature' not in request.POST:
        return Response({'error': 'No signature provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if 'public_key' not in request.POST:
        return Response({'error': 'No public key provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    signature = request.POST['signature']
    public_key = request.POST['public_key']
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        try:
            monitor = CryptoOperationMonitor(verbose=False)
            
            # Get current file hash
            hash_result = monitor.hash_file_with_monitoring(tmp_path)
            current_hash = hash_result['hash']
            
            # Verify signature
            verify_result = monitor.verify_with_monitoring(
                public_key,
                signature,
                current_hash,
                uploaded_file.name
            )
            
            # Save metrics
            is_valid = verify_result['is_valid']
            metrics = save_verify_metrics(
                verify_result,
                filename=uploaded_file.name,
                is_valid=is_valid,
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'filename': uploaded_file.name,
                'is_valid': is_valid,
                'current_hash': current_hash,
                'verify_time_ms': verify_result['metrics']['data']['elapsed_ms'],
                'cpu_percent': verify_result['metrics']['data']['cpu']['process_percent'],
                'metrics_id': metrics.id if metrics else None,
            })
        
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==============================================================================
# EXAMPLE 4: Complete Workflow Endpoint
# ==============================================================================

@api_view(['POST'])
def complete_workflow_endpoint(request):
    """
    Run complete workflow: hash → sign → verify with metrics.
    
    Requires:
        - file: The file to process
        - private_key: Base64 encoded private key (for signing)
    
    Returns:
        {
            "filename": "document.pdf",
            "hash": "3d6a9bce...",
            "signature": "304e...",
            "is_valid": true,
            "total_time_ms": 123.45,
            "peak_cpu_percent": 45.2,
            "steps": {
                "hash_time_ms": 45.2,
                "sign_time_ms": 32.1,
                "verify_time_ms": 46.15
            },
            "metrics_id": 42
        }
    """
    
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if 'private_key' not in request.POST:
        return Response({'error': 'No private key provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.tmp') as tmp:
            for chunk in uploaded_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name
        
        try:
            # Monitor complete workflow
            monitor = CryptoOperationMonitor(verbose=False)
            result = monitor.full_workflow_monitoring(tmp_path)
            
            # Save workflow metrics
            metrics = save_workflow_metrics(
                result,
                filename=uploaded_file.name,
                is_valid=result['is_valid'],
                user=request.user if request.user.is_authenticated else None
            )
            
            return Response({
                'filename': uploaded_file.name,
                'file_size_mb': result['file_size_mb'],
                'hash': result['hash'][:32] + '...',
                'signature': result['signature'][:32] + '...',
                'is_valid': result['is_valid'],
                'total_time_ms': result['summary']['total_elapsed_ms'],
                'peak_cpu_percent': result['summary']['peak_cpu_percent'],
                'peak_memory_mb': result['summary']['peak_memory_delta_mb'],
                'steps': {
                    'hash_time_ms': result['steps']['hash']['data']['elapsed_ms'],
                    'sign_time_ms': result['steps']['sign']['data']['elapsed_ms'],
                    'verify_time_ms': result['steps']['verify']['data']['elapsed_ms'],
                },
                'metrics_id': metrics.id if metrics else None,
            })
        
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==============================================================================
# EXAMPLE 5: Viewset with Multiple Actions
# ==============================================================================

class FileProcessingViewSet(viewsets.ViewSet):
    """
    Complete file processing viewset with integrated metrics.
    
    Endpoints:
        - POST /api/files/hash/ - Hash a file
        - POST /api/files/sign/ - Sign a file
        - POST /api/files/verify/ - Verify a file
        - POST /api/files/process/ - Run complete workflow
        - GET /api/files/metrics/ - Get user's metrics
        - GET /api/files/metrics/summary/ - Summary statistics
    """
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def hash(self, request):
        """Hash endpoint"""
        return hash_file_endpoint(request)
    
    @action(detail=False, methods=['post'])
    def sign(self, request):
        """Sign endpoint"""
        return sign_file_endpoint(request)
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify endpoint"""
        return verify_file_endpoint(request)
    
    @action(detail=False, methods=['post'])
    def process(self, request):
        """Complete workflow endpoint"""
        return complete_workflow_endpoint(request)
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """Get user's metrics"""
        try:
            metrics = get_user_metrics(request.user)
            return Response({
                'count': len(metrics),
                'metrics': [m.to_dict() for m in metrics[:10]]
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==============================================================================
# EXAMPLE 6: URL Configuration
# ==============================================================================

"""
# Add to your urls.py:

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_example import (
    hash_file_endpoint,
    sign_file_endpoint,
    verify_file_endpoint,
    complete_workflow_endpoint,
    FileProcessingViewSet,
)

router = DefaultRouter()
router.register(r'files', FileProcessingViewSet, basename='file-processing')

urlpatterns = [
    # Simple endpoint routes
    path('api/hash/', hash_file_endpoint, name='hash'),
    path('api/sign/', sign_file_endpoint, name='sign'),
    path('api/verify/', verify_file_endpoint, name='verify'),
    path('api/process/', complete_workflow_endpoint, name='process'),
    
    # Viewset routes (includes /api/files/hash/, /api/files/sign/, etc)
    path('api/', include(router.urls)),
]
"""
