from rest_framework.views import exception_handler

from common.audit import log_audit_event
from enterprise_integrity.models import AuditLog

from .responses import error_response


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return error_response("Server error", status_code=500)

    request = context.get("request") if context else None
    user = getattr(request, "user", None)
    status_code = response.status_code
    if status_code in (401, 403):
        log_audit_event(
            request=request,
            user=user if getattr(user, "is_authenticated", False) else None,
            action="AUTH_FORBIDDEN" if status_code == 403 else "AUTH_UNAUTHORIZED",
            resource_type="auth",
            resource_id=getattr(user, "id", "") if user else "",
            details={"path": getattr(request, "path", "")},
            metadata={"path": getattr(request, "path", "")},
            severity=AuditLog.SEVERITY_WARNING,
            status=AuditLog.STATUS_FAILED,
        )

    data = response.data
    message = data.get("detail") if isinstance(data, dict) else "Request failed"
    errors = data if isinstance(data, dict) else {"detail": data}
    return error_response(message or "Request failed", errors=errors, status_code=response.status_code)
