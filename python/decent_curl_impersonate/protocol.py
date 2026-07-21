"""JSON-compatible worker protocol envelopes and secret redaction."""

from collections.abc import Mapping
from typing import Any

_REDACTED = "[REDACTED]"
_SENSITIVE_KEYS = frozenset(
    {
        "authorization",
        "cookie",
        "set-cookie",
        "proxy_password",
        "password",
        "token",
        "secret",
        "body",
    }
)


def redact(value: Any) -> Any:
    """Return a recursively redacted copy of a JSON-compatible value."""
    if isinstance(value, Mapping):
        return {
            key: _REDACTED
            if isinstance(key, str) and key.casefold() in _SENSITIVE_KEYS
            else redact(item)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def success(id: str, result: Any) -> dict[str, Any]:
    """Build a successful worker response envelope."""
    return {"id": id, "ok": True, "result": result}


def failure(
    id: str,
    code: str,
    message: str,
    retryable: bool = False,
    metadata: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a failed worker response envelope with redacted metadata."""
    error: dict[str, Any] = {
        "code": code,
        "message": message,
        "retryable": retryable,
    }
    if metadata:
        error["metadata"] = redact(metadata)
    return {"id": id, "ok": False, "error": error}
