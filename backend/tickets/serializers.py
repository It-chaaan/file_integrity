from rest_framework import serializers

from .models import Ticket, TicketAttachment, TicketComment, TicketCommentAttachment


class TicketAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAttachment
        fields = ["id", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class TicketCommentAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCommentAttachment
        fields = ["id", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class TicketCommentSerializer(serializers.ModelSerializer):
    attachments = TicketCommentAttachmentSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()

    class Meta:
        model = TicketComment
        fields = ["id", "author", "author_name", "author_role", "comment", "created_at", "attachments"]
        read_only_fields = ["id", "author", "author_name", "author_role", "created_at", "attachments"]

    def get_author_name(self, obj):
        user = getattr(obj, "author", None)
        if not user:
            return "System"
        full_name = " ".join(filter(None, [getattr(user, "first_name", ""), getattr(user, "last_name", "")])).strip()
        return full_name or getattr(user, "username", "") or getattr(user, "email", "") or "User"

    def get_author_role(self, obj):
        user = getattr(obj, "author", None)
        if not user:
            return ""
        return getattr(user, "role", "") or ""


class TicketSerializer(serializers.ModelSerializer):
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_number",
            "title",
            "description",
            "requester_name",
            "requester_email",
            "category",
            "priority",
            "status",
            "created_by",
            "created_by_name",
            "assigned_to",
            "assigned_to_name",
            "internal_notes",
            "created_at",
            "updated_at",
            "closed_at",
            "attachments",
            "comments",
        ]
        read_only_fields = [
            "id",
            "ticket_number",
            "created_by",
            "created_at",
            "updated_at",
            "closed_at",
            "attachments",
            "comments",
        ]

    def get_created_by_name(self, obj):
        user = getattr(obj, "created_by", None)
        if not user:
            return ""
        full_name = " ".join(filter(None, [getattr(user, "first_name", ""), getattr(user, "last_name", "")])).strip()
        return full_name or getattr(user, "username", "") or getattr(user, "email", "")

    def get_assigned_to_name(self, obj):
        user = getattr(obj, "assigned_to", None)
        if not user:
            return ""
        full_name = " ".join(filter(None, [getattr(user, "first_name", ""), getattr(user, "last_name", "")])).strip()
        return full_name or getattr(user, "username", "") or getattr(user, "email", "")
