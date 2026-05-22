"""
Serializers for Performance Metrics

Serializes PerformanceMetrics model for API responses.
"""

from rest_framework import serializers
from .performance_metrics_model import PerformanceMetrics


class PerformanceMetricsSerializer(serializers.ModelSerializer):
    """Serialize performance metrics with detailed breakdown."""
    
    user_name = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    operation_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    
    class Meta:
        model = PerformanceMetrics
        fields = [
            'id',
            'filename',
            'file_size_mb',
            'operation_type',
            'operation_display',
            'user',
            'user_name',
            'created_at',
            'cpu_process_percent',
            'cpu_system_percent',
            'cpu_threads',
            'cpu_user_time_ms',
            'cpu_system_time_ms',
            'memory_before_mb',
            'memory_after_mb',
            'memory_delta_mb',
            'memory_percent',
            'system_cpu_percent',
            'system_memory_percent',
            'gpu_available',
            'gpu_data',
            'elapsed_ms',
            'throughput_mbs',
            'hash_value',
            'signature_valid',
            'status',
            'notes',
        ]
        read_only_fields = fields


class PerformanceMetricsListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list view (less data)."""
    
    user_name = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    operation_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    
    class Meta:
        model = PerformanceMetrics
        fields = [
            'id',
            'filename',
            'file_size_mb',
            'operation_type',
            'operation_display',
            'user_name',
            'created_at',
            'cpu_process_percent',
            'memory_delta_mb',
            'elapsed_ms',
            'throughput_mbs',
            'status',
        ]
        read_only_fields = fields


class PerformanceMetricsStatsSerializer(serializers.Serializer):
    """Statistics aggregated from multiple metrics."""
    
    total_operations = serializers.IntegerField()
    avg_elapsed_ms = serializers.FloatField()
    avg_cpu_percent = serializers.FloatField()
    avg_memory_delta_mb = serializers.FloatField()
    avg_throughput_mbs = serializers.FloatField()
    total_file_size_mb = serializers.FloatField()
    operation_breakdown = serializers.DictField()
