# decent-curl capability inventory (2026-09-27)

Research for issue #32, child of epic #31. Facts only. No judgement, no recommendation.

**Method.** Every row cites a `path:line` in this repository or in Kalevala at `origin/main`
(`08f57fb6`, fetched 2026-09-27). "Tested" names a test present at `main` (`5878f3d`). Live
measurement used real paced requests from Blackfin. No `session-*` command was run; the
issue's "Do not read" list was not read.

**Engine entry point measured.** `scripts/decent-curl-mcp` → `python -m decent_curl_impersonate.mcp_server`
→ `CurlEngine.dispatch` (`python/decent_curl_impersonate/engine.py:109`).

---

| Capability | Interface(s) | `path:line` | Tested (name) | Known limit |
|---|---|---|---|---|
| Profile discovery and validation | all | `engine.py:200`, `engine.py:836` | yes — `test_profiles_are_discovered_from_installed_curl_cffi` | reads `BrowserType.__members__`; 43 profiles, 5 families, measured |
| HTTP GET (default) and arbitrary method | all | `engine.py:494`, `engine.py:681` | yes — `test_get_query_and_result_shape`, `test_put_and_delete_methods` | method is upper-cased; empty string rejected |
| Query parameters | all | `engine.py:726` | yes — `test_get_query_and_result_shape` | forwarded to curl; query values not returned in Pi metadata (`src/schemas.ts:8`) |
| Request headers | all | `engine.py:688` | yes — `test_basic_bearer_and_custom_headers` | names and values must both be `str` |
| Basic and bearer authentication | all | `engine.py:696` | yes — `test_basic_bearer_and_custom_headers` | both halves must be `str`; bearer becomes an `Authorization` header |
| JSON, form and text bodies | all | `engine.py:738` | yes — `test_post_body_modes` | one body type only (`engine.py:684`); text body must be `str` |
| Base64 binary body | all | `engine.py:747` | yes — `test_mcp_request_sends_binary_body_and_custom_headers` | `validate=True`; rejects whitespace and bad padding |
| Multipart upload (file and value parts) | all | `engine.py:757` | yes — `test_multipart_upload_uses_local_file` | file part must be an existing regular file; else `invalid_upload` |
| Retry loop | all | `engine.py:500` | yes — `test_multipart_retry_rebuilds_and_closes_each_mime_once` | retries `RequestsError` only; no backoff; no `Retry-After` |
| HTTP version selection (auto, 1.1, 2, 3) | all | `engine.py:73`, `engine.py:716` | yes — `test_http_version_selectors_map_to_curl_constants_without_live_http3` | `auto` maps to `CurlHttpVersion.NONE`; HTTP/3 not exercised live |
| Redirects, off by default | all | `engine.py:719`, `engine.py:731` | yes — `test_redirects_are_off_by_default_and_safe_is_passed_through` | `max_redirects` untested; `"safe"` private-IP behaviour untested here |
| Named session (cookie and connection reuse) | all | `engine.py:215` | yes — `test_named_session_reuses_cookies_but_never_returns_values` | in-memory only; lost on process exit |
| Session list and close | all | `engine.py:226`, `engine.py:234` | yes — `test_http_mcp_explicit_session_close_releases_the_handle` | close also retires WebSockets bound to the session |
| Unnamed temporary session | all | `engine.py:628` | yes — `test_get_query_and_result_shape` | created and closed per call; no cookie reuse without `session_id` |
| Idle session reap | MCP HTTP | `engine.py:153`, `http_server.py:39` | yes — `test_http_mcp_closes_engine_state_after_idle_timeout` | 1800 s default, swept every 60 s (`http_server.py:38`) |
| Engine shutdown | all | `engine.py:137` | yes — `test_engine_shutdown_closes_active_websockets` | waits on `idle_event`; a held session blocks close |
| Download to disk with SHA-256 | all | `engine.py:518` | yes — `test_download_streams_to_requested_secure_path_and_hashes` | forces `GET` and strips all body keys (`engine.py:531`) |
| Download destination and overwrite | all | `engine.py:537`, `engine.py:565`, `engine.py:601` | yes — `test_download_generates_a_user_only_destination`, `test_download_refuses_overwrite_unless_explicit` | default path is a 0700 temp dir, file 0600; no-overwrite uses `os.link` |
| WebSocket connect (ws, wss) | all | `engine.py:262` | yes — `test_websocket_text_binary_timeout_close_and_unknown_handle` | scheme must be `ws`/`wss`; URL credentials rejected |
| WebSocket send (text and binary) | all | `engine.py:340` | yes — `test_websocket_text_binary_timeout_close_and_unknown_handle` | exactly one of `message` or `data_base64` |
| WebSocket receive (text, binary, close frame) | all | `engine.py:380` | yes — `test_websocket_text_binary_timeout_close_and_unknown_handle` | one frame per call; code 1005 when a close frame is under 2 bytes |
| WebSocket close with code and reason | all | `engine.py:422` | yes — `test_websocket_close_unblocks_an_active_receive_with_custom_close_data` | code must be an integer 0–65535 |
| Proxy, per request and per socket | all | `engine.py:732`, `engine.py:282` | no | forwarded to curl; proxy credentials are not redacted in any result |
| TLS verification toggle | all | `engine.py:733` | no | no test names `verify: false` |
| Per-call timeout | all | `engine.py:851` | yes — `test_timeout_has_stable_mapping_without_request_secrets` | must be a non-negative number; `bool` rejected |
| Response header and cookie redaction | all | `engine.py:85`, `engine.py:798`, `engine.py:805` | yes — `test_named_session_reuses_cookies_but_never_returns_values` | 4 header names; cookies return name and domain only |
| Worker-metadata redaction | Pi tool | `protocol.py:21` | yes — `test_redact_recursively_replaces_sensitive_values_case_insensitively` | 8 keys, recursive |
| Body spill file on truncation | Pi tool | `src/tools.ts:283` | yes — `test_spills a body over 50 KB and includes a full-output notice` | head truncation; file 0600 in a 0700 temp dir |
| Non-browser fingerprint warning | Pi tool | `src/tools.ts:135`, `src/tools.ts:278` | yes — `test_returns a machine-visible warning when no browser profile was used` | text only, not a block |
| URL query stripping from Pi metadata | Pi tool | `src/tools.ts:329` | yes — `test_sanitizes request and download result URLs` | scheme, host and path only |
| Stable error codes | all | `worker-client.ts:16` | yes — `test_unknown_session_and_operation_have_stable_errors` | 18 codes; unknown codes collapse to `worker_error` |
| Retryable flag on errors | all | `engine.py:826` | yes — `test_failure_includes_non_secret_metadata_and_retryability` | true for `timeout` and `network_error` |
| Fingerprint diagnostic | all | `engine.py:253` | yes — `test_fingerprint_diagnostic_uses_request_result_shape` | default probe `tls.browserleaks.com/json`, forced 30 s timeout |
| Worker restart after one crash | Pi tool | `src/worker-client.ts:260` | yes — `test(restarts once after a worker crash)` | `failedPermanently` after 2 crashes; 2 s shutdown timeout |
| Cancel a call in flight | Pi tool | `src/worker-client.ts:192` | yes — `test(rejects a cancelled call and ignores its later response)` | Pi tool only; no engine-level abort |
| MCP stdio server (11 tools) | `scripts/decent-curl-mcp` | `mcp_server.py:51` | yes — `test_http_mcp_initializes_and_matches_stdio_tools` | protocol `2025-06-18`; `additionalProperties: true` on request and download |
| MCP Streamable HTTP server | `scripts/run-decent-curl-service` | `http_server.py:150` | yes — `test_http_mcp_sends_binary_body_and_custom_headers` | loopback only unless container mode; 32 MiB body cap |
| Health endpoint | HTTP service, container | `http_server.py:135` | yes — `test_healthz_returns_json` | no authentication |
| Article fetch API `/v1/fetch` | HTTP service, container | `fetch_api.py:87` | yes — `test_container_auth_and_no_mcp` | bearer token required; POST only; upstream GET only |
| Fetch profile ladder and per-host pacing | `/v1/fetch` | `fetch_api.py:116`, `fetch_api.py:123` | yes — `test_ladder_redirect_upgrade_and_stop` | 1–6 profiles, default `['chrome146','safari2601','firefox147']`; 3.0 s per host |
| Redirect walk, HTTPS upgrade, public-address check | `/v1/fetch` | `fetch_api.py:44`, `fetch_api.py:118`, `fetch_api.py:39` | yes — `test_url_upgrade_and_credentials_rejected` | 11 hops; every hop re-resolved and `is_global` checked; standard ports only |
| Page classification and article identity | `/v1/fetch` | `fetch_api.py:50`, `article_verifier.py:18`, `article_verifier.py:33` | yes — `test_labels_require_article_evidence` | 9 labels; 7 WAF vendors by string match; needs 700+ chars of paragraph text |
| CLI shim GET, HEAD, text, raw | skill `cli.sh` | `/Users/bo/.agents/skills/decent-curl/cli.sh:9` | no | GET only; 30 s timeout; no session, download or WebSocket |
| CLI shim `profiles` | skill `cli.sh` | `/Users/bo/.agents/skills/decent-curl/cli.sh:57` | no | reads `BrowserTypeLiteral` directly, not the engine |
| CLI shim `session-*` | skill `cli.sh` | `/Users/bo/.agents/skills/decent-curl/cli.sh:83` | no | macOS only; decrypts Chrome Safe Storage; not run in this research |
| LaunchAgent install and check | `scripts/install-launch-agent` | `launch_agent.py:55` | yes — `test_installer_renders_selected_port_and_check_reports_urls` | macOS; label `tech.decent.decent-curl` |
| MCP registration for three agents | `scripts/register-mcp-service` | `registration.py:157` | yes — `test_registration_check_mode_accepts_all_three_http_entries` | needs `claude`, `codex`, `grok`; rolls back on failure |
| Rotating bounded service log | `scripts/run-decent-curl-service` | `http_server.py:43` | yes — `test_service_logs_rotate_and_stay_bounded` | 5 MiB × 3 in `~/Library/Logs/decent-curl` |
| Container mode (no `/mcp`) | Dockerfile | `http_server.py:137`, `Dockerfile:8` | yes — `test_container_auth_and_no_mcp` | exposes only `/healthz` and `/v1/fetch` |
| Extension status and setup commands | Pi tool | `src/index.ts:48`, `src/index.ts:61` | yes — `test(reports package, environment, curl versions, and profile count)` | visible `uv sync`; 1 MiB capture cap |

---

## 2. Interfaces

### 2.1 Pi extension tool (`src/`)

One tool, `decent_curl`, with an `{operation, args}` envelope (`src/tools.ts:37`) over
12 operations (`src/tools.ts:42`). Each maps to a `WorkerClient` call over
newline-delimited JSON to `python -m decent_curl_impersonate`
(`src/worker-client.ts:84`); renderers are at `src/tools.ts:224`.

Two slash commands: `/decent-curl-setup` runs `uv sync --frozen --python 3.13 --no-dev`
visibly (`src/index.ts:53`); `/decent-curl-status` reports Python, `curl_cffi` and
libcurl versions and the profile count (`src/index.ts:10`). The worker stops on
`session_shutdown` (`src/index.ts:85`).

### 2.2 MCP stdio server

`python/decent_curl_impersonate/mcp_server.py`. Protocol `2025-06-18`, server name
`decent-curl`, version `0.2.2` (`mcp_server.py:26`). 11 tools, all thin wrappers over
`CurlEngine.dispatch` (`mcp_server.py:51`). Handlers `initialize`, `ping`, `tools/list`,
`tools/call`; `resources/list` and `prompts/list` return empty (`mcp_server.py:340`).
Requests run concurrently, so a slow fetch does not block later calls
(`mcp_server.py:402`). `EngineError` becomes a structured error; any other exception
becomes `internal_error` with only the class name on stderr (`mcp_server.py:313`).
Instructions tell the agent to prefer this over shell `curl` (`mcp_server.py:30`).

### 2.3 MCP Streamable HTTP service

`python/decent_curl_impersonate/http_server.py`. Binds `127.0.0.1` port `8765` by
default; a non-loopback `DECENT_CURL_HTTP_HOST` is refused (`service_settings.py:33`).
`DECENT_CURL_CONTAINER=1` binds `0.0.0.0` and requires `DECENT_CURL_FETCH_TOKEN`
(`service_settings.py:29`); in that mode only `/healthz` and `/v1/fetch` are served and
`/mcp` is dropped (`http_server.py:137`). Otherwise the official SDK app is mounted at
`/mcp` with a 32 MiB body limit (`http_server.py:150`, `http_server.py:37`). The engine
lives in the lifespan and is closed on shutdown (`http_server.py:105`).

### 2.4 Article fetch API `/v1/fetch`

`python/decent_curl_impersonate/fetch_api.py`, mounted only in container mode
(`http_server.py:136`). It walks a profile ladder, paces each host and follows
redirects manually so every hop is re-validated. `article_verifier.py` decides whether a body is an article from its
title, paragraph text, canonical link and URL-word identity (`article_verifier.py:33`).
It extracts no subscriber JSON (`article_verifier.py:35`).

### 2.5 CLI shim

`/Users/bo/.agents/skills/decent-curl/cli.sh` and `mcp.sh`, outside this repository. 8
commands (`cli.sh:9`): `get`, `head`, `text`, `raw`, four `session-*` variants and
`profiles`. Default profile `chrome146`, fixed 30 s timeout, fixed navigation headers
(`cli.sh:72`). `head` redacts 4 header names (`cli.sh:195`).
`session-*` reads Chrome's cookie database, derives the key from the login Keychain via
`security find-generic-password`, decrypts with `CCCrypt`, and never prints the values
(`cli.sh:83`). It refuses to run off macOS (`cli.sh:84`). Not run in this research.

### 2.6 Local service management

`launch_agent.py` renders `launchd/tech.decent.decent-curl.plist.template` and installs
it at 0600 (`launch_agent.py:96`). The plist sets `RunAtLoad`, `KeepAlive`, a 10 s
throttle, and discards stdout and stderr
(`launchd/tech.decent.decent-curl.plist.template:22`). `registration.py` registers the
HTTP MCP URL with `claude`, `codex` and `grok`, snapshots `~/.claude.json`,
`~/.codex/config.toml` and `~/.grok/config.toml`, and restores all three on failure
(`registration.py:157`); it supports `--check` and `--dry-run` (`registration.py:108`).

---

## 3. Engine behaviour worth recording

- Sessions: an absent `session_id` creates and closes a fresh `AsyncSession` inside the
  call (`engine.py:628`), so cookie persistence needs a named session.
- Timeouts: `timeout` must be a non-negative number and `bool` is rejected
  (`engine.py:851`). No separate connect, read or total-timeout knob exists.
- Limits: no maximum body, header or response size in the engine. The Pi tool truncates
  for display only (`src/tools.ts:273`). The worker client caps one protocol line at 10 MiB
  (`src/worker-client.ts:14`).
- Encoding: a body that will not decode is returned as base64 (`engine.py:796`).
- Cookies: results carry name and domain only (`engine.py:818`).
- No JavaScript and no DOM (`src/tools.ts:138`, `mcp_server.py:40`).

---

## 4. Cluster deployment (Kalevala `origin/main`)

Two identical deployments, both `ghcr.io/404prefrontalcortexnotfound/decent-curl-impersonate@sha256:cd7b70d30f73ef36bdf8e97897b0faf24918cd5f98d2e2118e70f0f4d1b68453`.

Manifests: `k8s/apps/pohjola/decent-fetch-eu/deployment.yaml` and
`k8s/apps/linnunrata-v2/decent-fetch-au/deployment.yaml` as listed in
their own `services.yaml`, `network-policy.yaml`, `infisical-secret.yaml`,
`namespace.yaml` and `kustomization.yaml`. "Same" below means identical values.

| Fact | `decent-fetch-eu` (pohjola) | `decent-fetch-au` (linnunrata-v2) |
|---|---|---|
| Namespace | `decent-fetch`, `pod-security.kubernetes.io/enforce: restricted` | same |
| Replicas, strategy | 1, `Recreate` | 1, `Recreate` |
| Port | 8765 TCP | 8765 TCP |
| Resources | requests 100m / 128Mi, limits 1 CPU / 512Mi | same |
| Pod security | non-root 10001, `RuntimeDefault` seccomp, no SA token, read-only rootfs, all capabilities dropped | same, plus `topology.kubernetes.io/zone: home1` |
| Volumes | `emptyDir` 32Mi logs + 32Mi `/tmp` | same |
| Probes | HTTP `/healthz`, liveness `initialDelaySeconds: 10` | `exec` python `urlopen` on `/healthz`, `timeoutSeconds: 3` |
| Service | ClusterIP `decent-fetch-eu`, selector `region: eu`, `service.cilium.io/global: "true"` | ClusterIP `decent-fetch-au`, selector `region: au`, global |
| Cross-cluster peer | `decent-fetch-au` Service, no selector, `service.cilium.io/affinity: "remote"` | `decent-fetch-eu` Service, no selector, affinity `remote` |
| Ingress from | only `phoapp` worker pods on pohjola, TCP 8765, Cilium policy | same |
| Egress | DNS to `kube-dns` 53 UDP/TCP; public IPv4 and IPv6 on 80 and 443 only, private and link-local ranges excluded | same |
| Secret | `InfisicalSecret` `decent-fetch`, project `decent-infra-b-gw-h`, path `/decent-fetch`, key `DECENT_CURL_FETCH_TOKEN`, resync 60 s | same, `envSlug: pohjola` |

The container sets `DECENT_CURL_CONTAINER=1` (`Dockerfile:8`), so it serves `/healthz` and
`/v1/fetch` only (`http_server.py:137`). There is no Ingress, Gateway or TLS termination
in the manifests.

**Live read-only check, 2026-09-27.** `kubectl --context pohjola get deploy,svc,cnp -n decent-fetch`:
`decent-fetch-eu` 1/1 ready, age 8h, image digest matches; Services
`decent-fetch-eu` 10.125.111.57 and `decent-fetch-au` 10.126.230.216, both 8765/TCP;
`ciliumnetworkpolicy/decent-fetch` valid. `kubectl --context linnunrata-v2 get deploy,svc -n decent-fetch`:
`decent-fetch-au` 1/1 ready, age 8h; Services `decent-fetch-au` 10.103.80.130 and
`decent-fetch-eu` 10.99.246.84. Pod `decent-fetch-eu-84b4bbc766-fk22w` on `talos-21u-9pl`,
0 restarts. No cluster `/v1/fetch` call was made; that needs the shared bearer token.

---

## 5. Measurements

**Tests, 2026-09-27, this worktree at `5878f3d`.**

- `uv sync --frozen` then `.venv/bin/python -m pytest -q -p no:cacheprovider` → **96 passed**, 0 failed, 0 skipped, 20.78 s. Matches the brief.
- `bun install --frozen-lockfile` then `bun test` → **65 pass, 1 skip, 0 fail**, 236 assertions, 618 ms, 5 files. Matches PR #19. The skip is `live-fingerprint.test.ts:7`, which needs `DECENT_CURL_LIVE_TESTS=1`.

**One real GET through the engine, `https://example.com`, `profile: chrome146`.**

```
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"decent_curl_request",
   "arguments":{"url":"https://example.com","profile":"chrome146","timeout":30}}}' \
  | ./scripts/decent-curl-mcp
```

Result: `isError: false`, `status 200`, `http_version 2`, `body_encoding utf-8`,
`elapsed_ms 156.526`, 559 body bytes, `server: cloudflare`, no cookies.

**Five more through one named session**, paced at 1 per second: five consecutive
`status 200`, `http_version 2`, 559 bytes, 0 cookies each; 44.9 ms, 21.8 ms, 18.4 ms,
16.0 ms, 14.8 ms. `decent_curl_profiles_list` returned 43 profiles across
`['chrome', 'edge', 'firefox', 'safari', 'tor']`. `decent_curl_session_close` returned
`closed: true`.

**`/v1/fetch` against a local service** on `127.0.0.1:8791`
(`./scripts/run-decent-curl-service`, `DECENT_CURL_FETCH_TOKEN` set), driven by the engine's
own worker loop:

| Probe | Result |
|---|---|
| `GET /healthz` | 200 `{"status":"ok"}` |
| `POST /v1/fetch` with no `Authorization` | 401 `{"error":"unauthorized"}` |
| `POST /v1/fetch` for `https://example.com`, `profiles: ["chrome146"]` | 200; `label: blocked`, `blocker: non_article_landing`, `http_version: 2`, `bytes: 559`, `final_url: https://example.com/`, `https_upgrades: []`, 1 attempt, 53 ms |
| Same, with `Set-Cookie` in the upstream response | header absent from the result map; remaining keys `content-length`, `content-type`, `date`, `server` |
| `POST /v1/fetch` for `http://127.0.0.1:22/` | 400 `{"error":"invalid fetch request or non-public URL"}` |

`example.com` is `blocked` because `article_verifier.py:38` requires article evidence and
a 559-byte placeholder page has none.

---

## 6. Not measured

- `session-*` CLI shim commands (forbidden by the brief).
- Any live HTTP/3 request; the version map is tested only as constants.
- `max_redirects`, `verify: false`, and the `proxy` parameter have no test and were not
  exercised live.
- A `cf_clearance` challenge round trip: no WAF-protected host was requested.
- The `decent_curl` Pi tool itself was not loaded into a Pi host; its behaviour here comes
  from `bun test` and from the shared worker it drives.
- Any request to the cluster services.

