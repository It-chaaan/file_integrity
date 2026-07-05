from django.conf import settings


def _normalize_ip(value: str) -> str:
    return (value or "").strip()


def get_client_ip(request) -> str:
    if request is None:
        return ""

    trust_proxy_headers = getattr(settings, "TRUST_PROXY_HEADERS", True)
    if trust_proxy_headers:
        forwarded_for = _normalize_ip(request.META.get("HTTP_X_FORWARDED_FOR", ""))
        if forwarded_for:
            first_ip = forwarded_for.split(",")[0].strip()
            if first_ip:
                return first_ip

        real_ip = _normalize_ip(request.META.get("HTTP_X_REAL_IP", ""))
        if real_ip:
            return real_ip

    return _normalize_ip(request.META.get("REMOTE_ADDR", ""))
