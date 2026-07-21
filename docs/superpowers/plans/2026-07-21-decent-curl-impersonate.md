# decent_curl_impersonate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and package a native Pi extension that exposes browser-impersonated HTTP, sessions, downloads, profiles, diagnostics, and WebSockets through a persistent `curl_cffi` Python worker.

**Architecture:** Pi loads a TypeScript extension that lazily supervises a newline-delimited JSON Python worker. The worker owns `curl_cffi` state; the extension owns typed Pi tools, lifecycle, cancellation, truncation, and rendering.

**Tech Stack:** TypeScript, Bun, Pi Extension API, TypeBox, Python 3.13, `uv`, `curl_cffi==0.15.0`, pytest.

## Global Constraints

- Package/repository name is `decent-curl-impersonate`; Pi tool prefix is `decent_curl_`.
- Runtime must not require access to a private repository.
- `curl_cffi` is pinned exactly to `0.15.0`; Python requirement is `>=3.13,<3.15`.
- No npm lifecycle script may bootstrap Python or download runtime dependencies silently.
- Cookie values, authorization values, proxy credentials, and uploaded file contents must never appear in worker error metadata, Pi tool-result details, or logs.
- Model-visible output is capped at 50 KB or 2,000 lines; overflow is written to a user-only temporary file.
- Chrome cookie/profile import, password extraction, CAPTCHA solving, JavaScript execution, and non-HTTP curl protocols are out of scope.
- Every behavior change follows red-green-refactor test-driven development.

---

### Task 1: Package scaffold and protocol contract

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `pyproject.toml`
- Create: `uv.lock`
- Create: `src/protocol.ts`
- Create: `python/decent_curl_impersonate/__init__.py`
- Create: `python/decent_curl_impersonate/protocol.py`
- Create: `test/protocol.test.ts`
- Create: `python/tests/test_protocol.py`

**Interfaces:**
- Produces TypeScript `WorkerRequest`, `WorkerSuccess`, `WorkerFailure`, `WorkerResponse`, and `WorkerOperation` types.
- Produces Python `success(id, result)` and `failure(id, code, message, retryable=False, metadata=None)` functions.
- `WorkerOperation` is the exact union from the design: profile, request, download, session, WebSocket, diagnostic, and shutdown operations.

- [ ] **Step 1: Write failing TypeScript protocol tests**

Test that a success response requires `id`, `ok: true`, and `result`; a failure requires `id`, `ok: false`, and a structured error; and all operation names from the design are accepted.

Run: `bun test test/protocol.test.ts`
Expected: FAIL because `src/protocol.ts` does not exist.

- [ ] **Step 2: Implement the TypeScript protocol types and validators**

Use TypeBox schemas for runtime validation and exported static types. Define the stable error shape as `{code: string, message: string, retryable: boolean, metadata?: Record<string, unknown>}`.

Run: `bun test test/protocol.test.ts`
Expected: PASS.

- [ ] **Step 3: Write failing Python protocol tests**

Assert exact dictionaries from `success()` and `failure()`, including omission of empty metadata and recursive redaction of keys matching `authorization`, `cookie`, `set-cookie`, `proxy_password`, `password`, `token`, `secret`, and `body` case-insensitively.

Run: `uv run pytest python/tests/test_protocol.py -q`
Expected: FAIL because the protocol module is incomplete.

- [ ] **Step 4: Implement Python protocol helpers and recursive redaction**

Keep redaction in one `redact(value)` function used by every failure and diagnostic path.

Run: `uv run pytest python/tests/test_protocol.py -q && bun test test/protocol.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Lock dependencies and commit**

Run: `uv lock && npm install --package-lock-only && git add . && git commit -m "feat: define worker protocol and package scaffold"`
Expected: a reproducible Python/npm scaffold with no install hook.

---

### Task 2: Python worker request, profile, session, and download engine

**Files:**
- Create: `python/decent_curl_impersonate/worker.py`
- Create: `python/decent_curl_impersonate/engine.py`
- Create: `python/decent_curl_impersonate/__main__.py`
- Create: `python/tests/test_engine.py`
- Create: `python/tests/test_worker.py`
- Create: `python/tests/conftest.py`

**Interfaces:**
- Produces `CurlEngine.dispatch(operation: str, params: dict) -> Awaitable[dict]`.
- Produces `python -m decent_curl_impersonate`, reading one JSON object per line and writing one response per line.
- Session IDs and WebSocket IDs are opaque UUID strings.
- Request results contain `status`, `reason`, `url`, `headers`, `cookies` as names/domains only, `elapsed_ms`, `http_version`, `profile`, `body`, and `body_encoding`.
- Download results contain `path`, `size`, `content_type`, `status`, `url`, `profile`, and `sha256`.

- [ ] **Step 1: Write failing engine tests using a local HTTP fixture**

Cover GET, POST JSON, form body, raw body, multipart upload, Basic/Bearer headers, redirects, timeout mapping, named-session cookie reuse without cookie values in results, and profile discovery.

Run: `uv run pytest python/tests/test_engine.py -q`
Expected: FAIL because `CurlEngine` does not exist.

- [ ] **Step 2: Implement request normalization and session lifecycle**

Use `curl_cffi.requests.AsyncSession`. Map `http_version` values `auto`, `1.1`, `2`, and `3` to supported curl constants. Use `allow_redirects="safe"` only when explicitly requested as `safe`; otherwise accept true/false. Keep session cookie values internal.

Run: `uv run pytest python/tests/test_engine.py -q`
Expected: request/session tests PASS except download/worker tests not yet implemented.

- [ ] **Step 3: Write failing download tests**

Assert chunked streaming to a requested or generated user-only path, SHA-256 calculation, partial-file cleanup after failure, and refusal to overwrite unless `overwrite: true`.

Run: `uv run pytest python/tests/test_engine.py -q -k download`
Expected: FAIL for missing download behavior.

- [ ] **Step 4: Implement streamed downloads**

Create parent directories with mode `0700`, files with mode `0600`, stream chunks, hash incrementally, and delete partial files on exceptions.

Run: `uv run pytest python/tests/test_engine.py -q`
Expected: all engine tests PASS.

- [ ] **Step 5: Write failing worker-loop tests**

Start the real subprocess, send malformed JSON, unknown operations, one successful profile request, and `system.shutdown`. Assert exactly one JSON response per accepted line and no stdout logging.

Run: `uv run pytest python/tests/test_worker.py -q`
Expected: FAIL because the loop is missing.

- [ ] **Step 6: Implement the asynchronous JSONL worker loop**

Dispatch each request by ID, serialize writes through one lock, log to stderr, and return stable structured errors.

Run: `uv run pytest python/tests -q`
Expected: all Python tests PASS.

- [ ] **Step 7: Commit**

Run: `git add python pyproject.toml uv.lock && git commit -m "feat: add curl cffi worker engine"`

---

### Task 3: TypeScript worker supervisor and Pi tools

**Files:**
- Create: `src/worker-client.ts`
- Create: `src/schemas.ts`
- Create: `src/tools.ts`
- Create: `src/index.ts`
- Create: `test/worker-client.test.ts`
- Create: `test/tools.test.ts`
- Create: `test/fixtures/fake-worker.ts`

**Interfaces:**
- Produces `WorkerClient.start()`, `call(operation, params, signal?)`, and `stop()`.
- Produces tool definitions for `decent_curl_request`, `decent_curl_download`, `decent_curl_session`, `decent_curl_websocket`, and `decent_curl_profiles`.
- Worker launch command is resolved from `DECENT_CURL_PYTHON` when set, otherwise from the package-local `.venv/bin/python` or Windows equivalent.

- [ ] **Step 1: Write failing supervisor tests**

Cover correlation of out-of-order responses, malformed worker output, cancellation, graceful shutdown, one restart after crash, rejection after a repeated crash, and rejection of all pending calls when the worker exits.

Run: `bun test test/worker-client.test.ts`
Expected: FAIL because `WorkerClient` does not exist.

- [ ] **Step 2: Implement `WorkerClient`**

Use `node:child_process.spawn` with an argument array. Parse stdout by lines, keep stderr in a bounded diagnostic tail, and never include request parameters in error strings.

Run: `bun test test/worker-client.test.ts`
Expected: PASS.

- [ ] **Step 3: Write failing Pi tool-schema tests**

Assert all five tools register, schemas accept documented inputs, secret-bearing fields are marked sensitive in descriptions, action enums are finite, and tools dispatch the correct worker operation.

Run: `bun test test/tools.test.ts`
Expected: FAIL because tools are missing.

- [ ] **Step 4: Implement schemas and tool definitions**

Use `StringEnum` where provider compatibility requires it. Keep body choices mutually exclusive: `json`, `form`, `content`, or `multipart`. Return response body as text and non-secret metadata in `details`.

Run: `bun test test/tools.test.ts`
Expected: PASS.

- [ ] **Step 5: Add truncation and secure spill files test-first**

Test 50 KB and 2,000-line boundaries, mode `0600`, full-output notice, and `truncateHead` use for bodies.

Run: `bun test test/tools.test.ts`
Expected: first FAIL, then PASS after implementation using Pi truncation utilities.

- [ ] **Step 6: Implement extension lifecycle and commands**

Register `/decent-curl-setup` and `/decent-curl-status`. Setup runs `uv sync --frozen --python 3.13` visibly. Start the worker lazily and stop it idempotently on `session_shutdown`.

Run: `bun test`
Expected: all TypeScript tests PASS.

- [ ] **Step 7: Commit**

Run: `git add src test package.json package-lock.json && git commit -m "feat: expose curl impersonation Pi tools"`

---

### Task 4: WebSockets, integration tests, packaging, and release readiness

**Files:**
- Modify: `python/decent_curl_impersonate/engine.py`
- Modify: `python/tests/test_engine.py`
- Create: `test/contract.test.ts`
- Create: `test/live-fingerprint.test.ts`
- Create: `README.md`
- Create: `LICENSE`
- Create: `THIRD_PARTY_NOTICES.md`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/publish.yml`
- Create: `scripts/verify-package.mjs`
- Create: `upstream/curl_cffi.lock.json`
- Create: `upstream/curl_impersonate.lock.json`

**Interfaces:**
- Completes WebSocket operations with opaque handles.
- Produces an npm tarball installable with `pi install npm:decent-curl-impersonate` after publication.
- Live tests run only when `DECENT_CURL_LIVE_TESTS=1`.

- [ ] **Step 1: Write failing WebSocket lifecycle tests**

Use a local echo server. Cover connect, text/binary send, receive timeout, close, unknown handle, and worker shutdown closing active sockets.

Run: `uv run pytest python/tests/test_engine.py -q -k websocket`
Expected: FAIL for missing WebSocket implementation.

- [ ] **Step 2: Implement WebSocket operations**

Use `curl_cffi` async WebSocket support when available. Return base64 for binary messages and UTF-8 for text messages. Never return handshake cookie values.

Run: `uv run pytest python/tests -q`
Expected: all Python tests PASS.

- [ ] **Step 3: Write and pass real contract tests**

Start the package-local worker from Bun and exercise profiles, GET, POST, session cookie reuse, download, cancellation, and WebSocket echo through `WorkerClient`.

Run: `bun test test/contract.test.ts`
Expected: first FAIL until integration gaps are fixed, then PASS.

- [ ] **Step 4: Add an opt-in live fingerprint test**

Request `https://tls.browserleaks.com/json` with a dynamically discovered Chrome profile and assert status 200 plus non-empty user agent and JA3/JA4-family fields. Skip unless `DECENT_CURL_LIVE_TESTS=1`.

Run: `DECENT_CURL_LIVE_TESTS=1 bun test test/live-fingerprint.test.ts`
Expected: PASS on a networked development machine.

- [ ] **Step 5: Add public documentation and notices**

Document setup, every tool/action, examples, limitations, privacy/redaction behavior, architecture, troubleshooting, and upstream attribution. Include MIT license text and notices for `curl_cffi`, curl-impersonate, curl, and BoringSSL.

- [ ] **Step 6: Add CI and trusted-publishing workflow**

CI runs deterministic Bun/Python tests on macOS arm64-compatible and Linux x64 runners, plus package verification. Publish triggers only on `v*` tags, requires tests, uses npm provenance, and contains no stored npm token configuration.

- [ ] **Step 7: Verify package contents**

Run: `npm pack --dry-run --json > /tmp/decent-curl-pack.json && node scripts/verify-package.mjs /tmp/decent-curl-pack.json`
Expected: only `dist`, Python runtime files, locks, README, license, and notices are included; no tests, `.venv`, private URLs, or local paths.

- [ ] **Step 8: Run full verification and commit**

Run: `uv run pytest python/tests -q && bun test && bun run typecheck && bun run build && npm pack --dry-run`
Expected: all commands exit 0.

Run: `git add . && git commit -m "feat: complete releasable Pi curl impersonation package"`

---

## Plan self-review

- Spec coverage: all version 0.1 requirements map to Tasks 1-4.
- Scope: Chrome import, CAPTCHAs, JavaScript, behavioural emulation, and non-HTTP protocols remain excluded.
- Type consistency: worker operations, result/error envelopes, tool names, and package names match the design.
- Placeholder scan: no implementation placeholder is permitted; test-first steps state concrete expected behavior and commands.
- Release boundary: publication itself is not automatic during implementation; the reviewed tarball and workflows are prepared first.
