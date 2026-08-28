"""Loopback-only Streamable HTTP service for decent-curl."""

from __future__ import annotations

from collections.abc import Mapping
from contextlib import asynccontextmanager
from logging import Logger
from logging.handlers import RotatingFileHandler
import logging
import os
from pathlib import Path
import sys
from typing import Any

import mcp.types as types
from mcp.server.lowlevel import Server
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.routing import Route
import uvicorn

from .engine import CurlEngine
from .mcp_server import (
    SERVER_INSTRUCTIONS,
    SERVER_NAME,
    SERVER_VERSION,
    _call_tool,
    _public_tools,
)

HOST = "127.0.0.1"
DEFAULT_PORT = 8765
DEFAULT_LOG_BYTES = 5 * 1024 * 1024
DEFAULT_LOG_BACKUPS = 3


def configure_logging(
    log_directory: Path,
    *,
    max_bytes: int = DEFAULT_LOG_BYTES,
    backup_count: int = DEFAULT_LOG_BACKUPS,
) -> Logger:
    """Send service and Uvicorn logs to bounded rotating files."""
    log_directory.mkdir(parents=True, exist_ok=True)
    handler = RotatingFileHandler(
        log_directory / "service.log",
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding="utf-8",
    )
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    )
    handler._decent_curl_service_handler = True  # type: ignore[attr-defined]

    root = logging.getLogger()
    for existing in tuple(root.handlers):
        if getattr(existing, "_decent_curl_service_handler", False):
            root.removeHandler(existing)
            existing.close()
    root.addHandler(handler)
    root.setLevel(logging.INFO)

    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True

    logger = logging.getLogger("decent_curl.service")
    logger.setLevel(logging.INFO)
    logger.propagate = True
    return logger


def create_app() -> Starlette:
    """Build the official MCP Streamable HTTP ASGI application."""
    engine = CurlEngine()

    @asynccontextmanager
    async def lifespan(_: Server[Any]):
        try:
            yield {}
        finally:
            await engine.close()

    async def list_tools(
        _: Any, __: types.PaginatedRequestParams | None
    ) -> types.ListToolsResult:
        return types.ListToolsResult(
            tools=[types.Tool.model_validate(tool) for tool in _public_tools()]
        )

    async def call_tool(
        _: Any, params: types.CallToolRequestParams
    ) -> types.CallToolResult:
        result = await _call_tool(
            engine,
            {"name": params.name, "arguments": params.arguments or {}},
        )
        return types.CallToolResult.model_validate(result)

    async def health(_: Request) -> Response:
        return JSONResponse({"status": "ok"})

    server = Server(
        SERVER_NAME,
        version=SERVER_VERSION,
        instructions=SERVER_INSTRUCTIONS,
        lifespan=lifespan,
        on_list_tools=list_tools,
        on_call_tool=call_tool,
    )
    return server.streamable_http_app(
        streamable_http_path="/mcp",
        host=HOST,
        custom_starlette_routes=[Route("/healthz", health, methods=["GET"])],
    )


def settings_from_environment(environment: Mapping[str, str]) -> tuple[str, int]:
    """Read service settings while keeping the bind address loopback-only."""
    requested_host = environment.get("DECENT_CURL_HTTP_HOST", HOST)
    if requested_host != HOST:
        raise ValueError(f"HTTP service host must be {HOST}")

    raw_port = environment.get("DECENT_CURL_HTTP_PORT")
    if raw_port is None:
        return HOST, DEFAULT_PORT
    try:
        port = int(raw_port)
    except ValueError:
        raise ValueError(
            "DECENT_CURL_HTTP_PORT must be an integer from 1 to 65535"
        ) from None
    if not 1 <= port <= 65535:
        raise ValueError("DECENT_CURL_HTTP_PORT must be an integer from 1 to 65535")
    return HOST, port


def main() -> None:
    """Run the loopback-only HTTP service."""
    try:
        host, port = settings_from_environment(os.environ)
    except ValueError as error:
        print(f"decent-curl-http: {error}", file=sys.stderr)
        raise SystemExit(64) from None

    logger = configure_logging(Path.home() / "Library/Logs/decent-curl")
    logger.info("starting on http://%s:%d/mcp", host, port)
    uvicorn.run(
        create_app(),
        host=host,
        port=port,
        log_config=None,
        access_log=True,
    )


if __name__ == "__main__":
    main()
