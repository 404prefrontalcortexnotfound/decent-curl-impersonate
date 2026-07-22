# decent-curl-impersonate

A Pi extension that exposes browser-impersonated HTTP and WebSocket tools backed by [`curl_cffi`](https://github.com/lexiforest/curl_cffi). It is intended for interoperating with services that require a current browser TLS/HTTP fingerprint. It is not a browser and doesn't execute JavaScript.

## Requirements and installation

- Pi
- Node.js 22 or later
- [`uv`](https://docs.astral.sh/uv/) and a supported Python 3.13 interpreter
- macOS arm64 or Linux x64 (the release CI platforms)

After this package is published:

```sh
pi install npm:decent-curl-impersonate
```

Start Pi and run `/decent-curl-setup`. This visibly runs `uv sync --frozen --python 3.13 --no-dev` in the installed package and creates its local `.venv` with runtime dependencies only. It does not install the `pytest` or `websockets` development dependencies; WebSocket support at runtime remains provided by `curl_cffi`. The npm package has **no install/postinstall lifecycle hook** and never silently downloads or executes Python dependencies. Run `/decent-curl-status` to see extension, Python, `curl_cffi`, libcurl, and profile information.

For a source checkout:

```sh
npm ci
uv sync --frozen --python 3.13
bun run build
```

## Tools

### `decent_curl_profiles`

- `action: "list"` discovers profiles from the installed `curl_cffi`; profile availability isn't hard-coded.
- `action: "fingerprint"` requests `https://tls.browserleaks.com/json` by default. `profile` and an alternate public HTTP(S) `url` are optional.

```json
{"action":"list"}
```

### `decent_curl_request`

Makes an HTTP request. Required: `url`. Options: arbitrary `method`, `query`, `headers`, Basic or Bearer `auth`, browser `profile`, `http_version` (`auto`, `1.1`, `2`, `3`), `proxy`, `allow_redirects` (`false`, `true`, or `safe`), `max_redirects`, `timeout`, `retries`, `verify`, and `session_id`. Supply at most one body: `json`, `form`, raw text `content`, or `multipart` fields/files.

```json
{
  "url": "https://example.com/api",
  "method": "POST",
  "profile": "chrome136",
  "json": {"hello": "world"},
  "allow_redirects": "safe",
  "timeout": 20
}
```

HTTP/3 works only where the bundled libcurl and network support it. A selected profile must appear in the list action.

### `decent_curl_download`

Streams a GET to disk and returns its path, size, SHA-256, content type, status, final URL, and profile. It accepts the request transport/session options above plus `path` and `overwrite`. An omitted path creates a user-only temporary directory. Parent directories are mode `0700` and downloaded files mode `0600` on POSIX. Existing files aren't replaced unless `overwrite: true`.

```json
{"url":"https://example.com/archive.zip","path":"/tmp/archive.zip"}
```

### `decent_curl_session`

- `create`: creates an in-memory session; optional `profile` becomes its default.
- `list`: lists opaque session IDs and profiles.
- `close`: closes the required `session_id`.

Sessions retain cookies and connections only for the Pi process lifetime.

```json
{"action":"create","profile":"chrome136"}
```

### `decent_curl_websocket`

- `connect`: requires a `ws://` or `wss://` `url`; accepts `headers`, `profile`, `proxy`, `verify`, `timeout`, and `session_id`; returns an opaque `websocket_id`.
- `send`: requires `websocket_id` and exactly one of text `message` or binary `data_base64`; optional `timeout`.
- `receive`: requires `websocket_id`; optional `timeout`; returns UTF-8 text in `message` or binary bytes in `data_base64`.
- `close`: requires `websocket_id`; optional close `code` and `reason`.

```json
{"action":"connect","url":"wss://example.com/socket","profile":"chrome136"}
```

## Privacy and security

The worker keeps cookie values in memory but returns only cookie names/domains. `Authorization`, `Cookie`, `Proxy-Authorization`, and `Set-Cookie` response headers are redacted. Tool metadata excludes authentication values, proxy credentials, query values, outbound bodies/messages, and upload contents. Requested response bodies remain model-visible because returning content is the tool's purpose; oversized bodies spill to a mode-`0600` temporary file. Download paths and response URLs are visible, with URL query/fragment removed from metadata.

Don't put credentials in URLs. TLS verification is on by default; disable `verify` only for controlled testing. `safe` redirects reject redirects to internal/private IP addresses. Cancellation stops Pi waiting for a call, but an already-started libcurl operation may finish in the worker before its result is discarded.

No credentials or sessions are persisted. Worker errors expose stable codes and non-secret curl codes, not request parameters. WebSocket handshake cookies and headers aren't returned.

## Architecture

Pi loads `dist/index.js`. A lazy `WorkerClient` starts the package-local Python module and exchanges correlated newline-delimited JSON over stdin/stdout. TypeScript owns schemas, cancellation, truncation, commands, and lifecycle. Python owns `curl_cffi` sessions, requests, downloads, and opaque WebSocket handles. The worker closes active sockets and sessions on Pi shutdown.

## Limitations

Version 0.1 is HTTP/WebSocket only. It doesn't import browser profiles or encrypted cookies, solve CAPTCHAs, execute JavaScript, emulate user behavior, or support FTP/SFTP. Fingerprint profiles approximate named browser releases; websites can still detect automation or change requirements. No bypass is guaranteed. Use only where you have authorization and comply with service terms.

## Troubleshooting

- **Worker failed to start:** install `uv`, run `/decent-curl-setup`, then `/decent-curl-status`.
- **Unknown profile:** run the profiles list action and use an installed value.
- **TLS/network error:** check proxy settings, system connectivity, and certificate verification. Errors intentionally omit sensitive request details.
- **HTTP/3 failure:** retry with `http_version: "2"`; HTTP/3 depends on network support.
- **Unknown session/WebSocket:** handles are process-local and become invalid after close, worker restart, or Pi shutdown.
- **Setup drift:** remove the package-local `.venv` and rerun `/decent-curl-setup`; the checked-in `uv.lock` is authoritative.

## Development and verification

```sh
uv run pytest python/tests -q
bun test
bun run typecheck
bun run build
npm pack --dry-run --json > /tmp/decent-curl-pack.json
node scripts/verify-package.mjs /tmp/decent-curl-pack.json
```

The network fingerprint test is intentionally opt-in:

```sh
DECENT_CURL_LIVE_TESTS=1 bun test test/live-fingerprint.test.ts
```

Maintainers can run the smoke after its workflow is present on `main` to prove that an explicitly dispatched CI run attaches all three successful checks to the exact pull-request head:

```sh
gh workflow run updater-ci-dispatch-smoke.yml --ref main -f confirm=true
```

The smoke uses only `GITHUB_TOKEN`, creates a uniquely named same-repository branch and disposable pull request containing one exact `uv.lock` marker line, and always attempts to close the pull request without merging and delete the branch. A separate default-branch janitor runs when the smoke completes, including after cancellation or timeout, and independently verifies the completed run before closing the deterministic disposable PR and deleting only its deterministic branch. Maintainers can recover cleanup manually with `gh workflow run updater-ci-dispatch-smoke-cleanup.yml --ref main -f smoke_run_id=<id> -f smoke_run_attempt=<attempt>`. Neither workflow approves, merges, tags, publishes, releases, checks out pull-request code, or invokes an AI service.

Repository rules are a separate trust boundary: `GITHUB_TOKEN` cannot read repository-administration rules, so the smoke does not verify which checks `main` requires. Using an authenticated maintainer/admin `gh` session, separately verify that the effective rules include the three exact context strings:

```sh
repository=404prefrontalcortexnotfound/decent-curl-impersonate
expected='["Test (ubuntu-24.04)","Test (macos-14)","Updater policy"]'
gh api --paginate --slurp "repos/${repository}/rules/branches/main?per_page=100" \
  | jq -e --argjson expected "${expected}" '
      [ .[][]
        | select(.type == "required_status_checks")
        | .parameters.required_status_checks[]?.context
      ]
      | unique as $configured
      | ($expected - $configured | length) == 0
    '
```

A successful query prints `true`; failure or missing contexts returns a nonzero status. Configure the active ruleset and allow GitHub Actions to create and approve pull requests before running the smoke.

## Attribution

Original extension code is MIT licensed; see [LICENSE](LICENSE). It depends at runtime on `curl_cffi` and its bundled curl-impersonate, curl, and BoringSSL components. Exact upstream locks and third-party license information are in [`upstream/`](upstream/) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
