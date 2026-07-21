"""Asynchronous newline-delimited JSON worker loop."""

from __future__ import annotations

import asyncio
import json
import sys
from typing import Any, TextIO

from .engine import CurlEngine, EngineError
from .protocol import failure, success


async def run_worker(
    input_stream: TextIO = sys.stdin,
    output_stream: TextIO = sys.stdout,
    error_stream: TextIO = sys.stderr,
) -> None:
    """Read one request per line and emit exactly one JSON response per line."""
    engine = CurlEngine()
    write_lock = asyncio.Lock()

    async def write(response: dict[str, Any]) -> None:
        serialized = json.dumps(response, ensure_ascii=False, separators=(",", ":"))
        async with write_lock:
            output_stream.write(serialized + "\n")
            output_stream.flush()

    try:
        while True:
            line = await asyncio.to_thread(input_stream.readline)
            if line == "":
                break
            try:
                request = json.loads(line)
            except (json.JSONDecodeError, UnicodeDecodeError):
                await write(
                    failure("", "malformed_json", "Input line is not valid JSON")
                )
                continue

            request_id = request.get("id", "") if isinstance(request, dict) else ""
            if not isinstance(request_id, str):
                request_id = ""
            if (
                not isinstance(request, dict)
                or not request_id
                or not isinstance(request.get("operation"), str)
                or not isinstance(request.get("params", {}), dict)
            ):
                await write(
                    failure(request_id, "invalid_request", "Invalid request envelope")
                )
                continue

            operation = request["operation"]
            if operation == "system.shutdown":
                await engine.close()
                await write(success(request_id, {"shutdown": True}))
                return

            try:
                result = await engine.dispatch(operation, request.get("params", {}))
                response = success(request_id, result)
            except EngineError as error:
                response = failure(
                    request_id,
                    error.code,
                    str(error),
                    retryable=error.retryable,
                    metadata=error.metadata,
                )
            except Exception as error:
                print(
                    f"worker request failed: {type(error).__name__}",
                    file=error_stream,
                    flush=True,
                )
                response = failure(
                    request_id,
                    "internal_error",
                    "Internal worker error",
                )
            await write(response)
    finally:
        await engine.close()
