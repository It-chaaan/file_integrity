"""
URL Configuration for Performance Metrics API

Add this to your Django URL configuration.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .performance_metrics_views import PerformanceMetricsViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'performance-metrics', PerformanceMetricsViewSet, basename='performance-metrics')

# Include router URLs
urlpatterns = [
    path('api/', include(router.urls)),
]

# Available endpoints:
# GET    /api/performance-metrics/              - List all metrics
# GET    /api/performance-metrics/{id}/         - Retrieve specific metric
# GET    /api/performance-metrics/summary/      - Summary statistics
# GET    /api/performance-metrics/by_operation/ - Stats grouped by operation
# GET    /api/performance-metrics/by_user/      - Stats grouped by user
# GET    /api/performance-metrics/by_date/      - Stats grouped by date
# GET    /api/performance-metrics/export/       - Export metrics (CSV or JSON)
# POST   /api/performance-metrics/{id}/add_note/ - Add note to metric
