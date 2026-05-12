from enterprise_integrity.models import AuditLog


def log_audit_event(
    *,
    request=None,
    user=None,
    action,
    resource_type,
    resource_id="",
    details=None,
    metadata=None,
    severity=None,
    status=None,
):
    details = details or metadata or {}
    metadata = metadata or details
    ip_address = ""
    user_agent = ""
    if request is not None:
        ip_address = request.META.get("REMOTE_ADDR", "")
        user_agent = request.META.get("HTTP_USER_AGENT", "")
    AuditLog.objects.create(
        user=user,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id or ""),
        details=details,
        metadata=metadata,
        ip_address=ip_address,
        user_agent=user_agent,
        severity=severity or AuditLog.SEVERITY_INFO,
        status=status or AuditLog.STATUS_SUCCESS,
    )
