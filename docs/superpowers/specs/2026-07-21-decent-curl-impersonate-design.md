# decent_curl_impersonate Design

## Goal

Ship a public npm Pi package named `decent-curl-impersonate` that exposes browser-impersonated HTTP capabilities through native Pi tools backed by the maintained `curl_cffi` Python library.

The development repository and upstream continuity mirror begin private so development cannot create issues, pull requests, or other noise in upstream projects. Public npm/gallery publication happens only from reviewed release commits.

## Repository topology

- Development repository: `404prefrontalcortexnotfound/decent-curl-impersonate`
- Private upstream mirror: `404prefrontalcortexnotfound/decent-curl-impersonate-upstream`
- Runtime upstream: pinned public `curl_cffi` package and its bundled `libcurl-impersonate`
- The public package must not require access to the private mirror.

The mirror preserves upstream branches and tags but excludes GitHub's synthetic `refs/pull/*` namespace. The development repository records exact upstream versions and license notices rather than vendoring the upstream source tree.

## Scope

Version 0.1 provides browser-impersonated HTTP rather than every protocol supported by the curl command-line client.

Required capabilities:

- discover installed browser profiles dynamically;
- arbitrary HTTP methods;
- query parameters and custom headers;
- JSON, form, raw, and multipart request bodies;
- file uploads and streamed downloads;
- Chrome, Firefox, Safari, Edge, Tor, Android, and iOS profiles when exposed by the installed `curl_cffi` version;
- HTTP/1.1, HTTP/2, and HTTP/3 selection where supported;
- proxy configuration;
- Basic and Bearer authentication;
- redirect, timeout, retry, and TLS-verification controls;
- named in-memory sessions that retain cookies and connections;
- WebSocket connect, send, receive, and close operations;
- low-level curl options through a constrained symbolic option map;
- fingerprint diagnostics against a public test endpoint.

Excluded from version 0.1:

- importing Chrome profiles, encrypted browser cookies, or passwords;
- CAPTCHA solving or JavaScript execution;
- behavioural browser emulation;
- FTP, SFTP, and other non-HTTP protocols;
- silent persistence of credentials or cookie values;
- calls to private upstream issue or pull-request surfaces.

## Architecture

Pi loads a TypeScript extension. The extension lazily starts one Python worker and communicates over newline-delimited JSON on standard input/output. The worker logs only to standard error so logs cannot corrupt the protocol.

The TypeScript layer owns:

- Pi tool schemas and descriptions;
- tool-call cancellation and lifecycle;
- request/response correlation;
- output truncation and temporary-file presentation;
- compact TUI rendering;
- package setup/status commands.

The Python layer owns:

- `curl_cffi` sessions and requests;
- profile discovery;
- body serialization and uploads;
- streamed downloads;
- WebSocket handles;
- cancellation and structured networking errors;
- redaction of cookies, authorization headers, proxy credentials, and request bodies from diagnostics.

The worker protocol uses request IDs and these operations:

- `profiles.list`
- `request.execute`
- `download.execute`
- `session.create`
- `session.list`
- `session.close`
- `websocket.connect`
- `websocket.send`
- `websocket.receive`
- `websocket.close`
- `diagnostic.fingerprint`
- `system.shutdown`

Every response is either `{id, ok: true, result}` or `{id, ok: false, error}`. Errors include a stable code, message, retryable flag, and non-secret metadata.

## Pi tool surface

The package registers five tools:

- `decent_curl_request`
- `decent_curl_download`
- `decent_curl_session`
- `decent_curl_websocket`
- `decent_curl_profiles`

Tool names use underscores; the npm package and repository use hyphens.

The model never receives cookie values, authorization values, proxy passwords, or uploaded file contents through tool-result details. Response bodies remain visible because returning requested content is the purpose of the tool.

## Runtime installation

The npm package includes the TypeScript extension, Python package, `pyproject.toml`, and `uv.lock`. `uv` creates a package-local frozen environment on explicit setup or first use. The stable `curl_cffi` release is pinned exactly.

No npm lifecycle script silently downloads or executes Python dependencies. `/decent-curl-setup` performs setup visibly. `/decent-curl-status` reports the extension version, Python environment, `curl_cffi` version, libcurl version, and available profile count.

The worker starts only when a tool needs it and exits during Pi `session_shutdown`. A crash is restarted once; a repeated crash becomes a visible tool error.

## Output and files

Model-visible output follows Pi's 50 KB or 2,000-line limits. Oversized textual bodies are written to a secure temporary file and the truncated result includes the absolute path. Downloads always stream to disk and return path, size, content type, final URL, status, and selected fingerprint profile.

Temporary directories are user-only. The extension does not delete explicitly downloaded files during session shutdown.

## Testing

Tests are test-first and include:

- Python unit tests for protocol dispatch, request construction, redaction, sessions, downloads, and WebSockets;
- TypeScript unit tests for schemas, worker correlation, cancellation, restart, and truncation;
- contract tests that start the real worker locally;
- local HTTP/WebSocket fixtures for methods, uploads, redirects, cookies, streaming, and errors;
- opt-in live tests for BrowserLeaks-style JA3/JA4/Akamai fingerprints and HTTP/3;
- package smoke tests through `pi -e`;
- macOS arm64 and Linux x64 continuous integration.

Tests must not depend on authentication secrets.

## Packaging and release

The npm package uses:

- package name `decent-curl-impersonate`;
- `pi-package` keyword;
- `pi.extensions` manifest;
- MIT license for original extension code;
- complete third-party notices;
- semantic versioning;
- npm provenance and OpenID Connect trusted publishing;
- exact Git tag/npm version matching;
- package tarball inspection before publication.

The intended installation command is:

```bash
pi install npm:decent-curl-impersonate
```

The package becomes eligible for the Pi package gallery at https://pi.dev/packages after public publication with the required metadata.

## Release acceptance

Version 0.1 is releasable only when:

1. all deterministic unit and contract tests pass;
2. package loading registers all five tools;
3. a live diagnostic proves a current browser profile changes the network fingerprint;
4. sessions retain cookies without exposing values in model-visible details;
5. upload, download, redirect, proxy-argument, cancellation, and WebSocket paths are tested;
6. `npm pack --dry-run` contains only intended files;
7. no private repository URL is required at runtime;
8. independent review finds no critical or important defect.
