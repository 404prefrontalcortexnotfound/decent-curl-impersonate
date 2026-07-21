"""curl_cffi-backed request, session, profile, and download engine."""

from __future__ import annotations

import asyncio
import base64
import hashlib
import os
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from curl_cffi import CurlHttpVersion, CurlMime, CurlWsFlag
from curl_cffi.const import CurlECode
from curl_cffi.requests import AsyncSession, BrowserType, Response
from curl_cffi.requests.errors import RequestsError
from curl_cffi.requests.websockets import AsyncWebSocket, WebSocketError


class EngineError(Exception):
    """Stable, secret-free error returned by the worker boundary."""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        retryable: bool = False,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable
        self.metadata = metadata or {}


@dataclass
class _NamedSession:
    session: AsyncSession
    profile: str | None


@dataclass
class _WebSocketHandle:
    websocket: AsyncWebSocket
    session: AsyncSession
    close_session: bool
    profile: str | None


_HTTP_VERSIONS = {
    "auto": CurlHttpVersion.NONE,
    "1.1": CurlHttpVersion.V1_1,
    "2": CurlHttpVersion.V2_0,
    "3": CurlHttpVersion.V3,
}
_RESPONSE_HTTP_VERSIONS = {
    CurlHttpVersion.V1_0: "1.0",
    CurlHttpVersion.V1_1: "1.1",
    CurlHttpVersion.V2_0: "2",
    CurlHttpVersion.V3: "3",
}
_SENSITIVE_RESPONSE_HEADERS = frozenset(
    {"authorization", "cookie", "proxy-authorization", "set-cookie"}
)
_BODY_KEYS = ("json", "form", "content", "content_base64", "multipart")


class CurlEngine:
    """Own curl sessions and dispatch protocol operations."""

    def __init__(self) -> None:
        self._sessions: dict[str, _NamedSession] = {}
        self._websockets: dict[str, _WebSocketHandle] = {}

    async def dispatch(self, operation: str, params: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(params, dict):
            raise EngineError("invalid_params", "Operation parameters must be an object")
        handlers = {
            "profiles.list": self._profiles_list,
            "request.execute": self._request_execute,
            "download.execute": self._download_execute,
            "session.create": self._session_create,
            "session.list": self._session_list,
            "session.close": self._session_close,
            "websocket.connect": self._websocket_connect,
            "websocket.send": self._websocket_send,
            "websocket.receive": self._websocket_receive,
            "websocket.close": self._websocket_close,
            "diagnostic.fingerprint": self._diagnostic_fingerprint,
        }
        handler = handlers.get(operation)
        if handler is None:
            raise EngineError(
                "unknown_operation",
                f"Unknown operation: {operation}",
                metadata={"operation": operation},
            )
        return await handler(params)

    async def close(self) -> None:
        websockets = list(self._websockets.values())
        self._websockets.clear()
        for handle in websockets:
            await self._close_websocket(handle)
        sessions = list(self._sessions.values())
        self._sessions.clear()
        for named in sessions:
            await named.session.close()

    async def _profiles_list(self, params: dict[str, Any]) -> dict[str, Any]:
        profiles = list(BrowserType.__members__)
        families = sorted(
            {
                "chrome" if profile.startswith("chrome") else
                "edge" if profile.startswith("edge") else
                "firefox" if profile.startswith("firefox") else
                "safari" if profile.startswith("safari") else
                "tor" if profile.startswith("tor") else
                "other"
                for profile in profiles
            }
        )
        return {"profiles": profiles, "families": families}

    async def _session_create(self, params: dict[str, Any]) -> dict[str, Any]:
        profile = self._profile(params.get("profile"))
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = _NamedSession(AsyncSession(), profile)
        return {"session_id": session_id, "profile": profile}

    async def _session_list(self, params: dict[str, Any]) -> dict[str, Any]:
        return {
            "sessions": [
                {"session_id": session_id, "profile": named.profile}
                for session_id, named in self._sessions.items()
            ]
        }

    async def _session_close(self, params: dict[str, Any]) -> dict[str, Any]:
        session_id = self._required_string(params, "session_id")
        named = self._sessions.pop(session_id, None)
        if named is None:
            raise EngineError("unknown_session", "Unknown session ID")
        await named.session.close()
        return {"session_id": session_id, "closed": True}

    async def _diagnostic_fingerprint(self, params: dict[str, Any]) -> dict[str, Any]:
        request_params = {
            "url": params.get("url", "https://tls.browserleaks.com/json"),
            "profile": params.get("profile"),
            "allow_redirects": "safe",
            "timeout": 30,
        }
        return await self._request_execute(request_params)

    async def _websocket_connect(self, params: dict[str, Any]) -> dict[str, Any]:
        url = self._required_string(params, "url")
        parsed = urlparse(url)
        if parsed.scheme not in {"ws", "wss"} or not parsed.netloc:
            raise EngineError("invalid_url", "URL must use WebSocket WS or WSS")
        if parsed.username is not None or parsed.password is not None:
            raise EngineError("invalid_url", "URL must not contain credentials")
        headers = params.get("headers", {})
        if not isinstance(headers, dict) or not all(
            isinstance(name, str) and isinstance(value, str)
            for name, value in headers.items()
        ):
            raise EngineError("invalid_params", "headers must contain string names and values")

        session, should_close, default_profile = self._select_session(params)
        profile = self._profile(params.get("profile", default_profile))
        timeout = self._optional_timeout(params.get("timeout"))
        kwargs = {
            "headers": dict(headers),
            "proxy": params.get("proxy"),
            "verify": params.get("verify"),
            "impersonate": profile,
            "timeout": timeout,
        }
        try:
            websocket = await session.ws_connect(
                url, **{key: value for key, value in kwargs.items() if value is not None}
            )
        except (RequestsError, WebSocketError) as error:
            if should_close:
                await session.close()
            raise self._network_error(error) from None
        except Exception:
            if should_close:
                await session.close()
            raise

        websocket_id = str(uuid.uuid4())
        self._websockets[websocket_id] = _WebSocketHandle(
            websocket, session, should_close, profile
        )
        # Deliberately exclude handshake response headers and cookies.
        return {"websocket_id": websocket_id, "connected": True, "profile": profile}

    async def _websocket_send(self, params: dict[str, Any]) -> dict[str, Any]:
        websocket_id, handle = self._websocket_handle(params)
        has_text = params.get("message") is not None
        has_binary = params.get("data_base64") is not None
        if has_text == has_binary:
            raise EngineError(
                "invalid_params", "Supply exactly one of message or data_base64"
            )
        timeout = self._optional_timeout(params.get("timeout"))
        if has_text:
            payload = params["message"]
            if not isinstance(payload, str):
                raise EngineError("invalid_params", "message must be a string")
            flags = CurlWsFlag.TEXT
            message_type = "text"
        else:
            try:
                payload = base64.b64decode(params["data_base64"], validate=True)
            except (TypeError, ValueError):
                raise EngineError(
                    "invalid_params", "data_base64 must be valid base64"
                ) from None
            flags = CurlWsFlag.BINARY
            message_type = "binary"
        try:
            await handle.websocket.send(payload, flags=flags, timeout=timeout)
        except asyncio.TimeoutError:
            raise EngineError("timeout", "WebSocket send timed out", retryable=True) from None
        except WebSocketError as error:
            if error.code != CurlECode.OPERATION_TIMEDOUT:
                try:
                    await self._evict_terminal_websocket(websocket_id, handle)
                finally:
                    raise self._network_error(error) from None
            raise self._network_error(error) from None
        return {
            "websocket_id": websocket_id,
            "sent": True,
            "message_type": message_type,
        }

    async def _websocket_receive(self, params: dict[str, Any]) -> dict[str, Any]:
        websocket_id, handle = self._websocket_handle(params)
        timeout = self._optional_timeout(params.get("timeout"))
        try:
            payload, flags = await handle.websocket.recv(timeout=timeout)
        except asyncio.TimeoutError:
            raise EngineError(
                "timeout", "WebSocket receive timed out", retryable=True
            ) from None
        except WebSocketError as error:
            if error.code != CurlECode.OPERATION_TIMEDOUT:
                try:
                    await self._evict_terminal_websocket(websocket_id, handle)
                finally:
                    raise self._network_error(error) from None
            raise self._network_error(error) from None

        if flags & CurlWsFlag.CLOSE:
            self._websockets.pop(websocket_id, None)
            await self._close_websocket(handle)
            code = int.from_bytes(payload[:2], "big") if len(payload) >= 2 else 1005
            reason = payload[2:].decode("utf-8", "replace")
            return {
                "websocket_id": websocket_id,
                "closed": True,
                "code": code,
                "reason": reason,
            }
        if flags & CurlWsFlag.TEXT:
            try:
                message = payload.decode("utf-8")
            except UnicodeDecodeError:
                raise EngineError(
                    "network_error", "WebSocket text message is not valid UTF-8"
                ) from None
            return {
                "websocket_id": websocket_id,
                "message_type": "text",
                "message": message,
            }
        return {
            "websocket_id": websocket_id,
            "message_type": "binary",
            "data_base64": base64.b64encode(payload).decode("ascii"),
        }

    async def _websocket_close(self, params: dict[str, Any]) -> dict[str, Any]:
        websocket_id, handle = self._websocket_handle(params)
        code = params.get("code", 1000)
        if not isinstance(code, int) or isinstance(code, bool) or not 0 <= code <= 65535:
            raise EngineError("invalid_params", "code must be an integer from 0 to 65535")
        reason = params.get("reason", "")
        if not isinstance(reason, str):
            raise EngineError("invalid_params", "reason must be a string")
        self._websockets.pop(websocket_id, None)
        try:
            await handle.websocket.close(code=code, message=reason.encode("utf-8"))
        except WebSocketError as error:
            raise self._network_error(error) from None
        finally:
            if handle.close_session:
                await handle.session.close()
        return {"websocket_id": websocket_id, "closed": True}

    async def _close_websocket(self, handle: _WebSocketHandle) -> None:
        try:
            await handle.websocket.close()
        finally:
            if handle.close_session:
                await handle.session.close()

    async def _evict_terminal_websocket(
        self, websocket_id: str, handle: _WebSocketHandle
    ) -> None:
        if self._websockets.get(websocket_id) is handle:
            self._websockets.pop(websocket_id)
        if handle.close_session:
            await handle.session.close()

    def _websocket_handle(
        self, params: dict[str, Any]
    ) -> tuple[str, _WebSocketHandle]:
        websocket_id = self._required_string(params, "websocket_id")
        handle = self._websockets.get(websocket_id)
        if handle is None:
            raise EngineError("unknown_websocket", "Unknown WebSocket ID")
        return websocket_id, handle

    async def _request_execute(self, params: dict[str, Any]) -> dict[str, Any]:
        session, should_close, default_profile = self._select_session(params)
        try:
            profile = self._profile(params.get("profile", default_profile))
            retries = self._nonnegative_int(params.get("retries", 0), "retries")
            for attempt in range(retries + 1):
                mime: CurlMime | None = None
                try:
                    kwargs, mime = self._request_kwargs(params, profile)
                    response = await session.request(**kwargs)
                    return self._response_result(response, profile)
                except RequestsError as error:
                    if attempt < retries:
                        continue
                    raise self._network_error(error) from None
                finally:
                    if mime is not None:
                        mime.close()
        finally:
            if should_close:
                await session.close()
        raise AssertionError("request retry loop did not return")

    async def _download_execute(self, params: dict[str, Any]) -> dict[str, Any]:
        overwrite = params.get("overwrite", False)
        if not isinstance(overwrite, bool):
            raise EngineError("invalid_params", "overwrite must be a boolean")
        session, should_close, default_profile = self._select_session(params)
        mime: CurlMime | None = None
        destination: Path | None = None
        generated_parent: Path | None = None
        staging: Path | None = None
        try:
            profile = self._profile(params.get("profile", default_profile))
            request_params = dict(params)
            request_params["method"] = "GET"
            for key in _BODY_KEYS:
                request_params.pop(key, None)
            kwargs, mime = self._request_kwargs(request_params, profile)

            destination, generated_parent = self._download_destination(params)
            if destination.exists() and not overwrite:
                raise EngineError("destination_exists", "Download destination already exists")
            if destination.exists() and not destination.is_file():
                raise EngineError("invalid_destination", "Download destination is not a file")
            self._make_private_parents(destination.parent)
            staging = destination.with_name(
                f".{destination.name}.{uuid.uuid4().hex}.partial"
            )
            size = 0
            digest = hashlib.sha256()
            fd = os.open(staging, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, "wb") as output:
                async with session.stream(**kwargs) as response:
                    async for chunk in response.aiter_content():
                        output.write(chunk)
                        digest.update(chunk)
                        size += len(chunk)
                    output.flush()
                    os.fsync(output.fileno())
                    result = {
                        "path": str(destination),
                        "size": size,
                        "content_type": response.headers.get("content-type", "").split(";", 1)[0],
                        "status": response.status_code,
                        "url": response.url,
                        "profile": profile,
                        "sha256": digest.hexdigest(),
                    }
            if overwrite:
                os.replace(staging, destination)
            else:
                try:
                    os.link(staging, destination)
                except FileExistsError:
                    raise EngineError(
                        "destination_exists", "Download destination already exists"
                    ) from None
                staging.unlink()
            os.chmod(destination, 0o600)
            return result
        except RequestsError as error:
            raise self._network_error(error) from None
        except OSError:
            raise EngineError("file_error", "Download file operation failed") from None
        finally:
            if staging is not None:
                staging.unlink(missing_ok=True)
            if mime is not None:
                mime.close()
            if should_close:
                await session.close()
            if (
                generated_parent is not None
                and destination is not None
                and not destination.exists()
            ):
                try:
                    generated_parent.rmdir()
                except OSError:
                    pass

    def _download_destination(self, params: dict[str, Any]) -> tuple[Path, Path | None]:
        requested = params.get("path")
        if requested is None:
            parent = Path(tempfile.mkdtemp(prefix="decent-curl-download-"))
            parent.chmod(0o700)
            return (parent / "download.bin").resolve(), parent
        if not isinstance(requested, str) or not requested:
            raise EngineError("invalid_params", "path must be a non-empty string")
        return Path(requested).expanduser().resolve(), None

    @staticmethod
    def _make_private_parents(parent: Path) -> None:
        missing: list[Path] = []
        current = parent
        while not current.exists():
            missing.append(current)
            current = current.parent
        try:
            parent.mkdir(parents=True, mode=0o700, exist_ok=True)
            for directory in missing:
                directory.chmod(0o700)
        except OSError:
            raise EngineError("file_error", "Unable to create download directory") from None

    def _select_session(
        self, params: dict[str, Any]
    ) -> tuple[AsyncSession, bool, str | None]:
        session_id = params.get("session_id")
        if session_id is None:
            return AsyncSession(), True, None
        if not isinstance(session_id, str):
            raise EngineError("invalid_params", "session_id must be a string")
        named = self._sessions.get(session_id)
        if named is None:
            raise EngineError("unknown_session", "Unknown session ID")
        return named.session, False, named.profile

    def _request_kwargs(
        self, params: dict[str, Any], profile: str | None
    ) -> tuple[dict[str, Any], CurlMime | None]:
        url = self._required_string(params, "url")
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise EngineError("invalid_url", "URL must use HTTP or HTTPS")
        if parsed.username is not None or parsed.password is not None:
            raise EngineError("invalid_url", "URL must not contain credentials")

        method = params.get("method", "GET")
        if not isinstance(method, str) or not method:
            raise EngineError("invalid_params", "method must be a non-empty string")
        supplied_bodies = [key for key in _BODY_KEYS if params.get(key) is not None]
        if len(supplied_bodies) > 1:
            raise EngineError("invalid_params", "Only one request body may be supplied")

        headers = params.get("headers", {})
        if not isinstance(headers, dict) or not all(
            isinstance(name, str) and isinstance(value, str)
            for name, value in headers.items()
        ):
            raise EngineError("invalid_params", "headers must contain string names and values")
        headers = dict(headers)

        auth = params.get("auth")
        basic_auth: tuple[str, str] | None = None
        if auth is not None:
            if not isinstance(auth, dict):
                raise EngineError("invalid_params", "auth must be an object")
            auth_type = auth.get("type")
            if auth_type == "basic":
                username = auth.get("username")
                password = auth.get("password")
                if not isinstance(username, str) or not isinstance(password, str):
                    raise EngineError("invalid_params", "Basic auth requires username and password")
                basic_auth = (username, password)
            elif auth_type == "bearer":
                token = auth.get("token")
                if not isinstance(token, str):
                    raise EngineError("invalid_params", "Bearer auth requires a token")
                headers["Authorization"] = f"Bearer {token}"
            else:
                raise EngineError("invalid_params", "Unsupported authentication type")

        version = params.get("http_version", "auto")
        if version not in _HTTP_VERSIONS:
            raise EngineError("invalid_params", "http_version must be auto, 1.1, 2, or 3")
        redirects = params.get("allow_redirects", False)
        if redirects not in (True, False, "safe"):
            raise EngineError("invalid_params", "allow_redirects must be true, false, or safe")

        kwargs: dict[str, Any] = {
            "method": method.upper(),
            "url": url,
            "params": params.get("query"),
            "headers": headers,
            "auth": basic_auth,
            "timeout": params.get("timeout"),
            "allow_redirects": redirects,
            "max_redirects": params.get("max_redirects"),
            "proxy": params.get("proxy"),
            "verify": params.get("verify"),
            "impersonate": profile,
            "http_version": _HTTP_VERSIONS[version],
        }
        mime: CurlMime | None = None
        if "json" in supplied_bodies:
            kwargs["json"] = params["json"]
        elif "form" in supplied_bodies:
            kwargs["data"] = params["form"]
        elif "content" in supplied_bodies:
            content = params["content"]
            if not isinstance(content, str):
                raise EngineError("invalid_params", "content must be a string")
            kwargs["data"] = content
        elif "content_base64" in supplied_bodies:
            try:
                kwargs["data"] = base64.b64decode(params["content_base64"], validate=True)
            except (TypeError, ValueError):
                raise EngineError("invalid_params", "content_base64 must be valid base64") from None
        elif "multipart" in supplied_bodies:
            mime = self._multipart(params["multipart"])
            kwargs["multipart"] = mime
        return {key: value for key, value in kwargs.items() if value is not None}, mime

    def _multipart(self, fields: Any) -> CurlMime:
        if not isinstance(fields, dict):
            raise EngineError("invalid_params", "multipart must be an object")
        mime = CurlMime()
        try:
            for name, part in fields.items():
                if not isinstance(name, str) or not isinstance(part, dict):
                    raise EngineError("invalid_params", "multipart parts must be named objects")
                if "path" in part:
                    path = part["path"]
                    if not isinstance(path, str) or not Path(path).is_file():
                        raise EngineError("invalid_upload", "Upload path is not a readable file")
                    mime.addpart(
                        name,
                        local_path=path,
                        filename=part.get("filename") or Path(path).name,
                        content_type=part.get("content_type"),
                    )
                elif "value" in part:
                    value = part["value"]
                    if not isinstance(value, str):
                        raise EngineError("invalid_params", "multipart values must be strings")
                    mime.addpart(
                        name,
                        data=value.encode(),
                        content_type=part.get("content_type"),
                    )
                else:
                    raise EngineError("invalid_params", "multipart part needs path or value")
            return mime
        except Exception:
            mime.close()
            raise

    def _response_result(self, response: Response, profile: str | None) -> dict[str, Any]:
        try:
            body = response.content.decode(response.encoding or "utf-8")
            body_encoding = response.encoding or "utf-8"
        except (LookupError, UnicodeDecodeError):
            body = base64.b64encode(response.content).decode("ascii")
            body_encoding = "base64"
        headers = {
            name.lower(): "[REDACTED]"
            if name.lower() in _SENSITIVE_RESPONSE_HEADERS
            else value
            for name, value in response.headers.items()
        }
        response_domain = urlparse(response.url).hostname or ""
        cookies = sorted(
            {
                (cookie.name, cookie.domain or response_domain)
                for cookie in response.cookies.jar
            }
        )
        elapsed_ms = round(response.elapsed.total_seconds() * 1000, 3)
        reason = response.reason.decode() if isinstance(response.reason, bytes) else response.reason
        return {
            "status": response.status_code,
            "reason": reason or "",
            "url": response.url,
            "headers": headers,
            "cookies": [{"name": name, "domain": domain} for name, domain in cookies],
            "elapsed_ms": elapsed_ms,
            "http_version": _RESPONSE_HTTP_VERSIONS.get(response.http_version, "unknown"),
            "profile": profile,
            "body": body,
            "body_encoding": body_encoding,
        }

    def _network_error(self, error: RequestsError | WebSocketError) -> EngineError:
        if error.code == CurlECode.OPERATION_TIMEDOUT:
            return EngineError("timeout", "Request timed out", retryable=True)
        return EngineError(
            "network_error",
            "Request failed",
            retryable=True,
            metadata={"curl_code": int(error.code)},
        )

    def _profile(self, value: Any) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str) or value not in BrowserType.__members__:
            raise EngineError("invalid_profile", "Unknown browser profile")
        return value

    @staticmethod
    def _required_string(params: dict[str, Any], key: str) -> str:
        value = params.get(key)
        if not isinstance(value, str) or not value:
            raise EngineError("invalid_params", f"{key} must be a non-empty string")
        return value

    @staticmethod
    def _optional_timeout(value: Any) -> float | None:
        if value is None:
            return None
        if (
            not isinstance(value, (int, float))
            or isinstance(value, bool)
            or value < 0
        ):
            raise EngineError("invalid_params", "timeout must be a non-negative number")
        return float(value)

    @staticmethod
    def _nonnegative_int(value: Any, name: str) -> int:
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise EngineError("invalid_params", f"{name} must be a non-negative integer")
        return value
