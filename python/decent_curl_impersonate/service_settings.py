"""Shared settings for the loopback decent-curl service."""

from __future__ import annotations

from collections.abc import Mapping
from urllib.parse import urlsplit

HOST = "127.0.0.1"
DEFAULT_PORT = 8765


def validate_port(raw_port: str | int | None) -> int:
    """Return one valid TCP port or raise a stable configuration error."""
    if raw_port is None:
        return DEFAULT_PORT
    try:
        port = int(raw_port)
    except (TypeError, ValueError):
        raise ValueError(
            "DECENT_CURL_HTTP_PORT must be an integer from 1 to 65535"
        ) from None
    if isinstance(raw_port, bool) or not 1 <= port <= 65535:
        raise ValueError("DECENT_CURL_HTTP_PORT must be an integer from 1 to 65535")
    return port


def settings_from_environment(environment: Mapping[str, str]) -> tuple[str, int]:
    """Read service settings while keeping the bind address loopback-only."""
    requested_host = environment.get("DECENT_CURL_HTTP_HOST", HOST)
    if requested_host != HOST:
        raise ValueError(f"HTTP service host must be {HOST}")
    return HOST, validate_port(environment.get("DECENT_CURL_HTTP_PORT"))


def service_urls(port: int) -> tuple[str, str]:
    """Derive the MCP and health URLs from one validated port."""
    validated_port = validate_port(port)
    base_url = f"http://{HOST}:{validated_port}"
    return f"{base_url}/mcp", f"{base_url}/healthz"


def effective_mcp_url(environment: Mapping[str, str]) -> str:
    """Return the explicit full URL override or the selected-port default."""
    override = environment.get("DECENT_CURL_MCP_URL")
    if override is not None:
        parsed = urlsplit(override)
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.netloc
            or parsed.username is not None
            or parsed.password is not None
            or parsed.fragment
        ):
            raise ValueError("DECENT_CURL_MCP_URL must be a full HTTP or HTTPS URL")
        return override
    port = validate_port(environment.get("DECENT_CURL_HTTP_PORT"))
    return service_urls(port)[0]
