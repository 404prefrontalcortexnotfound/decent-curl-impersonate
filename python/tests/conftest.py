import json
import time
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest


class FixtureHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: object) -> None:
        pass

    def _body(self) -> bytes:
        length = int(self.headers.get("Content-Length", "0"))
        return self.rfile.read(length)

    def _send(
        self,
        status: int,
        body: bytes,
        content_type: str = "application/json",
        headers: dict[str, str] | None = None,
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        try:
            self.wfile.write(body)
        except BrokenPipeError:
            pass

    def _echo(self) -> None:
        body = self._body()
        parsed = urlparse(self.path)
        payload = {
            "method": self.command,
            "query": parse_qs(parsed.query),
            "headers": {name.lower(): value for name, value in self.headers.items()},
            "body": body.decode("utf-8"),
        }
        self._send(200, json.dumps(payload).encode())

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/redirect":
            self._send(302, b"", headers={"Location": "/final"})
        elif parsed.path == "/final":
            self._send(200, b"redirected", "text/plain")
        elif parsed.path == "/slow":
            time.sleep(0.2)
            self._send(200, b"late", "text/plain")
        elif parsed.path == "/very-slow":
            time.sleep(2)
            self._send(200, b"too late", "text/plain")
        elif parsed.path == "/cookie/set":
            self._send(
                200,
                b"set",
                "text/plain",
                {"Set-Cookie": "session=top-secret-cookie; Path=/"},
            )
        elif parsed.path == "/cookie/check":
            seen = "session=top-secret-cookie" in self.headers.get("Cookie", "")
            self._send(200, json.dumps({"seen": seen}).encode())
        elif parsed.path == "/download":
            self._send(200, b"download-payload" * 4096, "application/octet-stream")
        elif parsed.path == "/download-slow":
            data = b"first-chunk"
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(data) + 100))
            self.end_headers()
            self.wfile.write(data)
            self.wfile.flush()
            self.connection.shutdown(1)
        else:
            self._echo()

    do_POST = _echo
    do_PUT = _echo
    do_PATCH = _echo
    do_DELETE = _echo


@pytest.fixture
def http_server() -> Iterator[str]:
    server = ThreadingHTTPServer(("127.0.0.1", 0), FixtureHandler)
    import threading

    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join()


@pytest.fixture
def secure_tmp_path(tmp_path: Path) -> Path:
    tmp_path.chmod(0o700)
    return tmp_path
