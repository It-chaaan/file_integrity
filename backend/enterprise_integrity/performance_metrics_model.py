"""
Performance Metrics Storage Model

Stores all CPU, GPU, memory, and timing metrics for uploaded files
and their cryptographic operations.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class PerformanceMetrics(models.Model):
    """Store performance monitoring data for cryptographic operations."""
    
    OPERATION_CHOICES = [
        ('hash', 'File Hashing'),
        ('keygen', 'Key Generation'),
        ('sign', 'Signature Generation'),
        ('verify', 'Signature Verification'),
        ('workflow', 'Complete Workflow'),
    ]
    
    # File and Operation Info
    filename = models.CharField(max_length=255)
    file_size_mb = models.FloatField()
    operation_type = models.CharField(max_length=20, choices=OPERATION_CHOICES)
    
    # User and Timestamp
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Performance Metrics - CPU
    cpu_process_percent = models.FloatField(help_text="Process CPU usage %")
    cpu_system_percent = models.FloatField(help_text="System CPU usage %")
    cpu_threads = models.IntegerField()
    cpu_user_time_ms = models.FloatField()
    cpu_system_time_ms = models.FloatField()
    
    # Performance Metrics - Memory
    memory_before_mb = models.FloatField()
    memory_after_mb = models.FloatField()
    memory_delta_mb = models.FloatField()
    memory_percent = models.FloatField()
    
    # Performance Metrics - System
    system_cpu_percent = models.FloatField()
    system_memory_percent = models.FloatField()
    
    # Performance Metrics - GPU (optional)
    gpu_available = models.BooleanField(default=False)
    gpu_data = models.JSONField(default=dict, blank=True)
    
    # Execution Time
    elapsed_ms = models.FloatField(help_text="Total execution time in milliseconds")
    throughput_mbs = models.FloatField(null=True, blank=True, help_text="MB/s throughput")
    
    # Operation Results
    hash_value = models.CharField(max_length=255, null=True, blank=True)
    signature_valid = models.BooleanField(null=True, blank=True)
    status = models.CharField(max_length=50, default='completed')
    
    # Notes
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Performance Metrics"
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['operation_type', '-created_at']),
            models.Index(fields=['filename']),
        ]
    
    def __str__(self):
        return f"{self.operation_type} - {self.filename} ({self.elapsed_ms}ms)"
    
    @classmethod
    def from_monitoring_result(cls, monitoring_result, operation_type, user=None, filename=None):
        """
        Create a PerformanceMetrics instance from monitoring result.
        
        Args:
            monitoring_result: Result dict from CryptoOperationMonitor
            operation_type: Type of operation (hash, sign, verify, etc.)
            user: Django User object (optional)
            filename: Filename being processed
        
        Returns:
            PerformanceMetrics instance (not saved)
        """
        metrics_data = monitoring_result.get('metrics', {}).get('data', {})
        
        # Extract metrics
        elapsed_ms = metrics_data.get('elapsed_ms', 0)
        file_size_mb = monitoring_result.get('file_size_mb', 0)
        
        # Calculate throughput if applicable
        throughput_mbs = None
        if file_size_mb > 0 and elapsed_ms > 0:
            throughput_mbs = file_size_mb / (elapsed_ms / 1000)
        
        # CPU metrics
        cpu_data = metrics_data.get('cpu', {})
        cpu_user_time = cpu_data.get('user_time_ms', 0)
        cpu_system_time = cpu_data.get('system_time_ms', 0)
        
        # GPU data
        gpu_data = metrics_data.get('gpu', {})
        gpu_available = gpu_data.get('available', False)
        
        # Memory metrics
        memory_data = metrics_data.get('memory', {})
        
        # Create instance
        instance = cls(
            filename=filename or monitoring_result.get('file_path', 'unknown'),
            file_size_mb=file_size_mb,
            operation_type=operation_type,
            user=user,
            
            # CPU
            cpu_process_percent=cpu_data.get('process_percent', 0),
            cpu_system_percent=cpu_data.get('system_percent', 0),
            cpu_threads=cpu_data.get('threads', 0),
            cpu_user_time_ms=cpu_user_time,
            cpu_system_time_ms=cpu_system_time,
            
            # Memory
            memory_before_mb=memory_data.get('before_mb', 0),
            memory_after_mb=memory_data.get('after_mb', 0),
            memory_delta_mb=memory_data.get('delta_mb', 0),
            memory_percent=memory_data.get('percent', 0),
            
            # System
            system_cpu_percent=metrics_data.get('system', {}).get('cpu_percent', 0),
            system_memory_percent=metrics_data.get('system', {}).get('memory_percent', 0),
            
            # GPU
            gpu_available=gpu_available,
            gpu_data=gpu_data,
            
            # Execution
            elapsed_ms=elapsed_ms,
            throughput_mbs=throughput_mbs,
            
            # Results
            hash_value=monitoring_result.get('hash', '')[:255],
            signature_valid=monitoring_result.get('is_valid'),
        )
        
        return instance
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'filename': self.filename,
            'file_size_mb': self.file_size_mb,
            'operation_type': self.get_operation_type_display(),
            'created_at': self.created_at.isoformat(),
            'user': self.user.username if self.user else 'Anonymous',
            'cpu': {
                'process_percent': self.cpu_process_percent,
                'system_percent': self.cpu_system_percent,
                'threads': self.cpu_threads,
                'user_time_ms': self.cpu_user_time_ms,
                'system_time_ms': self.cpu_system_time_ms,
            },
            'memory': {
                'before_mb': self.memory_before_mb,
                'after_mb': self.memory_after_mb,
                'delta_mb': self.memory_delta_mb,
                'percent': self.memory_percent,
            },
            'system': {
                'cpu_percent': self.system_cpu_percent,
                'memory_percent': self.system_memory_percent,
            },
            'gpu': {
                'available': self.gpu_available,
                'data': self.gpu_data,
            },
            'execution': {
                'elapsed_ms': self.elapsed_ms,
                'throughput_mbs': self.throughput_mbs,
            },
            'results': {
                'hash_value': self.hash_value,
                'signature_valid': self.signature_valid,
                'status': self.status,
            },
            'notes': self.notes,
        }
