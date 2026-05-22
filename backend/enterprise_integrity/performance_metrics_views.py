"""
API Views for Performance Metrics

Provides endpoints to retrieve, filter, and analyze performance metrics.
"""

from django.db.models import Avg, Count, Sum, Q
from django.utils import timezone
from django.views.generic import ListView
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from datetime import timedelta

from .performance_metrics_model import PerformanceMetrics
from .performance_metrics_serializers import (
    PerformanceMetricsSerializer,
    PerformanceMetricsListSerializer,
    PerformanceMetricsStatsSerializer,
)


class PerformanceMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving and analyzing performance metrics.
    
    Endpoints:
    - GET /api/metrics/ - List all metrics with pagination
    - GET /api/metrics/{id}/ - Retrieve specific metric detail
    - GET /api/metrics/stats/summary/ - Get aggregated statistics
    - GET /api/metrics/stats/by-operation/ - Stats grouped by operation type
    - GET /api/metrics/stats/by-user/ - Stats grouped by user
    - GET /api/metrics/stats/by-date/ - Stats grouped by date
    """
    
    queryset = PerformanceMetrics.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ['operation_type', 'status', 'user', 'filename']
    search_fields = ['filename', 'user__username']
    ordering_fields = ['-created_at', 'elapsed_ms', 'file_size_mb']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use different serializer for list vs detail."""
        if self.action == 'list':
            return PerformanceMetricsListSerializer
        return PerformanceMetricsSerializer
    
    def get_queryset(self):
        """Filter by user if not admin."""
        queryset = PerformanceMetrics.objects.all()
        
        # Filter by user if they're not staff
        if self.request.user and not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by date range if provided
        days = self.request.query_params.get('days', None)
        if days:
            try:
                days = int(days)
                start_date = timezone.now() - timedelta(days=days)
                queryset = queryset.filter(created_at__gte=start_date)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get summary statistics of all metrics.
        
        Returns:
        - total_operations: Count of all operations
        - avg_elapsed_ms: Average execution time
        - avg_cpu_percent: Average CPU usage
        - avg_memory_delta_mb: Average memory change
        - avg_throughput_mbs: Average throughput (if applicable)
        - total_file_size_mb: Total size of all files processed
        """
        queryset = self.get_queryset()
        
        stats = queryset.aggregate(
            total_operations=Count('id'),
            avg_elapsed_ms=Avg('elapsed_ms'),
            avg_cpu_percent=Avg('cpu_process_percent'),
            avg_memory_delta_mb=Avg('memory_delta_mb'),
            avg_throughput_mbs=Avg('throughput_mbs'),
            total_file_size_mb=Sum('file_size_mb'),
        )
        
        # Round to 2 decimals
        for key in ['avg_elapsed_ms', 'avg_cpu_percent', 'avg_memory_delta_mb', 'avg_throughput_mbs', 'total_file_size_mb']:
            if stats[key] is not None:
                stats[key] = round(stats[key], 2)
        
        serializer = PerformanceMetricsStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_operation(self, request):
        """
        Get statistics grouped by operation type.
        
        Returns breakdown of metrics for each operation type.
        """
        queryset = self.get_queryset()
        
        operation_stats = {}
        for op_type, op_label in PerformanceMetrics.OPERATION_CHOICES:
            op_queryset = queryset.filter(operation_type=op_type)
            
            stats = op_queryset.aggregate(
                count=Count('id'),
                avg_elapsed_ms=Avg('elapsed_ms'),
                avg_cpu_percent=Avg('cpu_process_percent'),
                avg_memory_delta_mb=Avg('memory_delta_mb'),
                avg_throughput_mbs=Avg('throughput_mbs'),
                total_file_size_mb=Sum('file_size_mb'),
            )
            
            # Round to 2 decimals
            for key in stats:
                if isinstance(stats[key], float):
                    stats[key] = round(stats[key], 2)
            
            operation_stats[op_label] = stats
        
        return Response(operation_stats)
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """
        Get statistics grouped by user.
        
        Returns breakdown of metrics for each user.
        """
        queryset = self.get_queryset()
        
        user_stats = {}
        for user in queryset.values_list('user__username', flat=True).distinct():
            user_queryset = queryset.filter(user__username=user)
            
            stats = user_queryset.aggregate(
                count=Count('id'),
                avg_elapsed_ms=Avg('elapsed_ms'),
                avg_cpu_percent=Avg('cpu_process_percent'),
                avg_memory_delta_mb=Avg('memory_delta_mb'),
                avg_throughput_mbs=Avg('throughput_mbs'),
                total_file_size_mb=Sum('file_size_mb'),
            )
            
            # Round to 2 decimals
            for key in stats:
                if isinstance(stats[key], float):
                    stats[key] = round(stats[key], 2)
            
            user_stats[user or 'Anonymous'] = stats
        
        return Response(user_stats)
    
    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """
        Get statistics grouped by date.
        
        Returns breakdown of metrics per day (or custom interval).
        """
        queryset = self.get_queryset()
        
        date_stats = {}
        for metric in queryset.order_by('created_at'):
            date_key = metric.created_at.date().isoformat()
            
            if date_key not in date_stats:
                date_stats[date_key] = {
                    'count': 0,
                    'total_elapsed_ms': 0,
                    'avg_cpu_percent': 0,
                    'total_file_size_mb': 0,
                }
            
            date_stats[date_key]['count'] += 1
            date_stats[date_key]['total_elapsed_ms'] += metric.elapsed_ms
            date_stats[date_key]['avg_cpu_percent'] += metric.cpu_process_percent
            date_stats[date_key]['total_file_size_mb'] += metric.file_size_mb
        
        # Calculate averages
        for date_key in date_stats:
            count = date_stats[date_key]['count']
            date_stats[date_key]['avg_cpu_percent'] = round(date_stats[date_key]['avg_cpu_percent'] / count, 2)
            date_stats[date_key]['avg_elapsed_ms'] = round(date_stats[date_key]['total_elapsed_ms'] / count, 2)
            date_stats[date_key]['total_file_size_mb'] = round(date_stats[date_key]['total_file_size_mb'], 2)
        
        return Response(date_stats)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export metrics as CSV or JSON.
        
        Query params:
        - format: 'csv' or 'json' (default: json)
        """
        import csv
        from django.http import HttpResponse
        import json
        
        queryset = self.get_queryset()
        format_type = request.query_params.get('format', 'json')
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="performance_metrics.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'Filename', 'Operation', 'User', 'Date', 'Time (ms)', 
                'CPU %', 'Memory Delta (MB)', 'Throughput (MB/s)', 'Status'
            ])
            
            for metric in queryset:
                writer.writerow([
                    metric.filename,
                    metric.get_operation_type_display(),
                    metric.user.username if metric.user else 'Anonymous',
                    metric.created_at.isoformat(),
                    metric.elapsed_ms,
                    metric.cpu_process_percent,
                    metric.memory_delta_mb,
                    metric.throughput_mbs or 'N/A',
                    metric.status,
                ])
            
            return response
        
        else:  # JSON
            data = [PerformanceMetricsSerializer(m).data for m in queryset]
            response = HttpResponse(
                json.dumps(data, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = 'attachment; filename="performance_metrics.json"'
            return response
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add or update notes on a specific metric."""
        metric = self.get_object()
        
        if metric.user and metric.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to edit this metric.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        note = request.data.get('note', '')
        metric.notes = (metric.notes or '') + f"\n[{timezone.now().isoformat()}] {note}"
        metric.save()
        
        return Response({'status': 'Note added'})
