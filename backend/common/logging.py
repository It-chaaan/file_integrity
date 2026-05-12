import json
import logging
from datetime import datetime, timezone

from .request_context import get_request_id, get_request_method, get_request_path


class RequestContextFilter(logging.Filter):
    def filter(self, record):
        record.request_id = get_request_id()
        record.request_method = get_request_method()
        record.request_path = get_request_path()
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", ""),
            "request_method": getattr(record, "request_method", ""),
            "request_path": getattr(record, "request_path", ""),
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)
