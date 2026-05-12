from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import User


@receiver(post_delete, sender=User)
def delete_profile_photo(sender, instance, **kwargs):
    if instance.profile_photo:
        instance.profile_photo.delete(save=False)


@receiver(pre_save, sender=User)
def replace_profile_photo(sender, instance, **kwargs):
    if not instance.pk:
        return
    previous = User.objects.filter(pk=instance.pk).first()
    if previous and previous.profile_photo and previous.profile_photo != instance.profile_photo:
        previous.profile_photo.delete(save=False)
