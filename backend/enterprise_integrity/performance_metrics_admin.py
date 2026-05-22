"""
Django Admin Integration for Performance Metrics

Makes PerformanceMetrics easily manageable from Django admin.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Avg, Count
from .performance_metrics_model import PerformanceMetrics


@admin.register(PerformanceMetrics)
class PerformanceMetricsAdmin(admin.ModelAdmin):
    """Admin interface for Performance Metrics."""
    
    list_display = [
        'filename_link',
        'operation_type_badge',
        'user_link',
        'created_at_formatted',
        'elapsed_ms_badge',
        'cpu_percent_badge',
        'memory_delta_badge',
        'throughput_badge',
        'status_badge',
    ]
    
    list_filter = [
        'operation_type',
        'status',
        'gpu_available',
        'created_at',
        'user',
    ]
    
    search_fields = [
        'filename',
        'user__username',
        'hash_value',
    ]
    
    readonly_fields = [
        'filename',
        'file_size_mb',
        'operation_type',
        'user',
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
        'metrics_visualization',
    ]
    
    fieldsets = (
        ('Operation Information', {
            'fields': (
                'filename',
                'file_size_mb',
                'operation_type',
                'user',
                'created_at',
                'status',
            )
        }),
        ('CPU Metrics', {
            'fields': (
                'cpu_process_percent',
                'cpu_system_percent',
                'cpu_threads',
                'cpu_user_time_ms',
                'cpu_system_time_ms',
            )
        }),
        ('Memory Metrics', {
            'fields': (
                'memory_before_mb',
                'memory_after_mb',
                'memory_delta_mb',
                'memory_percent',
            )
        }),
        ('System Metrics', {
            'fields': (
                'system_cpu_percent',
                'system_memory_percent',
            )
        }),
        ('GPU Metrics', {
            'fields': (
                'gpu_available',
                'gpu_data',
            ),
            'classes': ('collapse',)
        }),
        ('Execution Metrics', {
            'fields': (
                'elapsed_ms',
                'throughput_mbs',
            )
        }),
        ('Results', {
            'fields': (
                'hash_value',
                'signature_valid',
            )
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )
    
    def filename_link(self, obj):
        """Display filename as link."""
        return format_html(
            '<a href="?filename={}">{}</a>',
            obj.filename,
            obj.filename[:50]
        )
    filename_link.short_description = 'Filename'
    
    def operation_type_badge(self, obj):
        """Display operation type as colored badge."""
        colors = {
            'hash': '#0066cc',
            'keygen': '#009900',
            'sign': '#ff6600',
            'verify': '#0099cc',
            'workflow': '#9900ff',
        }
        color = colors.get(obj.operation_type, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_operation_type_display()
        )
    operation_type_badge.short_description = 'Operation'
    
    def user_link(self, obj):
        """Display user as link."""
        if obj.user:
            return format_html(
                '<a href="?user__id__exact={}">{}</a>',
                obj.user.id,
                obj.user.username
            )
        return 'Anonymous'
    user_link.short_description = 'User'
    
    def created_at_formatted(self, obj):
        """Format creation timestamp."""
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')
    created_at_formatted.short_description = 'Created'
    
    def elapsed_ms_badge(self, obj):
        """Display execution time with color coding."""
        ms = obj.elapsed_ms
        if ms < 10:
            color = '#00cc00'  # Green - very fast
        elif ms < 100:
            color = '#0099cc'  # Blue - fast
        elif ms < 1000:
            color = '#ffaa00'  # Orange - moderate
        else:
            color = '#cc0000'  # Red - slow
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{:.2f}ms</span>',
            color,
            ms
        )
    elapsed_ms_badge.short_description = 'Time'
    
    def cpu_percent_badge(self, obj):
        """Display CPU percentage with color coding."""
        cpu = obj.cpu_process_percent
        if cpu < 10:
            color = '#00cc00'
        elif cpu < 50:
            color = '#0099cc'
        elif cpu < 80:
            color = '#ffaa00'
        else:
            color = '#cc0000'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{:.1f}%</span>',
            color,
            cpu
        )
    cpu_percent_badge.short_description = 'CPU %'
    
    def memory_delta_badge(self, obj):
        """Display memory change."""
        delta = obj.memory_delta_mb
        icon = '📈' if delta > 0 else '📉'
        return format_html(
            '{} {:.2f}MB',
            icon,
            delta
        )
    memory_delta_badge.short_description = 'Memory Δ'
    
    def throughput_badge(self, obj):
        """Display throughput if available."""
        if obj.throughput_mbs:
            return format_html(
                '{:.2f} MB/s',
                obj.throughput_mbs
            )
        return '-'
    throughput_badge.short_description = 'Throughput'
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'completed': '#00cc00',
            'valid': '#00cc00',
            'invalid': '#cc0000',
            'failed': '#cc0000',
            'verified': '#00cc00',
        }
        color = colors.get(obj.status, '#666666')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.status.upper()
        )
    status_badge.short_description = 'Status'
    
    def metrics_visualization(self, obj):
        """Display metrics as formatted table."""
        html = '<table style="width: 100%; border-collapse: collapse;">'
        
        # CPU Section
        html += '<tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 8px; text-align: left;">CPU Metrics</th></tr>'
        html += f'<tr><td style="padding: 5px;">Process CPU</td><td style="padding: 5px;"><strong>{obj.cpu_process_percent:.2f}%</strong></td></tr>'
        html += f'<tr><td style="padding: 5px;">System CPU</td><td style="padding: 5px;"><strong>{obj.cpu_system_percent:.2f}%</strong></td></tr>'
        html += f'<tr><td style="padding: 5px;">Threads</td><td style="padding: 5px;"><strong>{obj.cpu_threads}</strong></td></tr>'
        
        # Memory Section
        html += '<tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 8px; text-align: left;">Memory Metrics</th></tr>'
        html += f'<tr><td style="padding: 5px;">Before</td><td style="padding: 5px;"><strong>{obj.memory_before_mb:.2f}MB</strong></td></tr>'
        html += f'<tr><td style="padding: 5px;">After</td><td style="padding: 5px;"><strong>{obj.memory_after_mb:.2f}MB</strong></td></tr>'
        html += f'<tr><td style="padding: 5px;">Delta</td><td style="padding: 5px;"><strong>{obj.memory_delta_mb:.2f}MB</strong></td></tr>'
        
        # Execution Section
        html += '<tr style="background-color: #f0f0f0;"><th colspan="2" style="padding: 8px; text-align: left;">Execution Metrics</th></tr>'
        html += f'<tr><td style="padding: 5px;">Elapsed Time</td><td style="padding: 5px;"><strong>{obj.elapsed_ms:.2f}ms</strong></td></tr>'
        if obj.throughput_mbs:
            html += f'<tr><td style="padding: 5px;">Throughput</td><td style="padding: 5px;"><strong>{obj.throughput_mbs:.2f}MB/s</strong></td></tr>'
        
        html += '</table>'
        
        return format_html(html)
    metrics_visualization.short_description = 'Detailed Metrics'
    
    def has_add_permission(self, request):
        """Prevent manual addition of metrics (only via monitoring system)."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion only for staff."""
        return request.user.is_staff
    
    actions = ['export_as_csv', 'export_as_json']
    
    def export_as_csv(self, request, queryset):
        """Export selected metrics as CSV."""
        import csv
        from django.http import HttpResponse
        
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
    export_as_csv.short_description = 'Export selected as CSV'
    
    def export_as_json(self, request, queryset):
        """Export selected metrics as JSON."""
        import json
        from django.http import HttpResponse
        
        data = []
        for metric in queryset:
            data.append(metric.to_dict())
        
        response = HttpResponse(
            json.dumps(data, indent=2, default=str),
            content_type='application/json'
        )
        response['Content-Disposition'] = 'attachment; filename="performance_metrics.json"'
        
        return response
    export_as_json.short_description = 'Export selected as JSON'
