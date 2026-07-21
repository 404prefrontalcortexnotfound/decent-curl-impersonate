import json
import os
import queue
import subprocess
import sys
import threading
import time
from pathlib import Path


def start_worker() -> subprocess.Popen[str]:
    root = Path(__file__).resolve().parents[2]
    environment = dict(os.environ)
    environment["PYTHONPATH"] = str(root / "python")
    return subprocess.Popen(
        [sys.executable, "-m", "decent_curl_impersonate"],
        cwd=root,
        env=environment,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )


def send(process: subprocess.Popen[str], request: dict) -> None:
    assert process.stdin is not None
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()


def response_reader(process: subprocess.Popen[str]) -> queue.Queue[dict]:
    responses: queue.Queue[dict] = queue.Queue()
    assert process.stdout is not None

    def read_responses() -> None:
        for line in process.stdout:
            responses.put(json.loads(line))

    threading.Thread(target=read_responses, daemon=True).start()
    return responses


def stop_process(process: subprocess.Popen[str]) -> None:
    if process.poll() is None:
        process.terminate()
        process.wait(timeout=5)


def test_real_worker_jsonl_protocol_and_shutdown() -> None:
    process = start_worker()
    input_lines = [
        "{not-json}",
        json.dumps({"id": "unknown-1", "operation": "does.not.exist", "params": {}}),
        json.dumps({"id": "profiles-1", "operation": "profiles.list", "params": {}}),
        json.dumps({"id": "shutdown-1", "operation": "system.shutdown", "params": {}}),
    ]

    stdout, stderr = process.communicate("\n".join(input_lines) + "\n", timeout=10)

    assert process.returncode == 0, stderr
    output_lines = stdout.splitlines()
    assert len(output_lines) == len(input_lines)
    responses = [json.loads(line) for line in output_lines]
    assert responses[0] == {
        "id": "",
        "ok": False,
        "error": {
            "code": "malformed_json",
            "message": "Input line is not valid JSON",
            "retryable": False,
        },
    }
    assert responses[1]["id"] == "unknown-1"
    assert responses[1]["ok"] is False
    assert responses[1]["error"]["code"] == "unknown_operation"
    assert responses[2]["id"] == "profiles-1"
    assert responses[2]["ok"] is True
    assert responses[2]["result"]["profiles"]
    assert responses[3] == {
        "id": "shutdown-1",
        "ok": True,
        "result": {"shutdown": True},
    }
    assert all(line.startswith("{") and line.endswith("}") for line in output_lines)


def test_worker_error_surfaces_do_not_echo_request_secrets() -> None:
    process = start_worker()
    secrets = {
        "cookie": "private-cookie-value",
        "auth": "private-auth-token",
        "proxy": "private-proxy-password",
        "upload": "private-upload-path",
    }
    lines = [
        json.dumps(
            {
                "id": "bad-1",
                "operation": "request.execute",
                "params": {
                    "url": "https://example.test/",
                    "headers": {"Cookie": f"session={secrets['cookie']}"},
                    "auth": {"type": "bearer", "token": secrets["auth"]},
                    "proxy": f"http://user:{secrets['proxy']}@127.0.0.1:1",
                    "multipart": {
                        "attachment": {"path": f"/missing/{secrets['upload']}.txt"}
                    },
                },
            }
        ),
        json.dumps({"id": "shutdown-2", "operation": "system.shutdown", "params": {}}),
    ]

    stdout, stderr = process.communicate("\n".join(lines) + "\n", timeout=10)

    responses = [json.loads(line) for line in stdout.splitlines()]
    assert process.returncode == 0
    error_response = next(response for response in responses if response["id"] == "bad-1")
    assert error_response["error"]["code"] == "invalid_upload"
    for secret in secrets.values():
        assert secret not in stdout
        assert secret not in stderr
    shutdown_response = next(
        response for response in responses if response["id"] == "shutdown-2"
    )
    assert shutdown_response["ok"] is True


def test_slow_request_is_overtaken_by_fast_request(http_server: str) -> None:
    process = start_worker()
    responses = response_reader(process)
    try:
        send(
            process,
            {
                "id": "slow-1",
                "operation": "request.execute",
                "params": {"url": f"{http_server}/slow"},
            },
        )
        send(process, {"id": "fast-1", "operation": "profiles.list", "params": {}})

        first = responses.get(timeout=2)
        second = responses.get(timeout=2)
        assert first["id"] == "fast-1"
        assert first["ok"] is True
        assert second["id"] == "slow-1"
        assert second["ok"] is True
        assert second["result"]["body"] == "late"

        send(
            process,
            {"id": "shutdown-3", "operation": "system.shutdown", "params": {}},
        )
        assert responses.get(timeout=2)["id"] == "shutdown-3"
        assert process.wait(timeout=2) == 0
    finally:
        stop_process(process)


def test_shutdown_cancels_active_requests_and_remains_responsive(http_server: str) -> None:
    process = start_worker()
    responses = response_reader(process)
    try:
        send(
            process,
            {
                "id": "slow-2",
                "operation": "request.execute",
                "params": {"url": f"{http_server}/very-slow"},
            },
        )
        time.sleep(0.1)
        started = time.monotonic()
        send(
            process,
            {"id": "shutdown-4", "operation": "system.shutdown", "params": {}},
        )

        received = [responses.get(timeout=1), responses.get(timeout=1)]
        elapsed = time.monotonic() - started
        by_id = {response["id"]: response for response in received}
        assert elapsed < 1
        assert by_id["slow-2"]["error"]["code"] == "request_cancelled"
        assert by_id["shutdown-4"] == {
            "id": "shutdown-4",
            "ok": True,
            "result": {"shutdown": True},
        }
        assert process.wait(timeout=1) == 0
    finally:
        stop_process(process)
