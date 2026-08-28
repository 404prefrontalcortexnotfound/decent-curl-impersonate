import asyncio
import base64
from contextlib import contextmanager
import json
import logging
import socket
import threading
import time
from collections.abc import Iterator
from urllib.request import urlopen

from mcp import Client
import pytest
import uvicorn

from decent_curl_impersonate.http_server import (
    DEFAULT_PORT,
    HOST,
    configure_logging,
    create_app,
    settings_from_environment,
)
from decent_curl_impersonate.mcp_server import _public_tools


@contextmanager
def _serve_mcp_app(app: object) -> Iterator[str]:
    listener = socket.socket()
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listener.bind((HOST, 0))
    listener.listen(128)
    port = listener.getsockname()[1]
    server = uvicorn.Server(
        uvicorn.Config(app, log_config=None, lifespan="on")
    )
    thread = threading.Thread(
        target=server.run,
        kwargs={"sockets": [listener]},
        daemon=True,
    )
    thread.start()
    deadline = time.monotonic() + 5
    while not server.started and thread.is_alive() and time.monotonic() < deadline:
        time.sleep(0.01)
    if not server.started:
        server.should_exit = True
        thread.join(timeout=5)
        pytest.fail("HTTP MCP test server did not start")
    try:
        yield f"http://{HOST}:{port}"
    finally:
        server.should_exit = True
        thread.join(timeout=5)
        listener.close()
        assert not thread.is_alive()


@pytest.fixture
def http_mcp_server_url() -> Iterator[str]:
    with _serve_mcp_app(create_app()) as url:
        yield url


def _tool_json(result: object) -> dict[str, object]:
    content = getattr(result, "content")
    return json.loads(content[0].text)


def test_http_settings_use_loopback_and_default_port() -> None:
    assert settings_from_environment({}) == (HOST, DEFAULT_PORT)
    assert HOST == "127.0.0.1"
    assert DEFAULT_PORT == 8765


def test_http_settings_accept_a_valid_port_override() -> None:
    assert settings_from_environment({"DECENT_CURL_HTTP_PORT": "9123"}) == (
        HOST,
        9123,
    )


@pytest.mark.parametrize("value", ["", "not-a-port", "0", "65536", "-1"])
def test_http_settings_reject_invalid_ports(value: str) -> None:
    with pytest.raises(ValueError, match="DECENT_CURL_HTTP_PORT"):
        settings_from_environment({"DECENT_CURL_HTTP_PORT": value})


def test_http_settings_reject_non_loopback_bind() -> None:
    with pytest.raises(ValueError, match="127.0.0.1"):
        settings_from_environment({"DECENT_CURL_HTTP_HOST": "0.0.0.0"})


def test_http_settings_allow_explicit_loopback_bind() -> None:
    assert settings_from_environment({"DECENT_CURL_HTTP_HOST": HOST}) == (
        HOST,
        DEFAULT_PORT,
    )


def test_service_logs_rotate_and_stay_bounded(tmp_path) -> None:
    logger = configure_logging(tmp_path, max_bytes=128, backup_count=2)
    try:
        for index in range(100):
            logger.info("service-log-line-%03d-%s", index, "x" * 40)
        log_files = sorted(tmp_path.glob("service.log*"))
        assert tmp_path.joinpath("service.log").exists()
        assert any(path.name == "service.log.1" for path in log_files)
        assert len(log_files) <= 3
    finally:
        root_logger = logging.getLogger()
        for handler in tuple(root_logger.handlers):
            if getattr(handler, "_decent_curl_service_handler", False):
                root_logger.removeHandler(handler)
                handler.close()


def test_healthz_returns_json(http_mcp_server_url: str) -> None:
    with urlopen(f"{http_mcp_server_url}/healthz", timeout=2) as response:
        assert response.status == 200
        assert response.headers["Content-Type"].startswith("application/json")
        assert json.load(response) == {"status": "ok"}


def test_http_mcp_initializes_and_matches_stdio_tools(
    http_mcp_server_url: str,
) -> None:
    async def exercise() -> None:
        async with Client(f"{http_mcp_server_url}/mcp", mode="legacy") as client:
            assert client.server_info is not None
            assert client.server_info.name == "decent-curl"
            listed = await client.list_tools()
            actual = [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "inputSchema": tool.input_schema,
                }
                for tool in listed.tools
            ]
            assert actual == _public_tools()

    asyncio.run(exercise())


def test_http_mcp_sends_binary_body_and_custom_headers(
    http_mcp_server_url: str,
    http_server: str,
) -> None:
    payload = b"PK\x03\x04pptx-over-http"

    async def exercise() -> None:
        async with Client(f"{http_mcp_server_url}/mcp", mode="legacy") as client:
            result = await client.call_tool(
                "decent_curl_request",
                {
                    "url": f"{http_server}/echo",
                    "method": "POST",
                    "headers": {
                        "Authorization": "Bearer test-token",
                        "Content-Type": "application/octet-stream",
                        "Import-Metadata": (
                            '{"title_base64":"dGl0bGU=","mime_type":'
                            '"application/vnd.openxmlformats-officedocument.'
                            'presentationml.presentation"}'
                        ),
                    },
                    "content_base64": base64.b64encode(payload).decode("ascii"),
                },
            )
            assert result.is_error is False
            engine_result = json.loads(result.content[0].text)
            echoed = json.loads(engine_result["body"])
            assert echoed["method"] == "POST"
            assert echoed["headers"]["authorization"] == "Bearer test-token"
            assert echoed["headers"]["content-type"].startswith(
                "application/octet-stream"
            )
            assert echoed["headers"]["import-metadata"].startswith(
                '{"title_base64"'
            )
            assert echoed["body"].encode() == payload

    asyncio.run(exercise())


def test_http_mcp_reuses_named_sessions_within_one_client(
    http_mcp_server_url: str,
) -> None:
    async def exercise() -> None:
        async with Client(f"{http_mcp_server_url}/mcp", mode="legacy") as client:
            created = _tool_json(
                await client.call_tool("decent_curl_session_create", {})
            )
            listed = _tool_json(
                await client.call_tool("decent_curl_session_list", {})
            )
            assert listed["sessions"] == [
                {"session_id": created["session_id"], "profile": None}
            ]

    asyncio.run(exercise())


def test_http_mcp_closes_engine_state_after_graceful_client_close(
    http_mcp_server_url: str,
) -> None:
    async def exercise() -> None:
        async with Client(f"{http_mcp_server_url}/mcp", mode="legacy") as client:
            created = _tool_json(
                await client.call_tool("decent_curl_session_create", {})
            )

        async with Client(f"{http_mcp_server_url}/mcp", mode="legacy") as client:
            listed = _tool_json(
                await client.call_tool("decent_curl_session_list", {})
            )
            assert created["session_id"] not in {
                session["session_id"] for session in listed["sessions"]
            }

    asyncio.run(exercise())


def test_http_mcp_configures_a_bounded_idle_timeout() -> None:
    app = create_app()
    manager = app.routes[0].endpoint.session_manager

    assert manager.session_idle_timeout is not None
    assert 0 < manager.session_idle_timeout <= 30 * 60


def test_http_mcp_closes_engine_state_after_idle_timeout() -> None:
    app = create_app()
    manager = app.routes[0].endpoint.session_manager
    manager.session_idle_timeout = 0.05

    async def exercise(url: str) -> None:
        client = Client(f"{url}/mcp", mode="legacy")
        await client.__aenter__()
        try:
            created = _tool_json(
                await client.call_tool("decent_curl_session_create", {})
            )
            await asyncio.sleep(0.15)

            async with Client(f"{url}/mcp", mode="legacy") as replacement:
                listed = _tool_json(
                    await replacement.call_tool("decent_curl_session_list", {})
                )
                assert created["session_id"] not in {
                    session["session_id"] for session in listed["sessions"]
                }
        finally:
            try:
                await client.__aexit__(None, None, None)
            except Exception:
                pass

    with _serve_mcp_app(app) as url:
        asyncio.run(exercise(url))
