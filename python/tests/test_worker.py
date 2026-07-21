import json
import os
import subprocess
import sys
from pathlib import Path


def test_real_worker_jsonl_protocol_and_shutdown() -> None:
    root = Path(__file__).resolve().parents[2]
    environment = dict(os.environ)
    environment["PYTHONPATH"] = str(root / "python")
    process = subprocess.Popen(
        [sys.executable, "-m", "decent_curl_impersonate"],
        cwd=root,
        env=environment,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
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


def test_worker_rejects_invalid_envelopes_without_echoing_secrets() -> None:
    root = Path(__file__).resolve().parents[2]
    environment = dict(os.environ)
    environment["PYTHONPATH"] = str(root / "python")
    process = subprocess.Popen(
        [sys.executable, "-m", "decent_curl_impersonate"],
        cwd=root,
        env=environment,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    secret = "must-not-appear"
    lines = [
        json.dumps({"id": "bad-1", "operation": 7, "params": {"token": secret}}),
        json.dumps({"id": "shutdown-2", "operation": "system.shutdown", "params": {}}),
    ]

    stdout, stderr = process.communicate("\n".join(lines) + "\n", timeout=10)

    responses = [json.loads(line) for line in stdout.splitlines()]
    assert process.returncode == 0
    assert responses[0]["id"] == "bad-1"
    assert responses[0]["error"]["code"] == "invalid_request"
    assert secret not in stdout
    assert secret not in stderr
    assert responses[1]["ok"] is True
