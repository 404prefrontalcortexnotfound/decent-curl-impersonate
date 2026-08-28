"""Loopback-only Streamable HTTP service for decent-curl."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager, suppress
from logging import Logger
from logging.handlers import RotatingFileHandler
import logging
import os
from pathlib import Path
import sys
from typing import Any

import mcp.types as types
from mcp.server.context import ServerRequestContext
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
from .service_settings import DEFAULT_PORT, HOST, settings_from_environment

DEFAULT_LOG_BYTES = 5 * 1024 * 1024
DEFAULT_LOG_BACKUPS = 3
DEFAULT_SESSION_IDLE_SECONDS = 30 * 60
DEFAULT_ENGINE_IDLE_SECONDS = 30 * 60
DEFAULT_ENGINE_SWEEP_SECONDS = 60


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


def _daemon_engine(ctx: ServerRequestContext[Any, Any]) -> CurlEngine:
    """Return the engine owned by the HTTP daemon lifespan."""
    return ctx.lifespan_context["engine"]


def create_app(
    *,
    session_idle_timeout: float = DEFAULT_SESSION_IDLE_SECONDS,
    engine_idle_timeout: float = DEFAULT_ENGINE_IDLE_SECONDS,
    engine_sweep_interval: float = DEFAULT_ENGINE_SWEEP_SECONDS,
) -> Starlette:
    """Build the official MCP Streamable HTTP ASGI application."""
    if session_idle_timeout <= 0:
        raise ValueError("session_idle_timeout must be a positive number of seconds")
    if engine_sweep_interval <= 0:
        raise ValueError("engine_sweep_interval must be a positive number of seconds")
    engine = CurlEngine(idle_timeout=engine_idle_timeout)

    @asynccontextmanager
    async def lifespan(_: Server[Any]):
        cleanup = asyncio.create_task(engine.run_idle_cleanup(engine_sweep_interval))
        try:
            yield {"engine": engine}
        finally:
            cleanup.cancel()
            with suppress(asyncio.CancelledError):
                await cleanup
            await engine.close()

    async def list_tools(
        _: Any, __: types.PaginatedRequestParams | None
    ) -> types.ListToolsResult:
        return types.ListToolsResult(
            tools=[types.Tool.model_validate(tool) for tool in _public_tools()]
        )

    async def call_tool(
        ctx: ServerRequestContext[Any, Any], params: types.CallToolRequestParams
    ) -> types.CallToolResult:
        result = await _call_tool(
            _daemon_engine(ctx),
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
    app = server.streamable_http_app(
        streamable_http_path="/mcp",
        host=HOST,
        custom_starlette_routes=[Route("/healthz", health, methods=["GET"])],
    )
    server.session_manager.session_idle_timeout = session_idle_timeout
    app.state.engine = engine
    return app


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
