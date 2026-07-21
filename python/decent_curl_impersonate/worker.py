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
    active_tasks: dict[str, asyncio.Task[None]] = {}

    async def write(response: dict[str, Any]) -> None:
        serialized = json.dumps(response, ensure_ascii=False, separators=(",", ":"))
        async with write_lock:
            output_stream.write(serialized + "\n")
            output_stream.flush()

    async def dispatch(request_id: str, operation: str, params: dict[str, Any]) -> None:
        try:
            result = await engine.dispatch(operation, params)
            response = success(request_id, result)
        except asyncio.CancelledError:
            await write(
                failure(
                    request_id,
                    "request_cancelled",
                    "Request cancelled during worker shutdown",
                    retryable=True,
                )
            )
            raise
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

    def task_finished(request_id: str, task: asyncio.Task[None]) -> None:
        if active_tasks.get(request_id) is task:
            active_tasks.pop(request_id, None)

    async def cancel_active_tasks() -> None:
        tasks = list(active_tasks.values())
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

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
                await cancel_active_tasks()
                await engine.close()
                await write(success(request_id, {"shutdown": True}))
                return

            if request_id in active_tasks:
                await write(
                    failure(
                        request_id,
                        "duplicate_request_id",
                        "Request ID is already active",
                    )
                )
                continue

            task = asyncio.create_task(
                dispatch(request_id, operation, request.get("params", {})),
                name=f"worker-request-{request_id}",
            )
            active_tasks[request_id] = task
            task.add_done_callback(
                lambda finished, request_id=request_id: task_finished(
                    request_id, finished
                )
            )
            # Let immediately-completing operations publish without delaying input reads;
            # network-bound operations yield back here and continue concurrently.
            await asyncio.sleep(0)

        tasks = list(active_tasks.values())
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    finally:
        await cancel_active_tasks()
        await engine.close()
