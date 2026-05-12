from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import TicketAttachment, TicketCommentAttachment


@receiver(post_delete, sender=TicketAttachment)
def delete_ticket_attachment(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)


@receiver(post_delete, sender=TicketCommentAttachment)
def delete_ticket_comment_attachment(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)


@receiver(pre_save, sender=TicketAttachment)
def replace_ticket_attachment(sender, instance, **kwargs):
    if not instance.pk:
        return
    previous = TicketAttachment.objects.filter(pk=instance.pk).first()
    if previous and previous.file and previous.file != instance.file:
        previous.file.delete(save=False)


@receiver(pre_save, sender=TicketCommentAttachment)
def replace_ticket_comment_attachment(sender, instance, **kwargs):
    if not instance.pk:
        return
    previous = TicketCommentAttachment.objects.filter(pk=instance.pk).first()
    if previous and previous.file and previous.file != instance.file:
        previous.file.delete(save=False)
