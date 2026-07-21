from decent_curl_impersonate.protocol import failure, redact, success


def test_success_returns_the_exact_success_envelope() -> None:
    result = {"status": 200, "body": "ok"}

    assert success("request-1", result) == {
        "id": "request-1",
        "ok": True,
        "result": result,
    }


def test_failure_returns_the_exact_failure_envelope_without_empty_metadata() -> None:
    expected = {
        "id": "request-2",
        "ok": False,
        "error": {
            "code": "network_error",
            "message": "request failed",
            "retryable": False,
        },
    }

    assert failure("request-2", "network_error", "request failed") == expected
    assert failure("request-2", "network_error", "request failed", metadata={}) == expected


def test_failure_includes_non_secret_metadata_and_retryability() -> None:
    assert failure(
        "request-3",
        "upstream_unavailable",
        "try again",
        retryable=True,
        metadata={"status": 503, "attempt": 2},
    ) == {
        "id": "request-3",
        "ok": False,
        "error": {
            "code": "upstream_unavailable",
            "message": "try again",
            "retryable": True,
            "metadata": {"status": 503, "attempt": 2},
        },
    }


def test_redact_recursively_replaces_sensitive_values_case_insensitively() -> None:
    metadata = {
        "Authorization": "Bearer abc",
        "nested": {
            "COOKIE": "session=abc",
            "list": [
                {"Set-Cookie": "session=abc"},
                {"proxy_password": "proxy-pass"},
                {"Password": "password"},
                {"TOKEN": "token"},
                {"Secret": "secret"},
                {"BoDy": "uploaded bytes"},
            ],
        },
        "status": 401,
    }
    redacted = {
        "Authorization": "[REDACTED]",
        "nested": {
            "COOKIE": "[REDACTED]",
            "list": [
                {"Set-Cookie": "[REDACTED]"},
                {"proxy_password": "[REDACTED]"},
                {"Password": "[REDACTED]"},
                {"TOKEN": "[REDACTED]"},
                {"Secret": "[REDACTED]"},
                {"BoDy": "[REDACTED]"},
            ],
        },
        "status": 401,
    }

    assert redact(metadata) == redacted
    assert failure(
        "request-4",
        "authentication_failed",
        "request failed",
        metadata=metadata,
    )["error"]["metadata"] == redacted
    assert metadata["Authorization"] == "Bearer abc"
