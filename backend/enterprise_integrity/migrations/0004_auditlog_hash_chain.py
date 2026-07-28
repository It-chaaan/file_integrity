import hashlib
import json

from django.db import migrations, models


def backfill_audit_log_hashes(apps, schema_editor):
    AuditLog = apps.get_model("enterprise_integrity", "AuditLog")
    previous_hash = ""

    for log in AuditLog.objects.order_by("id"):
        payload = {
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "status": log.status,
            "severity": log.severity,
            "details": log.details,
            "metadata": log.metadata,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at.isoformat() if log.created_at else "",
            "previous_hash": previous_hash,
        }
        encoded_payload = json.dumps(payload, sort_keys=True, default=str).encode("utf-8")
        current_hash = hashlib.sha256(encoded_payload).hexdigest()
        AuditLog.objects.filter(pk=log.pk).update(previous_hash=previous_hash, log_hash=current_hash)
        previous_hash = current_hash


class Migration(migrations.Migration):

    dependencies = [
        ("enterprise_integrity", "0003_auditlog_add_status_details"),
    ]

    operations = [
        migrations.AddField(
            model_name="auditlog",
            name="log_hash",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.AddField(
            model_name="auditlog",
            name="previous_hash",
            field=models.CharField(blank=True, default="", max_length=64),
        ),
        migrations.RunPython(backfill_audit_log_hashes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="auditlog",
            name="log_hash",
            field=models.CharField(blank=True, db_index=True, default="", max_length=64, unique=True),
        ),
    ]
