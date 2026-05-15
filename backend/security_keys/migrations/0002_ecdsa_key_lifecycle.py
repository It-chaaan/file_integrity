# Generated migration for ECDSA key lifecycle management

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("security_keys", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="securitykey",
            name="algorithm",
            field=models.CharField(
                choices=[("sha256", "SHA-256"), ("ecdsa_p256", "ECDSA P-256")],
                default="ecdsa_p256",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="key_type",
            field=models.CharField(
                choices=[("signing", "Signing"), ("verification", "Verification")],
                default="signing",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="private_key",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="status",
            field=models.CharField(
                choices=[
                    ("active", "Active"),
                    ("rotated", "Rotated"),
                    ("revoked", "Revoked"),
                ],
                db_index=True,
                default="active",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="expires_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="rotation_reason",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="rotated_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="rotated_keys",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="securitykey",
            name="rotated_from",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="rotations",
                to="security_keys.securitykey",
            ),
        ),
        migrations.AlterField(
            model_name="securitykey",
            name="fingerprint",
            field=models.CharField(db_index=True, max_length=64),
        ),
        migrations.AddIndex(
            model_name="securitykey",
            index=models.Index(
                fields=["algorithm", "status"],
                name="security_keys_algorithm_status_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="securitykey",
            index=models.Index(
                fields=["algorithm", "key_type", "status"],
                name="security_keys_algo_type_status_idx",
            ),
        ),
    ]
