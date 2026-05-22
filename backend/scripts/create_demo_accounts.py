import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django

django.setup()

from django.contrib.auth import get_user_model


def run():
    User = get_user_model()

    admin_user, _ = User.objects.get_or_create(
        username="admin123",
        defaults={
            "email": "admin123@example.com",
            "role": User.ROLE_ADMIN,
            "is_staff": True,
            "is_superuser": True,
        },
    )
    admin_user.set_password("admin123")
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()

    staff_user, _ = User.objects.get_or_create(
        username="staff123",
        defaults={
            "email": "staff123@example.com",
            "role": User.ROLE_STAFF,
            "is_staff": True,
        },
    )
    staff_user.set_password("staf123")
    staff_user.is_staff = True
    staff_user.save()

    print("Created or updated demo accounts:")
    print("  admin123 / admin123")
    print("  staff123 / staf123")


if __name__ == "__main__":
    run()
