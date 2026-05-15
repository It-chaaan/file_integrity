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

    class Meta:
        model = TicketComment
        fields = ["id", "author", "comment", "created_at", "attachments"]
        read_only_fields = ["id", "author", "created_at", "attachments"]


class TicketSerializer(serializers.ModelSerializer):
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)

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
            "assigned_to",
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
