from django.urls import path, include

urlpatterns = [
    path("api/", include("enterprise_integrity.urls")),
]
