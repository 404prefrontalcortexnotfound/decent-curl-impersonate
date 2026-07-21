import asyncio
import base64
import json
from collections.abc import Awaitable
from pathlib import Path
from typing import TypeVar

import pytest
from curl_cffi import CurlHttpVersion
from websockets.asyncio.server import serve

from decent_curl_impersonate.engine import CurlEngine, EngineError

T = TypeVar("T")


def run(awaitable: Awaitable[T]) -> T:
    return asyncio.run(awaitable)


async def one(operation: str, params: dict) -> dict:
    engine = CurlEngine()
    try:
        return await engine.dispatch(operation, params)
    finally:
        await engine.close()


def test_profiles_are_discovered_from_installed_curl_cffi() -> None:
    result = run(one("profiles.list", {}))

    assert result["profiles"]
    assert {"chrome", "firefox", "safari"} <= set(result["families"])
    assert all(isinstance(profile, str) for profile in result["profiles"])


def test_fingerprint_diagnostic_uses_request_result_shape(http_server: str) -> None:
    result = run(
        one(
            "diagnostic.fingerprint",
            {"url": f"{http_server}/echo"},
        )
    )

    assert result["status"] == 200
    assert result["url"] == f"{http_server}/echo"
    assert result["body_encoding"] == "utf-8"


def test_get_query_and_result_shape(http_server: str) -> None:
    result = run(
        one(
            "request.execute",
            {"url": f"{http_server}/echo", "query": {"a": "1"}},
        )
    )

    echoed = json.loads(result["body"])
    assert echoed["method"] == "GET"
    assert echoed["query"] == {"a": ["1"]}
    assert set(result) == {
        "status",
        "reason",
        "url",
        "headers",
        "cookies",
        "elapsed_ms",
        "http_version",
        "profile",
        "body",
        "body_encoding",
    }
    assert result["status"] == 200
    assert result["reason"] == "OK"
    assert result["http_version"] == "1.1"
    assert result["body_encoding"] == "utf-8"


@pytest.mark.parametrize(
    ("params", "expected_body", "content_type"),
    [
        ({"json": {"answer": 42}}, '{"answer":42}', "application/json"),
        ({"form": {"answer": "forty two"}}, "answer=forty+two", "application/x-www-form-urlencoded"),
        ({"content": "raw-body"}, "raw-body", None),
        ({"content_base64": base64.b64encode(b"raw\x00bytes").decode()}, "raw\u0000bytes", None),
    ],
)
def test_post_body_modes(
    http_server: str,
    params: dict,
    expected_body: str,
    content_type: str | None,
) -> None:
    result = run(
        one(
            "request.execute",
            {"method": "POST", "url": f"{http_server}/echo", **params},
        )
    )

    echoed = json.loads(result["body"])
    assert echoed["body"] == expected_body
    if content_type:
        assert echoed["headers"]["content-type"].startswith(content_type)


@pytest.mark.parametrize("method", ["PUT", "DELETE"])
def test_put_and_delete_methods(http_server: str, method: str) -> None:
    result = run(
        one(
            "request.execute",
            {"method": method, "url": f"{http_server}/echo", "content": "payload"},
        )
    )

    echoed = json.loads(result["body"])
    assert echoed["method"] == method
    assert echoed["body"] == "payload"


@pytest.mark.parametrize(
    ("selector", "expected"),
    [
        ("auto", CurlHttpVersion.NONE),
        ("1.1", CurlHttpVersion.V1_1),
        ("2", CurlHttpVersion.V2_0),
        ("3", CurlHttpVersion.V3),
    ],
)
def test_http_version_selectors_map_to_curl_constants_without_live_http3(
    monkeypatch: pytest.MonkeyPatch,
    selector: str,
    expected: CurlHttpVersion,
) -> None:
    class RequestRecorded(Exception):
        pass

    class RecordingSession:
        request_kwargs: dict = {}

        async def request(self, **kwargs: object) -> None:
            RecordingSession.request_kwargs = kwargs
            raise RequestRecorded

        async def close(self) -> None:
            pass

    monkeypatch.setattr("decent_curl_impersonate.engine.AsyncSession", RecordingSession)

    with pytest.raises(RequestRecorded):
        run(
            one(
                "request.execute",
                {"url": "https://example.test/", "http_version": selector},
            )
        )

    assert RecordingSession.request_kwargs["http_version"] == expected


def test_multipart_upload_uses_local_file(http_server: str, secure_tmp_path: Path) -> None:
    upload = secure_tmp_path / "upload.txt"
    upload.write_text("uploaded-private-content")
    result = run(
        one(
            "request.execute",
            {
                "method": "POST",
                "url": f"{http_server}/echo",
                "multipart": {
                    "description": {"value": "sample"},
                    "attachment": {"path": str(upload), "content_type": "text/plain"},
                },
            },
        )
    )

    echoed = json.loads(result["body"])
    assert "multipart/form-data; boundary=" in echoed["headers"]["content-type"]
    assert 'name="description"' in echoed["body"]
    assert "sample" in echoed["body"]
    assert 'filename="upload.txt"' in echoed["body"]
    assert "uploaded-private-content" in echoed["body"]


def test_basic_bearer_and_custom_headers(http_server: str) -> None:
    async def scenario() -> tuple[dict, dict]:
        engine = CurlEngine()
        try:
            basic = await engine.dispatch(
                "request.execute",
                {
                    "url": f"{http_server}/echo",
                    "auth": {"type": "basic", "username": "user", "password": "secret"},
                    "headers": {"X-Test": "yes"},
                },
            )
            bearer = await engine.dispatch(
                "request.execute",
                {
                    "url": f"{http_server}/echo",
                    "auth": {"type": "bearer", "token": "private-token"},
                },
            )
            return basic, bearer
        finally:
            await engine.close()

    basic, bearer = run(scenario())
    basic_headers = json.loads(basic["body"])["headers"]
    bearer_headers = json.loads(bearer["body"])["headers"]
    assert basic_headers["authorization"] == "Basic " + base64.b64encode(b"user:secret").decode()
    assert basic_headers["x-test"] == "yes"
    assert bearer_headers["authorization"] == "Bearer private-token"


def test_redirects_are_off_by_default_and_safe_is_passed_through(http_server: str) -> None:
    async def scenario() -> tuple[dict, dict]:
        engine = CurlEngine()
        try:
            stopped = await engine.dispatch(
                "request.execute", {"url": f"{http_server}/redirect"}
            )
            followed = await engine.dispatch(
                "request.execute",
                {"url": f"{http_server}/redirect", "allow_redirects": "safe"},
            )
            return stopped, followed
        finally:
            await engine.close()

    stopped, followed = run(scenario())
    assert stopped["status"] == 302
    assert followed["status"] == 200
    assert followed["body"] == "redirected"
    assert followed["url"].endswith("/final")


def test_timeout_has_stable_mapping_without_request_secrets(http_server: str) -> None:
    async def scenario() -> None:
        engine = CurlEngine()
        try:
            await engine.dispatch(
                "request.execute",
                {
                    "url": f"{http_server}/slow",
                    "timeout": 0.03,
                    "headers": {"Authorization": "Bearer do-not-leak"},
                    "content": "do-not-leak-body",
                },
            )
        finally:
            await engine.close()

    with pytest.raises(EngineError) as error:
        run(scenario())

    assert error.value.code == "timeout"
    assert error.value.retryable is True
    assert "do-not-leak" not in str(error.value)
    assert "do-not-leak" not in json.dumps(error.value.metadata)


def test_named_session_reuses_cookies_but_never_returns_values(http_server: str) -> None:
    async def scenario() -> tuple[str, dict, dict, dict, dict]:
        engine = CurlEngine()
        try:
            created = await engine.dispatch("session.create", {})
            session_id = created["session_id"]
            first = await engine.dispatch(
                "request.execute",
                {"url": f"{http_server}/cookie/set", "session_id": session_id},
            )
            second = await engine.dispatch(
                "request.execute",
                {"url": f"{http_server}/cookie/check", "session_id": session_id},
            )
            listed = await engine.dispatch("session.list", {})
            closed = await engine.dispatch("session.close", {"session_id": session_id})
            return session_id, first, second, listed, closed
        finally:
            await engine.close()

    session_id, first, second, listed, closed = run(scenario())
    assert json.loads(second["body"])["seen"] is True
    assert first["cookies"] == [{"name": "session", "domain": "127.0.0.1"}]
    assert first["headers"]["set-cookie"] == "[REDACTED]"
    assert "top-secret-cookie" not in json.dumps(first)
    assert listed == {"sessions": [{"session_id": session_id, "profile": None}]}
    assert closed == {"session_id": session_id, "closed": True}


def test_unknown_session_and_operation_have_stable_errors(http_server: str) -> None:
    async def scenario() -> tuple[EngineError, EngineError]:
        engine = CurlEngine()
        try:
            try:
                await engine.dispatch(
                    "request.execute",
                    {"url": http_server, "session_id": "not-a-session"},
                )
            except EngineError as error:
                session_error = error
            try:
                await engine.dispatch("not.real", {})
            except EngineError as error:
                operation_error = error
            return session_error, operation_error
        finally:
            await engine.close()

    session_error, operation_error = run(scenario())
    assert session_error.code == "unknown_session"
    assert "Unknown session" in str(session_error)
    assert operation_error.code == "unknown_operation"
    assert "Unknown operation" in str(operation_error)


def test_download_streams_to_requested_secure_path_and_hashes(
    http_server: str, secure_tmp_path: Path
) -> None:
    destination = secure_tmp_path / "private" / "artifact.bin"
    result = run(
        one(
            "download.execute",
            {"url": f"{http_server}/download", "path": str(destination)},
        )
    )

    payload = b"download-payload" * 4096
    import hashlib

    assert destination.read_bytes() == payload
    assert destination.stat().st_mode & 0o777 == 0o600
    assert destination.parent.stat().st_mode & 0o777 == 0o700
    assert result == {
        "path": str(destination.resolve()),
        "size": len(payload),
        "content_type": "application/octet-stream",
        "status": 200,
        "url": f"{http_server}/download",
        "profile": None,
        "sha256": hashlib.sha256(payload).hexdigest(),
    }


def test_download_generates_a_user_only_destination(http_server: str) -> None:
    result = run(one("download.execute", {"url": f"{http_server}/download"}))
    destination = Path(result["path"])
    try:
        assert destination.is_file()
        assert destination.stat().st_mode & 0o777 == 0o600
        assert destination.parent.stat().st_mode & 0o777 == 0o700
    finally:
        destination.unlink(missing_ok=True)
        destination.parent.rmdir()


def test_download_refuses_overwrite_unless_explicit(
    http_server: str, secure_tmp_path: Path
) -> None:
    destination = secure_tmp_path / "existing.bin"
    destination.write_bytes(b"keep-me")

    with pytest.raises(EngineError) as error:
        run(
            one(
                "download.execute",
                {"url": f"{http_server}/download", "path": str(destination)},
            )
        )
    assert error.value.code == "destination_exists"
    assert destination.read_bytes() == b"keep-me"

    result = run(
        one(
            "download.execute",
            {
                "url": f"{http_server}/download",
                "path": str(destination),
                "overwrite": True,
            },
        )
    )
    assert result["size"] > 0
    assert destination.read_bytes().startswith(b"download-payload")


def test_download_removes_partial_file_after_stream_failure(
    http_server: str, secure_tmp_path: Path
) -> None:
    destination = secure_tmp_path / "partial.bin"

    with pytest.raises(EngineError) as error:
        run(
            one(
                "download.execute",
                {"url": f"{http_server}/download-slow", "path": str(destination)},
            )
        )

    assert error.value.code == "network_error"
    assert not destination.exists()


def test_websocket_text_binary_timeout_close_and_unknown_handle() -> None:
    async def scenario() -> None:
        async def echo(websocket: object) -> None:
            async for message in websocket:  # type: ignore[attr-defined]
                await websocket.send(message)  # type: ignore[attr-defined]

        async with serve(echo, "127.0.0.1", 0) as server:
            port = server.sockets[0].getsockname()[1]
            engine = CurlEngine()
            try:
                connected = await engine.dispatch(
                    "websocket.connect", {"url": f"ws://127.0.0.1:{port}/echo"}
                )
                websocket_id = connected["websocket_id"]
                assert connected == {
                    "websocket_id": websocket_id,
                    "connected": True,
                    "profile": None,
                }

                sent_text = await engine.dispatch(
                    "websocket.send",
                    {"websocket_id": websocket_id, "message": "hello"},
                )
                assert sent_text == {
                    "websocket_id": websocket_id,
                    "sent": True,
                    "message_type": "text",
                }
                assert await engine.dispatch(
                    "websocket.receive", {"websocket_id": websocket_id}
                ) == {
                    "websocket_id": websocket_id,
                    "message_type": "text",
                    "message": "hello",
                }

                binary = b"binary\x00message"
                await engine.dispatch(
                    "websocket.send",
                    {
                        "websocket_id": websocket_id,
                        "data_base64": base64.b64encode(binary).decode("ascii"),
                    },
                )
                assert await engine.dispatch(
                    "websocket.receive", {"websocket_id": websocket_id}
                ) == {
                    "websocket_id": websocket_id,
                    "message_type": "binary",
                    "data_base64": base64.b64encode(binary).decode("ascii"),
                }

                with pytest.raises(EngineError) as timeout:
                    await engine.dispatch(
                        "websocket.receive",
                        {"websocket_id": websocket_id, "timeout": 0.01},
                    )
                assert timeout.value.code == "timeout"
                assert timeout.value.retryable is True

                assert await engine.dispatch(
                    "websocket.close",
                    {"websocket_id": websocket_id, "code": 1000, "reason": "done"},
                ) == {"websocket_id": websocket_id, "closed": True}

                with pytest.raises(EngineError) as unknown:
                    await engine.dispatch(
                        "websocket.receive", {"websocket_id": websocket_id}
                    )
                assert unknown.value.code == "unknown_websocket"
            finally:
                await engine.close()

    run(scenario())


def test_websocket_connect_does_not_return_handshake_cookies() -> None:
    async def scenario() -> None:
        async def echo(websocket: object) -> None:
            await websocket.wait_closed()  # type: ignore[attr-defined]

        async def set_handshake_cookie(
            _connection: object, _request: object, response: object
        ) -> object:
            response.headers["Set-Cookie"] = "handshake=server-secret"  # type: ignore[attr-defined]
            return response

        async with serve(
            echo, "127.0.0.1", 0, process_response=set_handshake_cookie
        ) as server:
            port = server.sockets[0].getsockname()[1]
            engine = CurlEngine()
            try:
                result = await engine.dispatch(
                    "websocket.connect",
                    {
                        "url": f"ws://127.0.0.1:{port}/echo",
                        "headers": {"Cookie": "private-cookie=value"},
                    },
                )
                assert "cookie" not in json.dumps(result).lower()
            finally:
                await engine.close()

    run(scenario())


def test_websocket_receive_error_evicts_handle_and_closes_dedicated_session() -> None:
    async def scenario() -> None:
        peer_connected = asyncio.Event()
        abort_peer = asyncio.Event()
        peer_aborted = asyncio.Event()

        async def disconnect(websocket: object) -> None:
            peer_connected.set()
            await abort_peer.wait()
            websocket.transport.abort()  # type: ignore[attr-defined]
            peer_aborted.set()

        async with serve(disconnect, "127.0.0.1", 0) as server:
            port = server.sockets[0].getsockname()[1]
            engine = CurlEngine()
            try:
                connected = await engine.dispatch(
                    "websocket.connect", {"url": f"ws://127.0.0.1:{port}/disconnect"}
                )
                websocket_id = connected["websocket_id"]
                handle = engine._websockets[websocket_id]
                await peer_connected.wait()
                abort_peer.set()
                await peer_aborted.wait()

                with pytest.raises(EngineError) as error:
                    await engine.dispatch(
                        "websocket.receive", {"websocket_id": websocket_id, "timeout": 1}
                    )

                assert error.value.code == "network_error"
                assert websocket_id not in engine._websockets
                assert handle.session._closed is True
            finally:
                await engine.close()

    run(scenario())


@pytest.mark.parametrize("use_named_session", [False, True])
def test_websocket_send_error_evicts_handle_and_respects_session_ownership(
    use_named_session: bool,
) -> None:
    async def scenario() -> None:
        peer_connected = asyncio.Event()
        abort_peer = asyncio.Event()
        peer_aborted = asyncio.Event()

        async def disconnect(websocket: object) -> None:
            peer_connected.set()
            await abort_peer.wait()
            websocket.transport.abort()  # type: ignore[attr-defined]
            peer_aborted.set()

        async with serve(disconnect, "127.0.0.1", 0) as server:
            port = server.sockets[0].getsockname()[1]
            engine = CurlEngine()
            try:
                connect_params = {"url": f"ws://127.0.0.1:{port}/disconnect"}
                session_id = None
                if use_named_session:
                    created = await engine.dispatch("session.create", {})
                    session_id = created["session_id"]
                    connect_params["session_id"] = session_id
                connected = await engine.dispatch("websocket.connect", connect_params)
                websocket_id = connected["websocket_id"]
                handle = engine._websockets[websocket_id]
                await peer_connected.wait()
                abort_peer.set()
                await peer_aborted.wait()
                await asyncio.sleep(0.05)

                with pytest.raises(EngineError) as error:
                    await engine.dispatch(
                        "websocket.send",
                        {"websocket_id": websocket_id, "message": "after disconnect"},
                    )

                assert error.value.code == "network_error"
                assert websocket_id not in engine._websockets
                assert handle.session._closed is not use_named_session
                if session_id is not None:
                    assert await engine.dispatch("session.list", {}) == {
                        "sessions": [{"session_id": session_id, "profile": None}]
                    }
            finally:
                await engine.close()

    run(scenario())


def test_engine_shutdown_closes_active_websockets() -> None:
    async def scenario() -> None:
        disconnected = asyncio.Event()

        async def echo(websocket: object) -> None:
            try:
                await websocket.wait_closed()  # type: ignore[attr-defined]
            finally:
                disconnected.set()

        async with serve(echo, "127.0.0.1", 0) as server:
            port = server.sockets[0].getsockname()[1]
            engine = CurlEngine()
            connected = await engine.dispatch(
                "websocket.connect", {"url": f"ws://127.0.0.1:{port}/echo"}
            )
            assert connected["connected"] is True
            await engine.close()
            await asyncio.wait_for(disconnected.wait(), timeout=1)

    run(scenario())
