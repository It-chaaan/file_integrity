"""
Integration Utilities for Performance Metrics Storage

Provides utilities to save monitoring results to the database
during file upload and verification workflows.
"""

from .performance_metrics_model import PerformanceMetrics
import logging

logger = logging.getLogger(__name__)


def save_hash_metrics(monitoring_result, filename, user=None):
    """
    Save file hashing metrics to database.
    
    Args:
        monitoring_result: Result from monitor.hash_file_with_monitoring()
        filename: Name of the file
        user: Django User object (optional)
    
    Returns:
        Saved PerformanceMetrics instance
    """
    try:
        metrics = PerformanceMetrics.from_monitoring_result(
            monitoring_result,
            operation_type='hash',
            user=user,
            filename=filename
        )
        metrics.save()
        logger.info(f"Hash metrics saved for {filename}")
        return metrics
    except Exception as e:
        logger.error(f"Failed to save hash metrics: {e}")
        return None


def save_sign_metrics(monitoring_result, filename, user=None):
    """
    Save signature generation metrics to database.
    
    Args:
        monitoring_result: Result from monitor.sign_with_monitoring()
        filename: Name of the file being signed
        user: Django User object (optional)
    
    Returns:
        Saved PerformanceMetrics instance
    """
    try:
        metrics = PerformanceMetrics.from_monitoring_result(
            monitoring_result,
            operation_type='sign',
            user=user,
            filename=filename
        )
        metrics.save()
        logger.info(f"Sign metrics saved for {filename}")
        return metrics
    except Exception as e:
        logger.error(f"Failed to save sign metrics: {e}")
        return None


def save_verify_metrics(monitoring_result, filename, is_valid, user=None):
    """
    Save signature verification metrics to database.
    
    Args:
        monitoring_result: Result from monitor.verify_with_monitoring()
        filename: Name of the file being verified
        is_valid: Boolean indicating if signature is valid
        user: Django User object (optional)
    
    Returns:
        Saved PerformanceMetrics instance
    """
    try:
        metrics = PerformanceMetrics.from_monitoring_result(
            monitoring_result,
            operation_type='verify',
            user=user,
            filename=filename
        )
        metrics.signature_valid = is_valid
        metrics.status = 'valid' if is_valid else 'invalid'
        metrics.save()
        logger.info(f"Verify metrics saved for {filename}: {is_valid}")
        return metrics
    except Exception as e:
        logger.error(f"Failed to save verify metrics: {e}")
        return None


def save_workflow_metrics(monitoring_result, filename, is_valid, user=None):
    """
    Save complete workflow metrics to database.
    
    Args:
        monitoring_result: Result from monitor.full_workflow_monitoring()
        filename: Name of the file
        is_valid: Boolean indicating if final signature is valid
        user: Django User object (optional)
    
    Returns:
        Saved PerformanceMetrics instance
    """
    try:
        metrics = PerformanceMetrics.from_monitoring_result(
            monitoring_result,
            operation_type='workflow',
            user=user,
            filename=filename
        )
        metrics.signature_valid = is_valid
        metrics.status = 'verified' if is_valid else 'failed'
        metrics.save()
        logger.info(f"Workflow metrics saved for {filename}")
        return metrics
    except Exception as e:
        logger.error(f"Failed to save workflow metrics: {e}")
        return None


def get_user_metrics(user, operation_type=None, days=None):
    """
    Retrieve metrics for a specific user.
    
    Args:
        user: Django User object
        operation_type: Optional filter by operation type
        days: Optional filter to last N days
    
    Returns:
        QuerySet of PerformanceMetrics
    """
    from django.utils import timezone
    from datetime import timedelta
    
    queryset = PerformanceMetrics.objects.filter(user=user)
    
    if operation_type:
        queryset = queryset.filter(operation_type=operation_type)
    
    if days:
        start_date = timezone.now() - timedelta(days=days)
        queryset = queryset.filter(created_at__gte=start_date)
    
    return queryset.order_by('-created_at')


def get_metrics_by_filename(filename):
    """
    Get all metrics for a specific filename.
    
    Args:
        filename: Name of the file
    
    Returns:
        QuerySet of PerformanceMetrics
    """
    return PerformanceMetrics.objects.filter(
        filename=filename
    ).order_by('-created_at')


def get_metrics_summary(user=None, days=None):
    """
    Get summary statistics.
    
    Args:
        user: Optional Django User object to filter by user
        days: Optional filter to last N days
    
    Returns:
        Dictionary with summary statistics
    """
    from django.db.models import Avg, Count, Sum
    from django.utils import timezone
    from datetime import timedelta
    
    queryset = PerformanceMetrics.objects.all()
    
    if user:
        queryset = queryset.filter(user=user)
    
    if days:
        start_date = timezone.now() - timedelta(days=days)
        queryset = queryset.filter(created_at__gte=start_date)
    
    return queryset.aggregate(
        total_operations=Count('id'),
        avg_elapsed_ms=Avg('elapsed_ms'),
        avg_cpu_percent=Avg('cpu_process_percent'),
        avg_memory_delta_mb=Avg('memory_delta_mb'),
        avg_throughput_mbs=Avg('throughput_mbs'),
        total_file_size_mb=Sum('file_size_mb'),
    )
