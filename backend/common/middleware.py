import uuid

from django.utils.deprecation import MiddlewareMixin

from .request_context import clear_request_context, set_request_context


class RequestIdMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        request.request_id = request_id
        set_request_context(request_id, request.path, request.method)

    def process_response(self, request, response):
        request_id = getattr(request, "request_id", "")
        if request_id:
            response["X-Request-ID"] = request_id
        clear_request_context()
        return response

    def process_exception(self, request, exception):
        clear_request_context()
        return None
