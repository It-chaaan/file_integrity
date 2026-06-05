from django.db.models import Count, Q
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.viewsets import ModelViewSet

from common.permissions import IsStaffOrAdmin, IsStaffOrAdminOrClient
from common.responses import success_response, error_response
from common.pagination import StandardResultsSetPagination
from common.audit import log_audit_event
from accounts.models import User
from .models import Ticket, TicketAttachment, TicketComment, TicketCommentAttachment
from .serializers import TicketCommentSerializer, TicketSerializer


class TicketViewSet(ModelViewSet):
    queryset = Ticket.objects.all().order_by("-created_at")
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffOrAdminOrClient]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = StandardResultsSetPagination

    @staticmethod
    def _is_staff_like(user):
        return bool(user and getattr(user, "role", "") in {User.ROLE_STAFF, User.ROLE_ADMIN, User.ROLE_SUPER_ADMIN})

    @staticmethod
    def _is_client_like(user):
        return bool(user and getattr(user, "role", "") == User.ROLE_CLIENT)

    def get_permissions(self):
        staff_only_actions = {
            "update",
            "partial_update",
            "destroy",
            "update_status",
            "assign",
            "close",
            "reopen",
            "stats",
            "categories",
        }
        if self.action == "create":
            return [permissions.AllowAny()]
        if self.action in staff_only_actions:
            return [permissions.IsAuthenticated(), IsStaffOrAdmin()]
        return [permissions.IsAuthenticated(), IsStaffOrAdminOrClient()]

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        if getattr(self.request, "user", None) and self.request.user.is_authenticated:
            if self.request.user.role == "client":
                queryset = queryset.filter(created_by=self.request.user)
            elif self.request.user.role not in {"staff", "admin", "super_admin"}:
                return queryset.none()

        search = params.get("search")
        status_value = params.get("status")
        priority = params.get("priority")
        category = params.get("category")
        assigned_to = params.get("assigned_to")
        created_by = params.get("created_by")
        ordering = params.get("ordering")

        if search:
            queryset = queryset.filter(
                Q(ticket_number__icontains=search)
                | Q(title__icontains=search)
                | Q(description__icontains=search)
            )

        if status_value:
            queryset = queryset.filter(status=status_value)
        if priority:
            queryset = queryset.filter(priority=priority)
        if category:
            queryset = queryset.filter(category=category)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        if created_by:
            queryset = queryset.filter(created_by_id=created_by)

        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return success_response(self.get_serializer(self.get_queryset(), many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        created_by = request.user if getattr(request, "user", None) and request.user.is_authenticated else None

        ticket = serializer.save(
            created_by=created_by,
            ticket_number=Ticket.generate_ticket_number(),
        )

        for upload in request.FILES.getlist("attachments"):
            TicketAttachment.objects.create(ticket=ticket, file=upload)

        log_audit_event(
            request=request,
            user=created_by,
            action="TICKET_CREATED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={
                "ticket_number": ticket.ticket_number,
                "requester_name": ticket.requester_name,
                "requester_email": ticket.requester_email,
            },
            metadata={
                "ticket_number": ticket.ticket_number,
                "requester_name": ticket.requester_name,
                "requester_email": ticket.requester_email,
            },
        )

        recipients = list(
            User.objects.filter(
                is_active=True,
                role__in={User.ROLE_SUPER_ADMIN, User.ROLE_ADMIN, User.ROLE_STAFF},
            )
            .exclude(email="")
            .values_list("email", flat=True)
            .distinct()
        )
        if recipients:
            reporter_label = ticket.requester_name or ticket.requester_email or "Anonymous reporter"
            subject = f"New ticket received: {ticket.ticket_number}"
            body = "\n".join(
                [
                    f"Ticket: {ticket.ticket_number}",
                    f"Title: {ticket.title}",
                    f"Category: {ticket.category}",
                    f"Priority: {ticket.priority}",
                    f"Reporter: {reporter_label}",
                    f"Email: {ticket.requester_email or 'N/A'}",
                    "",
                    ticket.description,
                ]
            )
            send_mail(
                subject=subject,
                message=body,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None) or "no-reply@example.com",
                recipient_list=recipients,
                fail_silently=True,
            )

        return success_response(self.get_serializer(ticket).data, message="Ticket created", status_code=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        return success_response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_UPDATED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={"ticket_number": ticket.ticket_number},
            metadata={"ticket_number": ticket.ticket_number},
        )
        return success_response(self.get_serializer(ticket).data, message="Ticket updated")

    def destroy(self, request, *args, **kwargs):
        ticket = self.get_object()
        ticket_id = ticket.id
        ticket_number = ticket.ticket_number
        ticket.delete()
        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_DELETED",
            resource_type="ticket",
            resource_id=ticket_id,
            details={"ticket_number": ticket_number},
            metadata={"ticket_number": ticket_number},
        )
        return success_response({"detail": "Ticket deleted"})

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        status_value = request.data.get("status")
        if status_value not in dict(Ticket.STATUS_CHOICES):
            return error_response("Invalid status", errors={"status": "Invalid status"}, status_code=400)

        ticket.status = status_value
        if status_value in (Ticket.STATUS_RESOLVED, Ticket.STATUS_CLOSED):
            ticket.closed_at = timezone.now()
        ticket.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_STATUS_UPDATED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={"status": status_value, "ticket_number": ticket.ticket_number},
            metadata={"status": status_value, "ticket_number": ticket.ticket_number},
        )
        return success_response(self.get_serializer(ticket).data, message="Status updated")

    @action(detail=True, methods=["patch"], url_path="assign", permission_classes=[permissions.IsAuthenticated, IsStaffOrAdmin])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        assigned_to_id = request.data.get("assigned_to")
        ticket.assigned_to_id = assigned_to_id
        ticket.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_ASSIGNED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={"assigned_to": assigned_to_id, "ticket_number": ticket.ticket_number},
            metadata={"assigned_to": assigned_to_id, "ticket_number": ticket.ticket_number},
        )
        return success_response(self.get_serializer(ticket).data, message="Ticket assigned")

    @action(detail=True, methods=["get", "post"], url_path="comments")
    def comments(self, request, pk=None):
        ticket = self.get_object()

        if request.method.lower() == "get":
            data = TicketCommentSerializer(ticket.comments.all().order_by("-created_at"), many=True).data
            return success_response(data)

        comment_text = request.data.get("comment", "")
        if not comment_text:
            return error_response("Comment is required", errors={"comment": "Comment is required"}, status_code=400)

        comment = TicketComment.objects.create(ticket=ticket, author=request.user, comment=comment_text)

        for upload in request.FILES.getlist("attachments"):
            TicketCommentAttachment.objects.create(comment=comment, file=upload)

        requested_status = request.data.get("status", "").strip()
        updated_status = None
        if requested_status:
            if requested_status not in dict(Ticket.STATUS_CHOICES):
                return error_response("Invalid status", errors={"status": "Invalid status"}, status_code=400)
            if not self._is_staff_like(request.user):
                return error_response("Only staff can set ticket status from replies.", status_code=403)
            updated_status = requested_status
        elif self._is_client_like(request.user) and ticket.status == Ticket.STATUS_WAITING:
            updated_status = Ticket.STATUS_IN_PROGRESS

        if updated_status:
            ticket.status = updated_status
            if updated_status in (Ticket.STATUS_RESOLVED, Ticket.STATUS_CLOSED):
                ticket.closed_at = timezone.now()
            else:
                ticket.closed_at = None
            ticket.save(update_fields=["status", "closed_at", "updated_at"])

        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_COMMENT_ADDED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={"ticket_number": ticket.ticket_number, "comment_id": comment.id, "status": updated_status or ticket.status},
            metadata={"ticket_number": ticket.ticket_number, "comment_id": comment.id, "status": updated_status or ticket.status},
        )

        return success_response(TicketCommentSerializer(comment).data, message="Comment added", status_code=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="close")
    def close(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = Ticket.STATUS_CLOSED
        ticket.closed_at = timezone.now()
        ticket.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_CLOSED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={"ticket_number": ticket.ticket_number},
            metadata={"ticket_number": ticket.ticket_number},
        )
        return success_response(self.get_serializer(ticket).data, message="Ticket closed")

    @action(detail=True, methods=["post"], url_path="reopen")
    def reopen(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = Ticket.STATUS_OPEN
        ticket.closed_at = None
        ticket.save()
        log_audit_event(
            request=request,
            user=request.user,
            action="TICKET_REOPENED",
            resource_type="ticket",
            resource_id=ticket.id,
            details={"ticket_number": ticket.ticket_number},
            metadata={"ticket_number": ticket.ticket_number},
        )
        return success_response(self.get_serializer(ticket).data, message="Ticket reopened")

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        aggregates = Ticket.objects.aggregate(
            total=Count("id"),
            open=Count("id", filter=Q(status=Ticket.STATUS_OPEN)),
            in_progress=Count("id", filter=Q(status=Ticket.STATUS_IN_PROGRESS)),
            resolved=Count("id", filter=Q(status=Ticket.STATUS_RESOLVED)),
            closed=Count("id", filter=Q(status=Ticket.STATUS_CLOSED)),
        )
        return success_response(aggregates)

    @action(detail=False, methods=["get"], url_path="categories")
    def categories(self, request):
        return success_response([choice[0] for choice in Ticket.CATEGORY_CHOICES])

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        query = request.query_params.get("q", "")
        results = self.get_queryset().filter(
            Q(ticket_number__icontains=query) | Q(title__icontains=query)
        ).order_by("-created_at")
        return success_response(TicketSerializer(results, many=True).data)
