import csv
import logging
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
import io
from django.http import StreamingHttpResponse
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

from common.permissions import IsAdminOrSuper
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from common.audit import log_audit_event
from enterprise_integrity.models import AuditLog
from .serializers import PasswordResetSerializer, UserCreateSerializer, UserListSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuper]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        params = request.query_params
        search = params.get("search")
        role = params.get("role")
        is_active = params.get("is_active")
        ordering = params.get("ordering")

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        if role:
            queryset = queryset.filter(role=role)

        if is_active is not None:
            queryset = queryset.filter(is_active=str(is_active).lower() == "true")

        if ordering:
            queryset = queryset.order_by(ordering)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = UserListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        return success_response(UserListSerializer(queryset, many=True).data)

    def retrieve(self, request, *args, **kwargs):
        return success_response(UserListSerializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("User create validation failed", extra={"errors": serializer.errors})
            return error_response("Validation error", errors=serializer.errors, status_code=400)
        user = serializer.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_CREATED",
            resource_type="user",
            resource_id=user.id,
            details={"username": user.username, "email": user.email},
            metadata={"username": user.username, "email": user.email},
        )
        return success_response(UserListSerializer(user).data, message="User created", status_code=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.role == "super_admin" and request.user.role != "super_admin":
            return error_response("Forbidden", errors={"detail": "Cannot modify super_admin accounts."}, status_code=403)
        serializer = UserListSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_UPDATED",
            resource_type="user",
            resource_id=instance.id,
            details={"username": instance.username},
            metadata={"username": instance.username},
        )
        return success_response(serializer.data, message="User updated")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.role == "super_admin" and request.user.role != "super_admin":
            return error_response("Forbidden", errors={"detail": "Cannot delete super_admin accounts."}, status_code=403)
        username = instance.username
        instance.delete()
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_DELETED",
            resource_type="user",
            resource_id=instance.id,
            details={"username": username},
            metadata={"username": username},
        )
        return success_response({"detail": "User deleted"})

    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if user.role == "super_admin" and request.user.role != "super_admin":
            return error_response("Forbidden", errors={"detail": "Cannot deactivate super_admin accounts."}, status_code=403)
        user.is_active = False
        user.save(update_fields=["is_active"])
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_DEACTIVATED",
            resource_type="user",
            resource_id=user.id,
            details={"username": user.username},
            metadata={"username": user.username},
        )
        return success_response(UserListSerializer(user).data, message="User deactivated")

    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        user = self.get_object()
        if user.role == "super_admin" and request.user.role != "super_admin":
            return error_response("Forbidden", errors={"detail": "Cannot activate super_admin accounts."}, status_code=403)
        user.is_active = True
        user.save(update_fields=["is_active"])
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_ACTIVATED",
            resource_type="user",
            resource_id=user.id,
            details={"username": user.username},
            metadata={"username": user.username},
        )
        return success_response(UserListSerializer(user).data, message="User activated")

    @action(detail=True, methods=["patch"], url_path="role")
    def update_role(self, request, pk=None):
        user = self.get_object()
        if user.role == "super_admin" and request.user.role != "super_admin":
            return error_response("Forbidden", errors={"detail": "Cannot modify super_admin roles."}, status_code=403)
        role = request.data.get("role")
        if role not in dict(user.ROLE_CHOICES):
            return error_response("Invalid role", errors={"role": "Invalid role"}, status_code=400)
        user.role = role
        user.save(update_fields=["role"])
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_ROLE_UPDATED",
            resource_type="user",
            resource_id=user.id,
            details={"role": role, "username": user.username},
            metadata={"role": role, "username": user.username},
        )
        return success_response(UserListSerializer(user).data, message="Role updated")

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.get_object()
        if user.role == "super_admin" and request.user.role != "super_admin":
            return error_response("Forbidden", errors={"detail": "Cannot reset super_admin passwords."}, status_code=403)
        user.set_password(serializer.validated_data["password"])
        user.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_PASSWORD_RESET",
            resource_type="user",
            resource_id=user.id,
            details={"username": user.username},
            metadata={"username": user.username},
        )
        return success_response({"detail": "Password reset."}, message="Password reset")

    @action(detail=True, methods=["get"], url_path="activity")
    def activity(self, request, pk=None):
        user = self.get_object()
        logs = AuditLog.objects.filter(user=user).order_by("-created_at")
        page = self.paginate_queryset(logs)
        if page is not None:
            data = [
                {
                    "id": log.id,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "severity": log.severity,
                    "created_at": log.created_at,
                }
                for log in page
            ]
            return self.get_paginated_response(data)
        data = [
            {
                "id": log.id,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "severity": log.severity,
                "created_at": log.created_at,
            }
            for log in logs
        ]
        return success_response(data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        aggregates = User.objects.aggregate(
            total=Count("id"),
            active=Count("id", filter=Q(is_active=True)),
        )
        by_role = User.objects.values("role").annotate(count=Count("id")).order_by("role")
        return success_response({"totals": aggregates, "by_role": list(by_role)})

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        query = request.query_params.get("q", "")
        users = User.objects.filter(
            Q(username__icontains=query)
            | Q(email__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
        )
        return success_response(UserListSerializer(users, many=True).data)

    @action(detail=False, methods=["get"], url_path="roles")
    def roles(self, request):
        roles = [{"value": value, "label": label} for value, label in User.ROLE_CHOICES]
        return success_response(roles)

    @action(detail=False, methods=["post"], url_path="bulk-update")
    def bulk_update(self, request):
        user_ids = request.data.get("user_ids", [])
        updates = request.data.get("updates", {})
        User.objects.filter(id__in=user_ids).update(**updates)
        log_audit_event(
            request=request,
            user=request.user,
            action="USER_BULK_UPDATED",
            resource_type="user",
            resource_id="bulk",
            details={"user_ids": user_ids, "updates": updates},
            metadata={"user_ids": user_ids, "updates": updates},
        )
        return success_response({"detail": "Users updated"})

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request):
        stream = str(request.query_params.get("stream", "")).lower() in {"1", "true", "yes"}
        header = ["username", "email", "role", "department", "phone", "is_active"]
        if stream:
            class Echo:
                def write(self, value):
                    return value

            writer = csv.writer(Echo())
            def row_iter():
                yield header
                for user in User.objects.all():
                    yield [user.username, user.email, user.role, user.department, user.phone, user.is_active]

            response = StreamingHttpResponse(
                (writer.writerow(row) for row in row_iter()),
                content_type="text/csv",
            )
            response["Content-Disposition"] = "attachment; filename=users.csv"
            return response

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(header)
        for user in User.objects.all():
            writer.writerow([user.username, user.email, user.role, user.department, user.phone, user.is_active])
        return success_response(
            {
                "filename": "users.csv",
                "content_type": "text/csv",
                "content": output.getvalue(),
            },
            message="Users exported",
        )
