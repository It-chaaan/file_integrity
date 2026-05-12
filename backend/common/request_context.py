from contextvars import ContextVar

_request_id = ContextVar("request_id", default="")
_request_path = ContextVar("request_path", default="")
_request_method = ContextVar("request_method", default="")


def set_request_context(request_id: str, path: str, method: str) -> None:
    _request_id.set(request_id or "")
    _request_path.set(path or "")
    _request_method.set(method or "")


def clear_request_context() -> None:
    _request_id.set("")
    _request_path.set("")
    _request_method.set("")


def get_request_id() -> str:
    return _request_id.get()


def get_request_path() -> str:
    return _request_path.get()


def get_request_method() -> str:
    return _request_method.get()
