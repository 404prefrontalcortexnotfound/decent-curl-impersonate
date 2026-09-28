# Product requirements: one authorized browser-shaped HTTP service

**Status:** proposal for review. Not approved policy.
**Date:** 2026-09-28.
**Issue:** [#46, Redefine product requirements and acceptance criteria from user needs](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/46).
**Parent epic:** [#31, Give agents one browser-shaped HTTP system](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31).
**Basis:** the merged research in [`docs/research/`](../research), the [G1 decision memo](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31#issuecomment-5856676224), and the current source at `main` commit `c6ffff4`.

This document proposes what the product must do. It does not approve a stack, approve the memo's architecture options, close any gate, or retire any capability. Where a value is a threshold rather than a supplied rule, it is marked **proposed** and listed in the [decision register](#17-decision-register-bounded). Missing business policy is recorded as a missing input, not filled in.

---

## 1. What, so what, now what — for a five-year-old

**What.** There is a robot helper in this house. It can go to a website and knock, and the website sometimes lets it in. When it comes back, the helper sometimes says "all good" even when the website actually showed a sign saying "no entry today". Sometimes it forgets the cookies that let it back in. Sometimes two different helpers share the same cookies, and they tread on each other.

**So what.** The helper is good at pretending to be a normal visitor, and bad at telling the truth about what it got. It also forgets how long it may work, how much it may download, and where it is allowed to go. We measured this: of 24 medicine-regulator web pages we tried, only 1 needed the pretending at all. The other 23 were open to anyone who asks nicely. For 20 news feeds, 3 were blocked and 3 more blocked the article itself.

**Now what.** Fix the honesty first, then the limits, then the safety rails, and only then talk about which tools to buy or build. The first small delivery makes the helper say exactly what happened — "I got a page, but it was a locked door, not the article you asked for" — and lets the person who asked decide whether that counts. Nothing gets taken away until a replacement has been shown to work.

---

## 2. What, so what, now what — for a technical reader

**What.** The product is an authorized HTTP (Hypertext Transfer Protocol — the request/response protocol websites and web APIs use) fetch service whose network identity can be shaped to resemble a named browser release. It exists because a small, measured minority of destinations refuse plain clients. Everything else is served by official APIs, bulk files, and feeds.

**So what.** Three properties of the current system make it unsafe to build further on as-is, and all three are visible in source rather than inferred:

1. **Transport success and content success are one field.** [`fetch_api.py:50-78`](../../python/decent_curl_impersonate/fetch_api.py) folds HTTP status, body type, WAF (web application firewall) vendor detection, paywall text, and article heuristics into a single `label`. A working JSON API response is labelled `blocked` because it is not an article. The inventory measured exactly this: `https://example.com` returns `label: blocked`, `blocker: non_article_landing`. The research also records a regulator soft 404 — Medsafe returns HTTP 200 for "Page not found" — so a status code is not a verdict. A caller cannot distinguish "the request worked and gave me something I did not want" from "the request failed".
2. **The bounds the epic asks for do not exist as bounds.** There is no whole-operation deadline: [`engine.py`](../../python/decent_curl_impersonate/engine.py) passes a per-transfer `timeout` to libcurl, and the fetch ladder composes up to 6 profiles × 11 redirect hops × 120 s of that timeout. There is no response byte cap in the engine; the only caps are a 10 MiB protocol line in [`src/worker-client.ts:14`](../../src/worker-client.ts) and a 32 MiB MCP request envelope in [`http_server.py:37`](../../python/decent_curl_impersonate/http_server.py). Concurrency is unbounded per process.
3. **The address controls live on one path, not on the identity.** Public-address checks, standard-port checks, per-host pacing, and HTTPS upgrade exist only inside `FetchAPI` ([`fetch_api.py:30-47`, `:104-159`](../../python/decent_curl_impersonate/fetch_api.py)). The engine request path already rejects a scheme other than HTTP or HTTPS, and it rejects a username or password in the URL ([`engine.py:676-679`](../../python/decent_curl_impersonate/engine.py)). It does not check the port, and it does not check whether the host resolves to a loopback, link-local, or private address. The Pi tool, the MCP stdio server, and the loopback MCP service can still be pointed at those addresses. Pacing is process-local (`self.last` and `self.locks` in `fetch_api.py:84-85`), so with one replica per region a destination reached from both regions receives twice the intended rate.

**Now what.** Land the outcome-honesty change first as a small, independently verifiable, dependency-free slice. Then the deadline, byte, and concurrency bounds. Then move destination restriction onto the identity itself. Then caller identity and session isolation. Only after those are measured should any component substitution be considered, and the memo's options (Crawlee Python, Envoy Gateway, OPA) stay candidates. All 31 functional requirements below state observable behaviour; none of them names a product to buy. Acceptance scenarios are proposed future proof, not claims about software that does not exist yet.

---

## 3. Glossary

Every term below is defined at first use in the body as well. This table is the single lookup point.

| Term | Definition |
| --- | --- |
| **HTTP** | Hypertext Transfer Protocol. The request/response protocol websites and web APIs use. A request carries a method, URL, headers and optional body; a response carries a status code, headers and a body. |
| **TLS** | Transport Layer Security. The protocol that encrypts HTTP and produces a handshake. Website operators can read that handshake and identify the client library. |
| **curl_cffi** | Python bindings to a browser-impersonating native build of libcurl, through a C foreign-function interface (a bridge from Python to compiled C code). It sends HTTP requests with browser-shaped handshakes and headers, supports persistent connections, cookies and WebSockets, and does not execute JavaScript or render pages. Pinned at `0.15.0` in [`pyproject.toml`](../../pyproject.toml) and [`uv.lock`](../../uv.lock). |
| **libcurl** | The native C network-transfer library inside `curl_cffi`. |
| **Fingerprint / impersonation** | The observable network handshake and HTTP behaviour presented to a website: TLS cipher and extension order (measured as JA3 or JA4), HTTP/2 settings and header order, and the user-agent string. "Impersonating" means presenting one of a library's named browser profiles. It is not a person and it does not execute JavaScript. |
| **Browser profile** | A named, versioned imitation of one browser release, for example `chrome146`. Profiles lag the real browser: measured newest available presets trail Chrome stable by 1 to 8 releases ([engines research](../research/2026-09-27-impersonation-engines.md)). |
| **Session** | Retained cookies and connections held in memory for one caller and task. A named session survives across calls; an unnamed one is created and closed inside a single call ([`engine.py:_use_session`](../../python/decent_curl_impersonate/engine.py)). |
| **Cookie jar** | The store of cookies a session keeps, so a site recognises a returning client. |
| **WebSocket** | A two-way connection kept open between client and server, used for live data. |
| **MCP** | Model Context Protocol. An open protocol that lets an agent call tools published by a program. This repository publishes an MCP stdio server and an MCP Streamable HTTP service. |
| **Pi** | The agent host that loads the npm extension in this repository and exposes the `decent_curl` tool. |
| **Proxy** | A server that forwards a connection on a client's behalf. An HTTP `CONNECT` proxy accepts a destination and then relays TLS bytes, so the destination is chosen by the proxy, not the client. |
| **Network exit** | The specific egress path — a country, a provider, or a residential route — that a request leaves from. **Tatu** is the Decent-owned service that provides exits over a standard proxy interface; Tatu owns that interface and this repository does not change it. |
| **SSRF (server-side request forgery)** | Using a service's outbound network position to reach something the caller could not reach directly, for example an internal address or a cloud metadata endpoint. |
| **DNS rebinding** | When a name resolves to a permitted address at check time and a different address at connection time, defeating a check that is not repeated at the dial. |
| **Deadline** | A total time budget for one caller operation, covering all retries, redirects and profile attempts, not just one transfer. |
| **Backpressure** | Refusing or queueing work when capacity is exhausted, instead of accepting it and degrading. |
| **Pacing** | A minimum interval between requests to the same destination, enforced per destination. |
| **WAF** | Web application firewall. A vendor layer that returns an interstitial challenge page instead of the requested content. |
| **Challenge** | An access-verification page returned instead of the requested content, usually with HTTP 403, sometimes with HTTP 200. |
| **Transport outcome** | Whether the request itself completed: bytes moved, HTTP status returned, or a network/TLS/timeout failure. |
| **Content outcome** | Whether the returned body is the content the caller asked for. This is a separate judgement and belongs to the caller. |
| **Crawlee Python** | A maintained Python library providing HTTP clients, a session pool, a request queue, retry and request throttling. A candidate component, not an approved requirement. |
| **Envoy Gateway** | A maintained gateway that authenticates callers (for example JWT validation) and enforces shared rate limits. A candidate component. |
| **OPA (Open Policy Agent)** | A maintained policy decision engine that evaluates supplied policy against a request. It decides; it does not fetch, store sessions, or provision accounts. A candidate component. |
| **Miniflux** | A maintained feed reader with a REST API, proposed by the research as the feed poller. A candidate. |
| **changedetection.io** | A maintained page-change watcher with a REST API and a plain-HTTP fetch mode, proposed for pages that have no feed. A candidate. |
| **Trafilatura** | A maintained HTML-to-text extraction library, proposed for turning a fetched article page into readable text. A candidate. |
| **Temporal** | A maintained durable workflow scheduler already in use in the estate. Scheduling stays with callers, not inside the fetch service. |
| **G1 / G2** | The epic's decision gates. G1 is Ben's architecture and engine decision. G2 is the security review that must precede external network exposure. |
| **Parity ledger** | The record that maps every currently available capability to its replacement state, so nothing is retired silently. |

---

## 4. Users, jobs and problems

### 4.1 Users

| User | What they are | What they need from this product |
| --- | --- | --- |
| **Interactive agent** | Claude, Codex, Grok, OpenCode or Pi on Ben's Macs, acting inside a session. | One call that returns usable bytes, a clear failure, and no leaked secrets in metadata. It must not be a browser. |
| **Unattended job** | A scheduled worker on pohjola or linnunrata-v2, such as the Civitai harvest worker or a news collector, running without a person watching. | The same contract, an opaque request ID, bounded time and bytes, a stable error code, and proof the job did not exceed a destination's patience. |
| **Service operator** | Whoever runs the deployment and the credentials. | Admission limits, revocation, health semantics, and evidence about what the service actually did. |
| **Ben** | Owns the product decisions, the supplied policy, and the budget. | One decision record, and no capability disappearing without his explicit approval. |

### 4.2 Jobs to be done

- *When my agent needs a page that a plain client is refused, get me the content with the right network identity, or tell me clearly that I did not get it.*
- *When a scheduled job runs unattended overnight, keep it inside its time, byte, and rate budget without my involvement.*
- *When two jobs or two agents share one service, prove they cannot see or disturb each other's sessions.*
- *When something fails, tell me what kind of failure it was and whether retrying is sensible, without printing my credentials.*
- *When a dependency needs updating, update it through review, or not at all.*

### 4.3 Problems, with evidence

| # | Problem | Evidence |
| --- | --- | --- |
| P1 | Most destinations do not need a browser identity. 1 of 24 measured regulator endpoints (NMPA, HTTP 412) does; 3 of 20 sampled news feeds are blocked and 3 more block the article. | [Regulatory research §4](../research/2026-09-27-regulatory-monitoring-approach.md), [news research §Measurements](../research/2026-09-27-news-collection-approach.md) |
| P2 | A status code does not prove content. Medsafe returns HTTP 200 for "Page not found". `https://example.com` yields `label: blocked`. | [Regulatory research §2](../research/2026-09-27-regulatory-monitoring-approach.md), [capability inventory §5](../research/2026-09-27-decent-curl-capability-inventory.md) |
| P3 | Cookie continuity is lost on the fetch path. `FetchAPI` calls the engine without `session_id`, so each hop creates and closes a fresh session. | [`fetch_api.py:127-131`](../../python/decent_curl_impersonate/fetch_api.py), [`engine.py:_use_session`](../../python/decent_curl_impersonate/engine.py) |
| P4 | No whole-operation deadline, no response byte cap, no concurrency cap. | [`engine.py:_request_execute`](../../python/decent_curl_impersonate/engine.py), [capability inventory §3](../research/2026-09-27-decent-curl-capability-inventory.md) |
| P5 | Address and port restriction exist only on `/v1/fetch`. The engine rejects a bad scheme and URL credentials (`engine.py:676-679`) and does not reject a non-standard port or a loopback, link-local, or private address. The Pi tool and the MCP service use that engine path. | [`fetch_api.py:30-47`](../../python/decent_curl_impersonate/fetch_api.py) versus [`engine.py:676-679`](../../python/decent_curl_impersonate/engine.py) |
| P6 | One bearer token is not caller identity. Both regions share `DECENT_CURL_FETCH_TOKEN`; ingress admits only `phoapp` worker pods. | [Capability inventory §4](../research/2026-09-27-decent-curl-capability-inventory.md) |
| P7 | Sanitization differs by interface. Pi strips URL query and fragment from metadata ([`src/tools.ts:329`](../../src/tools.ts)); MCP returns the engine result verbatim ([`mcp_server.py:_call_tool`](../../python/decent_curl_impersonate/mcp_server.py)). | Source, as cited |
| P8 | Pacing is per process, and one replica per region means a destination reached from both regions gets twice the interval's worth of traffic. | [`fetch_api.py:82-85`](../../python/decent_curl_impersonate/fetch_api.py) |
| P9 | Retry has no backoff, no `Retry-After` handling, and no idempotency distinction; it retries transport errors only. | [`engine.py:500-509`](../../python/decent_curl_impersonate/engine.py), [capability inventory](../research/2026-09-27-decent-curl-capability-inventory.md) |
| P10 | The installed engine is behind upstream. `curl_cffi 0.15.0` is pinned; stable 0.16.3 offers a newer Chrome preset. | [`uv.lock:166-167`](../../uv.lock), [engines research](../research/2026-09-27-impersonation-engines.md) |
| P11 | The fetch ladder follows at most 10 redirects. On the 11th hop, `redirect < 10` is false, so `fetch_api.py:139-157` assigns `output` from that hop and returns it. The handler answers HTTP 200 with the eleventh-hop result. It does not return `{}`, and it does not return a named exhaustion error. | [`fetch_api.py:113-160`](../../python/decent_curl_impersonate/fetch_api.py) |

### 4.4 Known user journeys

**J1 — Interactive agent, blocked page.** An agent wants a page that a plain client is refused. It calls the service with the URL and its expectation. It gets bytes plus a content assessment, or a named failure. It never writes its own HTTP client.

**J2 — Unattended news collection.** A scheduled worker holds a list of feeds. For each, it prefers a feed, an API or a bulk file. Only when a plain request is refused does it use the browser-shaped path, and it records the refusal as evidence rather than as a transport failure.

**J3 — Two agents, one service.** Agent A and job B call the same service concurrently. Neither can list, read, reuse or close the other's session. Each gets its own request ID in the log.

**J4 — A dependency needs a security fix.** A maintainer proposes an update. Qualification runs on the exact candidate commit, produces evidence, stays disabled, and merges only after independent review of that commit.

**J5 — Something breaks at 03:00.** The operator reads one error code, knows whether a retry is sensible, sees the request ID, and finds no credentials in the log.

---

## 5. Current capabilities, observed 2026-09-28

This section describes what exists. It is kept separate from the proposed requirements in section 10, and it is the baseline for the parity ledger in section 14.

| Capability | Where | Observed behaviour and limit |
| --- | --- | --- |
| Profile discovery and validation | `engine.py`, MCP, Pi | 43 profiles across 5 families enumerated from the installed `curl_cffi`; a selected profile must exist. |
| HTTP methods, query, headers, basic/bearer auth | `engine.py:_request_kwargs` | Method is upper-cased; header names and values must both be `str`; one body form only. |
| JSON, form, text, base64 and multipart bodies | `engine.py:738-757` | Exactly one body; base64 validated; multipart file parts must be existing regular files. |
| Retry | `engine.py:500-509` | Retries transport errors only, with no backoff and no `Retry-After`. |
| Redirect control | `engine.py:719-731` | `false` by default; `true`; `safe` passed to libcurl. `max_redirects` untested in the inventory. |
| Named session, list, close, idle reap | `engine.py:215-247`, `http_server.py:39` | In memory only; 30-minute idle reap, 60-second sweep; close also retires bound WebSockets. |
| Download to disk with SHA-256 | `engine.py:518-608` | Forced `GET`; default 0700 temp directory and 0600 file; no overwrite unless requested. |
| WebSocket connect, send, receive, close | `engine.py:262-440` | `ws`/`wss` only; URL credentials rejected; one frame per receive; close code 0–65535. |
| Fingerprint diagnostic | `engine.py:253` | Probes `https://tls.browserleaks.com/json` by default with a forced 30 s timeout. |
| Response header and cookie redaction | `engine.py:85`, `:798-818` | 4 header names redacted; cookies return name and domain only. |
| Stable error codes with retryability | `worker-client.ts:16`, `engine.py:826-834` | 18 stable codes; unknown codes collapse to `worker_error`; `timeout` and `network_error` are retryable. |
| MCP stdio server, 11 tools | `mcp_server.py` | Protocol `2025-06-18`; concurrent requests; `additionalProperties: true` on request and download schemas. |
| MCP Streamable HTTP service | `http_server.py:150` | Loopback by default; 32 MiB request envelope; container mode drops `/mcp` and serves only `/healthz` and `/v1/fetch`. |
| `POST /v1/fetch` ladder | `fetch_api.py` | One bearer token; 1–6 profiles, default `chrome146,safari2601,firefox147`; 3.0 s per-host interval; follows 10 redirects, then returns the 11th hop as a normal result; 16 KiB request cap; `timeout_s` 1–120 per attempt. |
| Page classification | `article_verifier.py` | 9 labels; 7 WAF vendors by string match; article evidence needs 700+ characters of paragraph text plus identity evidence. |
| Health endpoint | `http_server.py:135` | Unauthenticated `{"status":"ok"}`; liveness and readiness are the same signal. |
| Interface sanitization | `src/tools.ts:329` | Pi strips query and fragment from result URLs. The MCP path does not. |
| Bounded service log | `http_server.py:43` | 5 MiB × 3 in `~/Library/Logs/decent-curl`. |
| Cluster deployment | Kalevala | `decent-fetch-eu` on pohjola and `decent-fetch-au` on linnunrata-v2, one replica each, one shared secret, egress restricted to public IPv4/IPv6 on 80 and 443. |

**Consumers that must keep working during migration:** the Pi extension tool; the MCP stdio server used by Claude, Codex and Grok through `scripts/register-mcp-service`; the loopback MCP service on Ben's Macs; `POST /v1/fetch` callers in the `phoapp` namespace; the shared `decent-curl` skill's `cli.sh` shim outside this repository; and the Civitai harvest worker's use of a `curl_cffi` session with a proxy, bearer authentication and four attempts.

**Not measured, and therefore not claimed:** the `session-*` cookie-reading shim commands; live HTTP/3; `max_redirects`; `verify: false`; the `proxy` parameter; a `cf_clearance` challenge round trip; cross-replica pacing; caller isolation between two callers; and any request to the cluster services.

---

## 6. Weak assumptions in the existing specification

These are the claims this document challenges. They are stated as they appear in epic #31, the memo, or the current code, with the reason and the requirement that replaces them.

| # | Assumption as written | Why it is weak | Replaced by |
| --- | --- | --- | --- |
| A1 | The product is "one browser-shaped HTTP system" ([epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31)). | Measurement inverts the emphasis: 1 of 24 regulator endpoints and 6 of 20 news paths need browser identity. The product's centre of gravity is plain HTTP with a bounded browser-shaped fallback. | FR-01, FR-02 |
| A2 | The service should decide whether the response is the right content. | A shared verdict cannot be correct for both a JSON API and an article. `classify()` already fails this: a valid API response becomes `blocked`. | FR-01, FR-04 |
| A3 | A profile ladder is a sensible retry. | Seven engines tied at 17 of 20 HTTP 200s; the ladder's marginal content gain is unmeasured. HTTP 200 does not establish content success. | FR-04, FR-17 |
| A4 | HTTP 200 means success. | Medsafe returns 200 for "Page not found"; several engines' 200 responses carried challenge content. | FR-01, FR-04 |
| A5 | One bearer token is enough to identify a caller. | A shared secret cannot express two-caller isolation or per-task grants, and cannot be revoked per machine credential. | FR-07, FR-11 |
| A6 | Bounds exist because the code sets `timeout` and paces per host. | `timeout` is per transfer, not per operation; there is no byte or concurrency cap; pacing is per process. | FR-15, FR-18, FR-19, FR-20 |
| A7 | Destination restriction is a property of the fetch endpoint. | It is not a property of the identity. The engine rejects a bad scheme and URL credentials. The engine, the Pi tool and the loopback MCP service still accept a loopback, link-local, or private address, and a non-standard port. | FR-22 |
| A8 | Our service code is the weak part, so substituting maintained components fixes it. | The research itself records that authorization, credential handling, redirect enforcement and shared pacing "remain integration work" and that cross-replica behaviour is not measured. Substitution moves the work; it does not remove it. | FR-20, FR-23, FR-24, and slice 11 as a measured option |
| A9 | Retiring the ladder, the Pi tool, the LaunchAgent, the CLI shim and the registration code is a cleanup task. | Four live consumers depend on those paths, including one outside this repository. Retirement before a tested replacement breaks them silently. | FR-30, FR-31, slice 12 |
| A10 | "Redaction" is one guarantee. | Two interfaces redact differently, and the engine forwards proxy credentials without redacting them in any result. | FR-13 |
| A11 | Retry semantics can stay as they are. | No backoff, no `Retry-After`, no idempotency distinction, and retries are not counted against a destination's pacing on the engine path. | FR-17, FR-20 |
| A12 | A hop past the redirect budget is an ordinary result. | A chain of redirects returns the 11th hop inside an HTTP 200 response. `output` is assigned on that hop. There is no named exhaustion error. | FR-01, FR-16 |

---

## 7. Scope

**In scope.** A versioned request and result contract; separation of transport outcome from content outcome; agent and job interfaces; caller identity and session isolation; credential and privacy handling; redirect, retry, deadline, byte, concurrency and pacing behaviour; network-exit selection; destination restriction; error taxonomy and observability; dependency maintenance for the engine; and a parity-led migration.

**Explicitly out of scope.** JavaScript execution or page rendering; browser automation; CAPTCHA solving or challenge circumvention; guaranteeing that any site is reachable; reaching internal services through the public fetch path; multi-region active-active; paid search and notification products; scheduler and orchestration products; deployment topology, image delivery and cluster desired state (Kalevala owns that); the Tatu network-exit interface (Tatu owns that); and any statement of business policy, budget, licence conclusion or per-site permission that Ben has not supplied.

**Non-goal for this product.** It is not a browser, and it does not attempt to become one. A destination that requires a real browser is reported as `manual_required` and stops, per FR-04.

---

## 8. Priorities

| Priority | Meaning |
| --- | --- |
| **P0** | Required for the product to be safe to build on. Must land before any further capability is added. |
| **P1** | Required for the product to be operable and supportable at more than one caller. |
| **P2** | Valuable, but only after P0 and P1 are measured in production. |

---

## 9. Proposed threshold values

These are **proposed** defaults for review. They are not approved policy, and the service must report a missing or invalid threshold as a configuration error rather than inventing one. Each maps to a decision in section 17.

| Setting | Current | Proposed | Basis |
| --- | --- | --- | --- |
| Whole-operation deadline | none | default 30 s, ceiling 120 s | Matches today's `timeout_s` 1–120 range so no caller has to relearn the scale; applied to the whole operation, not one hop. |
| Request body ceiling (shared service) | 16 KiB on `/v1/fetch` | 64 KiB | Keeps the existing default valid, allows a modest form or query upgrade. |
| Request body ceiling (local agent interface) | 32 MiB MCP envelope | 32 MiB, unchanged | Preserves upload capability; listed in the parity ledger. |
| Response body ceiling | none in the engine | 8 MiB returned inline, remainder spilled to a 0600 file; hard refusal above 64 MiB | 8 MiB is inside today's 10 MiB protocol line, so it is reachable; the spill behaviour already exists in the Pi tool. |
| Response header ceiling | none | 64 KiB | Bounds parser exposure; proposed. |
| Redirect hops | 10 followed, then the 11th hop is returned | 10, enforced on every interface, and a redirect-limit exhaustion is a named error | Keeps the observed hop count of 10. Exhaustion becomes a named error instead of the eleventh hop. |
| Profile ladder length | 1–6, default 3 | Caller-supplied; default 1 unless a reason is given | A ladder is a policy choice; the default should be the cheapest thing that works. |
| Per-destination pacing | 3.0 s, per process | 3.0 s minimum, shared across callers and replicas | Preserves the observed interval; removes the per-process loophole. |
| Caller concurrency | unbounded | 4 in flight per caller, 32 per instance, with backpressure above that | Proposed starting point; to be measured, not assumed. |
| Session idle lifetime | 30 min | 30 min, unchanged | Existing behaviour, preserved. |
| WebSocket limits | none recorded | idle 30 min, message 16 MiB, total lifetime 60 min | Bounded lifetime is new; values proposed. |
| Retries | unbounded, no backoff | 2 attempts, 0.5 s and 1.5 s backoff, `Retry-After` honoured up to the remaining deadline | Bounded and cheap. |
| Engine version | `curl_cffi 0.15.0` | upgrade path to current stable, qualified per FR-29 | [Engines research](../research/2026-09-27-impersonation-engines.md) ranks curl_cffi first for retention. |

---

## 10. Functional requirements

Each requirement states required observable behaviour, the user or outcome it serves, its priority, and the acceptance criteria that prove it. A requirement without a measurable acceptance scenario is not complete.

### 10.1 Outcome honesty and the result contract

**FR-01 — Transport outcome and content outcome are separate, always present fields.**
The result contract carries `transport` (one of `ok`, `http_error`, `network_error`, `timeout`, `rejected`, `expired`) and `content` (one of `unassessed`, `matched`, `not_matched`, `challenge`, `login`, `manual_required`) as distinct fields. A result never encodes a content judgement inside a transport field, and never leaves either field absent.
Serves: every caller, which currently cannot tell a working request from a working request it did not want. P0. Acceptance: UAC-01, UAC-02.

**FR-02 — One versioned contract, three thin adapters.**
A single versioned request and result contract is served over MCP, the Pi tool and a command-line (CLI) adapter. Each adapter is a translation only: it adds no validation outcome, no redaction rule and no field the contract does not define. Any field the contract does not define is rejected with a value-free error.
Serves: agents and jobs, so that no caller needs handwritten transport code. P0. Acceptance: UAC-03, UAC-04.

**FR-03 — Unknown and inapplicable fields fail before work starts.**
An unknown field, a field not applicable to the chosen operation, or a second body when the contract allows one is rejected before any network work begins. The error names the path and the reason and contains no supplied value.
Serves: predictability and the privacy rule in FR-13. P0. Acceptance: UAC-04.

**FR-04 — The service reports content signals; the caller owns the content verdict.**
The service returns machine-checkable content signals: declared content type, byte count, body SHA-256, extracted title, canonical path, and a list of detected challenge vendor markers with the matched evidence excerpt. It does not return a single shared "this is the right content" verdict, and it does not special-case articles. A destination that needs a real browser is reported as `manual_required` and the operation stops.
Serves: every caller, and the measured fact that 23 of 24 regulator endpoints and 14 of 20 news feeds do not need browser identity at all. P0. Acceptance: UAC-02, UAC-05.

**FR-05 — Every result is attributable.**
Every accepted operation returns an opaque request ID. The same ID appears in the caller's result, in structured logs, in error payloads, and in any retry or redirect attempt record. Caller identity in the log is the opaque caller reference, never a supplied field.
Serves: J5 and operator accountability. P0. Acceptance: UAC-06.

### 10.2 Interfaces

**FR-06 — Agent and job interfaces are equivalent in outcome.**
A change in outcome semantics is impossible to ship in one adapter and not the other. Parity is asserted by a test that runs the same input set through every adapter and compares the contract fields.
Serves: J1 and J2, and the measured divergence in FR-13. P0. Acceptance: UAC-03, UAC-07.

**FR-07 — Job interface supports batch submission with per-item outcomes.**
An unattended caller can submit a bounded batch. Each item returns its own result or its own error, one deadline covers the batch, and a single failing item does not abort the others.
Serves: J2. P1. Acceptance: UAC-08.

### 10.3 Caller identity, sessions and isolation

**FR-08 — Session handles are bound to one caller and one task.**
Every session is bound to the calling identity, the task reference, the authorized account reference, the browser profile, and the resolved network exit. A session created by caller A is invisible to caller B: listing, use, and close are all refused with a stable error that reveals nothing about A.
Serves: J3, and the epic's requirement that cross-caller reuse must fail. P0. Acceptance: UAC-09.

**FR-09 — Cookie continuity across a permitted redirect chain is a named outcome.**
Within one operation, a permitted redirect chain uses a single session, so a cookie set on hop 1 is presented on hop 2. The result records whether continuity held. Where continuity cannot hold, the result says so; it does not silently continue with a fresh identity.
Serves: P3, measured as lost continuity. P0. Acceptance: UAC-10, UAC-11.

**FR-10 — Session lifecycle releases resources on expiry, cancellation and shutdown.**
Idle sessions, cancelled operations, explicit close, and process shutdown all release the session's cookies and connections. A session that cannot be released is reported as such rather than leaked. A crash loses in-memory state and the loss is reported, never papered over by silently changing identity.
Serves: J3 and J5. P0. Acceptance: UAC-12.

**FR-11 — Identity and retention policy is a versioned input that fails closed.**
The service consumes a supplied, versioned policy input naming permitted accounts, destinations, regions, retention and budget. When the input is absent, unreadable, expired, or does not cover the request, the request is refused with a named configuration error. The service never invents, defaults, or extends policy.
Serves: the epic's rule that missing policy is reported, not invented. P0. Acceptance: UAC-13.

**FR-12 — Personal-account use is off by default and grant-scoped.**
Using an operator's personal account requires an explicit, task-scoped grant that names the task and an expiry. Without a grant, a personal-account request is refused before any credential is read. Automatic identity rotation is disabled.
Serves: the epic's FS4 and the research constraint that cookie values stay outside agent output. P0. Acceptance: UAC-14.

### 10.4 Credentials and privacy

**FR-13 — Redaction is one rule applied at every interface.**
Authorization, Cookie, Proxy-Authorization and Set-Cookie response headers are redacted; cookies return name and domain only; result URLs keep scheme, host and path and drop query and fragment; proxy credentials never appear in any result, log or trace; and request bodies, upload contents, and outbound WebSocket messages are never included in metadata. This rule is implemented once and applied by every adapter, so the Pi and MCP paths cannot diverge.
Serves: P7, the measured divergence. P0. Acceptance: UAC-15, UAC-16.

**FR-14 — Credentials and personal material stay out of durable stores.**
Logs, traces, metrics labels, error payloads, and any durable queue or scheduler history contain no credential, cookie value, request body, upload content, query string, or personal URL. Personal account material is held only in task-scoped memory.
Serves: the epic's FS4 and the research constraint against putting personal material in workflow history. P0. Acceptance: UAC-17.

### 10.5 Network behaviour and bounds

**FR-15 — One deadline covers the whole operation.**
A single total deadline covers every profile attempt, redirect hop, retry and backoff in one caller operation. When the remaining budget is smaller than the next attempt needs, no new attempt starts. Exceeding the deadline returns `transport: timeout` with the partial attempt record and never an empty success.
Serves: P4, and unattended jobs that must not run forever. P0. Acceptance: UAC-18, UAC-19.

**FR-16 — Redirects are followed manually, bounded, and re-validated at every hop.**
The service does not hand redirect following to the transport library. It follows up to the configured hop limit, re-validates the destination at each hop under FR-22, records every hop, and returns a named error when the hop limit is exhausted. A redirect that cannot be validated stops the operation; it does not continue to the unvalidated target.
Serves: A12 and the SSRF risk of automatic redirect following. P0. Acceptance: UAC-20, UAC-21.

**FR-17 — Retries are bounded, backed off, and typed.**
At most the configured number of attempts, only for retryable classes, with increasing backoff, honouring `Retry-After` up to the remaining deadline. Non-idempotent methods are retried only when the failure occurred before the request was transmitted. Every retry is recorded as an attempt and counted against the destination's pacing under FR-20.
Serves: P9 and FR-15. P0. Acceptance: UAC-22.

**FR-18 — Request, response and header sizes are bounded on every interface.**
The service enforces the request ceiling, the response ceiling, and the header ceiling from section 9 on every interface, not only on `/v1/fetch`. A response above the inline ceiling spills the remainder to a file with owner-only permissions and reports the path; a response above the hard refusal is refused with a named error, not truncated silently.
Serves: P4 and unattended jobs that could otherwise exhaust memory. P0. Acceptance: UAC-23, UAC-24.

**FR-19 — Concurrency is bounded and excess load is refused, not queued indefinitely.**
Each caller and each instance have an in-flight ceiling. Work above the ceiling is refused with a named `rejected` result carrying a retry hint, or queued with a bounded queue and a bounded wait. The service never accepts unbounded work and never silently degrades.
Serves: P4. P0. Acceptance: UAC-25.

**FR-20 — Pacing is per destination and shared across callers and replicas.**
Every attempt to a destination — initial request, redirect hop, retry, and profile attempt — is counted. The minimum interval applies across all callers in the instance and, for the proposed topology, across replicas. The scope of the shared counter is stated explicitly and is proven before horizontal scaling; where a shared counter is not yet available, the limitation is reported rather than assumed away.
Serves: P8, and the epic's rule to state the pacing scope and prove it before adding workers. P0. Acceptance: UAC-26, UAC-27.

**FR-21 — Network exit is configuration, and a required exit failure is a failure.**
Exits are selected by configuration through a standard proxy interface, resolved by the service, and never supplied as raw URLs by callers. When a required exit is unavailable, the operation fails with a named error. It never falls back to direct egress. Tatu owns the exit interface; this product does not change it.
Serves: the epic's FS6. P1. Acceptance: UAC-28.

**FR-22 — Destination restriction is a property of the service, on every interface.**
Every interface enforces: public HTTP and HTTPS schemes only, standard ports only, no credentials in the URL, and every resolved address for every IPv4 and IPv6 answer being globally routable. The check runs before the request and again at connection time and at every redirect hop, so DNS rebinding cannot slip between check and dial. A denied destination returns a named `rejected` result that does not reveal the resolved address. Reaching an internal service requires a separate authorized service, never a bypass of this one.
Serves: P5, the highest-severity finding. The engine already rejects a bad scheme and URL credentials. It does not reject a loopback, link-local, or private address, so the loopback MCP service can be pointed at those addresses. P0. Acceptance: UAC-29, UAC-30, UAC-31.

**FR-23 — WebSocket operations are bounded.**
WebSocket connections have an idle limit, a message-size limit, and a total lifetime limit. A closed or expired handle returns a stable error. Handshake cookies and headers are never returned.
Serves: the existing WebSocket capability, which currently has no recorded lifetime bound. P1. Acceptance: UAC-32.

### 10.6 Errors, observability and health

**FR-24 — One error taxonomy, value-free, with a retry hint.**
Every failure returns a stable code from a published list, a human message that contains no supplied value, a `retryable` flag, and the request ID. Request secrets never appear. Unknown internal failures collapse to one generic code with the exception class name only in the service's own stderr, not in the result.
Serves: J5. P0. Acceptance: UAC-33, UAC-34.

**FR-25 — Observability answers the questions an operator actually asks.**
For each request ID, the service records: attempts with profile, hop, status, elapsed milliseconds and outcome class; the pacing decisions taken; the resolved exit reference; and the final outcome. Counters are bounded in cardinality. Tenant and task identifiers are opaque. Retention of this record is bounded and named.
Serves: J5 and UAC5 of the epic. P1. Acceptance: UAC-35.

**FR-26 — Liveness and readiness are different signals.**
Liveness reports that the process is running. Readiness reports that it can serve: policy input is present and valid, the required exit is resolvable, and the destination-restriction rules are loaded. A failing readiness never reports ready.
Serves: operator decisions during rollout. P1. Acceptance: UAC-36.

### 10.7 Dependency maintenance

**FR-27 — The engine is pinned, and the pin is raised through review.**
The transport engine is pinned to an exact version. A change to that pin requires the qualification in FR-28, an independent review of the exact candidate commit, and a recorded result. A change is refused if it reduces measured content success on the agreed source set.
Serves: P10 and the dependency epic [#20](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/20). P1. Acceptance: UAC-37.

**FR-28 — Weekly dependency qualification stays disabled and evidence-bound.**
Automated qualification remains disabled until an explicit activation decision is recorded. Every test, fingerprint result, advisory check, package check and review is bound to the exact candidate commit; a changed candidate invalidates prior qualification. Reviewer jobs hold read-only permissions. Merging an update never by itself authorises rollout, tagging, publication or deployment.
Serves: issue [#21](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/21), which is unstarted backlog work. P1. Acceptance: UAC-38.

**FR-29 — Profile currency is measured, not assumed.**
The gap between the newest available named profile and current stable Chrome is measured on a schedule and recorded. When the gap exceeds a proposed threshold of 8 releases, that is a finding for review, not an automatic engine change.
Serves: the measured 1-to-8 release lag. P2. Acceptance: UAC-39.

### 10.8 Migration and capability preservation

**FR-30 — The parity ledger is authoritative for retirement.**
Every capability listed in section 5 has a ledger entry naming its consumers, its replacement state, and its rollback path. A capability may be retired only when its replacement has passed the acceptance criteria for the same capability and every named consumer has migrated or has an accepted exception. Research evidence alone never retires an interface.
Serves: A9, and the five live consumers named in section 5. P0. Acceptance: UAC-40, UAC-41.

**FR-31 — Each migration step is independently reversible.**
Every migrated capability has a documented rollback that restores the previous path without a data migration, and a proof that the rollback works. Service is not withdrawn from an existing consumer until that consumer's proof passes.
Serves: A9 and the epic's UAC6. P0. Acceptance: UAC-42.

---

## 11. User acceptance criteria

Each criterion is the concrete evidence by which a user accepts the behaviour. Inputs are realistic. Every criterion states its observable result, its failure behaviour, and a command or check that would prove it. **These scenarios are proposed future proof. They describe software that does not exist yet, and none of them has been run.** Where a scenario depends on a live external site, the site is named from the measured research so the input set is reproducible; each requires the operator's authorisation for that destination.

### 10.1 Outcome honesty and the contract

- **UAC-01 — Two outcomes, one call.** *Input:* one call for `https://example.com/` with no profile, and one call for an authorized JSON API URL. *Result:* the first returns `transport: ok`, `content: not_matched` with signals showing a 559-byte text body; the second returns `transport: ok`, `content: not_matched` with a JSON content type — never `transport` failure and never a shared "blocked" verdict. *Failure:* if a 200 response is reported as a transport failure, the criterion fails. *Proof:* `uv run --frozen pytest python/tests -q -k outcome`, plus one recorded CLI run per input.
- **UAC-02 — A challenge is not a success.** *Input:* a request to a host measured as challenge-protected, using the site's own authorised terms. *Result:* `transport: ok` with the real status, and `content: challenge` naming the detected vendor and the evidence excerpt; the caller can tell this apart from `content: matched`. *Failure:* a challenge reported as `content: matched`. *Proof:* a named test case per vendor marker, and one live record with the body discarded.
- **UAC-03 — One contract through every adapter.** *Input:* the same six-case input set (valid JSON, ordinary page, upload, download, session reuse, unknown field) through MCP, the Pi tool and the CLI. *Result:* identical contract field names, types and outcome classes in all three. *Failure:* any field or outcome class present in one adapter and absent in another. *Proof:* one parity test invoked by `bun test` and `uv run --frozen pytest python/tests -q`.
- **UAC-04 — Unknown fields stop the work.** *Input:* `{"url":"https://example.com","retries":"three","bodyA":1,"json":{},"content":"x"}`. *Result:* a value-free validation error naming the paths, returned before any network activity, with zero destination attempts recorded. *Failure:* any echo of the supplied value, or a network attempt recorded. *Proof:* a test asserting the attempt list is empty.
- **UAC-05 — The caller owns the verdict.** *Input:* a caller that supplies its own must-contain string, the pattern the regulatory research already recommends per source. *Result:* the service returns the signals the assertion needs — body SHA-256, title, canonical path, byte count, content type — and the caller's assertion alone decides pass or fail. *Proof:* one test per source type using a local fixture server, plus the recorded assertion output.

### 10.2 Interfaces and attribution

- **UAC-06 — Every result is traceable.** *Input:* any accepted call. *Result:* a request ID appears in the result, in the structured log line for that call, and in any error payload. *Failure:* a result without an ID, or an ID absent from the log. *Proof:* `rg` the request ID in one captured log file.
- **UAC-07 — Adapter parity under a real failure.** *Input:* a destination that times out, through all three adapters. *Result:* the same `transport: timeout`, the same `retryable: true`, the same error code. *Proof:* the parity test with the timeout fixture.
- **UAC-08 — Batch items are independent.** *Input:* a 20-item batch in which item 7 is a refused destination. *Result:* 19 item results, one named `rejected` item, one batch-level deadline, and no abort of the other items. *Proof:* a test with a 20-item fixture and one denial.

### 10.3 Isolation and sessions

- **UAC-09 — Two callers cannot touch each other.** *Input:* caller A creates a session; caller B lists, uses and closes it. *Result:* B gets a stable error for all three and learns nothing about A; A's session still works afterwards. *Failure:* any success for B, or an error message revealing A's session contents. *Proof:* a two-credential test, and the negative cases named in the epic's UAC5.
- **UAC-10 — Cookie continuity across a redirect.** *Input:* a local fixture server that sets a cookie on hop 1 and redirects to hop 2, which returns 200 only when the cookie is presented. *Result:* one operation, `content: matched`, and the result records that continuity held. *Failure:* a fresh identity per hop, which is the current measured behaviour. *Proof:* a test against the local fixture; no external host needed.
- **UAC-11 — Lost continuity is reported, not hidden.** *Input:* a fixture that expires the session mid-chain. *Result:* the result names session loss and names which hop lost it. *Failure:* the operation continuing as though identity were intact. *Proof:* a test asserting the named field.
- **UAC-12 — Release on every path.** *Input:* expiry, cancellation mid-transfer, explicit close, and process shutdown. *Result:* cookies and connections are released on all four; the result of a cancellation names the release; a shutdown with an in-use session is reported rather than leaked. *Proof:* four tests; the existing idle-reap and shutdown tests remain green.
- **UAC-13 — Missing policy fails closed.** *Input:* a request with the policy input absent, then with an expired version, then with a destination the policy does not cover. *Result:* three named configuration errors and zero destination attempts in all three. *Failure:* any request proceeding on a default. *Proof:* a test asserting zero attempts.
- **UAC-14 — Personal account without a grant is refused.** *Input:* a personal-account request with no grant, then with an expired task-scoped grant, then with a valid one. *Result:* refused, refused, permitted — in that order — with the refusal before any credential is read. *Proof:* a test that fails if a credential accessor is reached before the refusal.

### 10.4 Credentials and privacy

- **UAC-15 — Identical redaction through every interface.** *Input:* one request carrying an `Authorization` header, a bearer token, a cookie, a query string carrying a token, and a proxy URL with embedded credentials, plus a response carrying all four sensitive response headers. *Result:* through MCP, the Pi tool and the CLI, no adapter returns the header values, the cookie values, the query string, the fragment, or the proxy credentials. *Failure:* any one adapter echoing any of them. *Proof:* one test per adapter; the existing redaction tests remain green.
- **UAC-16 — The divergence specifically.** *Input:* a result whose final URL contains `?token=…#frag` plus a proxy URL with credentials, through the MCP path specifically. *Result:* the URL is reduced to scheme, host and path, and the proxy credentials are absent, matching the Pi path. *Failure:* the current behaviour, where the MCP path returns the engine result verbatim. *Proof:* a test that runs the same result through both adapters and compares.
- **UAC-17 — No personal material in durable stores.** *Input:* one operation with a credential, a body and a personal URL, then an inspection of logs, traces, metric labels and any queue or scheduler history. *Result:* none of the material appears. *Failure:* any occurrence, including inside an error payload. *Proof:* a test that asserts a scrubbed log fixture contains none of the seeded values.

### 10.5 Bounds and network behaviour

- **UAC-18 — The deadline covers the whole operation.** *Input:* a local fixture that stalls on every hop, with a deadline of 5 s and a per-transfer timeout of 30 s. *Result:* the operation returns `transport: timeout` at about 5 s, with the partial attempt record, and no new attempt starts after the budget is spent. *Failure:* a total near 30 s, or an attempt beginning after expiry. *Proof:* a test asserting wall-clock under 6 s and a zero post-expiry attempt count.
- **UAC-19 — An exhausted redirect budget is a named error.** *Input:* the redirect-budget case in FR-16, a fixture chain one hop past the configured limit. *Result:* a named error naming the hop limit. *Failure:* today's behaviour, where `fetch_api.py:113-160` returns the eleventh hop as a normal result inside HTTP 200. *Proof:* a test against a 12-hop fixture.
- **UAC-20 — Redirects are re-validated at every hop.** *Input:* a fixture that answers hop 1 with a redirect to a loopback address, then a fixture that answers hop 1 with a redirect to a public address. *Result:* the first is refused with a named `rejected` result and no connection to the loopback address; the second proceeds and is recorded. *Proof:* two tests; the refusal test asserts zero connection attempts to the denied address.
- **UAC-21 — No transport-level redirect following.** *Input:* a request with redirects enabled. *Result:* each hop appears in the attempt record, proving the service followed them rather than the library. *Failure:* a hop count of 1 when the fixture chain has 3. *Proof:* a test asserting the hop list length.
- **UAC-22 — Retries are bounded and typed.** *Input:* a fixture that fails twice with a retryable error and then succeeds; and a fixture that returns `Retry-After: 2`. *Result:* three attempts with increasing backoff, at most the configured count, and the `Retry-After` honoured within the remaining deadline. A non-idempotent method that already transmitted is not retried. *Proof:* tests asserting the attempt list and the elapsed time.
- **UAC-23 — Request ceiling is enforced everywhere.** *Input:* one byte above the configured request ceiling on each interface. The proposed shared-service ceiling is 64 KiB, so that input is 64 KiB + 1 byte. The proposed local ceiling for MCP and the Pi tool is 32 MiB, so that input is 32 MiB + 1 byte. *Result:* a named refusal on every interface at that interface's ceiling. *Failure:* acceptance of a body above that interface's ceiling. *Proof:* one test per interface.
- **UAC-24 — Response ceiling spills, then refuses.** *Input:* a 20 MiB response, then a 128 MiB response. *Result:* the first spills the remainder to an owner-only file and reports the path and the SHA-256; the second is refused with a named error and no partial body is presented as complete. *Proof:* two tests asserting file mode and the refusal.
- **UAC-25 — Concurrency is bounded and excess is refused.** *Input:* 40 concurrent calls from one caller against a fixture. *Result:* at most the caller ceiling run at once, the rest refused with a retry hint, and no unbounded queue growth. *Proof:* a test asserting the peak in-flight count and the refusal count.
- **UAC-26 — Every attempt counts against pacing.** *Input:* one operation with 2 redirects and 1 retry to the same fixture host, plus a second operation to the same host 1 s later. *Result:* the second operation waits for the remaining interval; the interval is measured from the last attempt, not the first. *Proof:* a test asserting the observed gap.
- **UAC-27 — The pacing scope is stated and proven.** *Input:* two instances, or two replicas, hitting the same destination. *Result:* either the shared interval holds, or the service reports which scope it enforces. *Proof:* a two-instance test, or an explicit named limitation recorded before horizontal scaling. This is the epic's requirement to prove the scope before adding workers.
- **UAC-28 — A required exit failure is a failure.** *Input:* configuration requiring an exit, with that exit unavailable. *Result:* a named error naming the exit reference, and zero direct-egress attempts. *Failure:* a successful direct request. *Proof:* a test asserting zero direct connection attempts.
- **UAC-29 — Destination restriction on every interface.** *Input:* loopback, link-local metadata, a private RFC 1918 address, a non-standard port, and a URL with embedded credentials — through MCP, the Pi tool and the shared service. *Result:* a named `rejected` result on every interface, with the resolved address not disclosed. *Failure:* the engine path accepts loopback, link-local, private, and non-standard-port targets. Embedded credentials are already rejected at `engine.py:678-679`. `/v1/fetch` already rejects all five inputs. *Proof:* one test per input per interface.
- **UAC-30 — Rebinding is caught at the dial.** *Input:* a fixture name that resolves to a public address at check time and a private address at connection time. *Result:* the connection is refused and the rebinding is recorded. *Failure:* a connection to the private address. *Proof:* a test with a stub resolver and a second lookup.
- **UAC-31 — Denied results disclose nothing.** *Input:* a denied destination. *Result:* the error names the rule, not the address, the port, or the resolved value. *Proof:* a test asserting the message content.
- **UAC-32 — WebSocket bounds hold.** *Input:* a socket that stays idle past the idle limit, sends a message above the size limit, and runs past the lifetime limit. *Result:* three named closures with stable errors, and no handshake cookie or header in any result. *Proof:* three tests.

### 10.6 Errors, observability, health

- **UAC-33 — The error taxonomy is closed and value-free.** *Input:* each published error code plus an induced unknown internal failure. *Result:* every code returns its documented retry hint; the induced failure collapses to the generic code with no request detail. *Proof:* one test per code, plus the existing 18-code test remaining green.
- **UAC-34 — Retrying is advised correctly.** *Input:* a timeout, a network error, a 403 challenge, a 429, and a validation refusal. *Result:* retryable is true only for the timeout and the network error, and a 429 honours `Retry-After`. *Proof:* a table-driven test.
- **UAC-35 — One request ID answers the operator's questions.** *Input:* one operation with a redirect, a retry and a challenge. *Result:* the record shows every attempt with profile, hop, status, elapsed and outcome class, the pacing decisions, the exit reference, and the final outcome — and contains no credential, cookie value, query string or body. *Proof:* a test over the structured record, and one inspected log file.
- **UAC-36 — Liveness and readiness differ.** *Input:* a running process with a missing policy input. *Result:* liveness is healthy, readiness is not, and the service never reports ready in that state. *Proof:* two tests.

### 10.7 Dependencies and migration

- **UAC-37 — The engine pin is raised through review.** *Input:* a candidate `curl_cffi` version. *Result:* the qualification suite runs on the exact candidate commit, the result is recorded against that commit, an independent reviewer accepts that commit, and the merge happens with a merge commit. *Failure:* evidence from a different commit. *Proof:* the recorded CI result URLs for the candidate commit, and the review record.
- **UAC-38 — Qualification stays disabled.** *Input:* a merged dependency update. *Result:* `CURL_CFFI_UPDATER_ENABLED` and `CURL_CFFI_UPDATER_AUTO_MERGE` remain false or absent, and no tag, release, package publication or deployment follows. A tampered candidate commit, permitted-file shape, workflow origin or missing check prevents qualification. *Proof:* the variable check after merge plus the negative-case tests. Note: the Undici update in this repository is already merged through PR #23 at commit `c6ffff4` and is not in flight.
- **UAC-39 — Profile currency is recorded.** *Input:* a scheduled measurement. *Result:* the newest available named profile and the current stable Chrome release are both recorded with the gap. *Proof:* one dated record per run.
- **UAC-40 — The ledger is complete before any retirement.** *Input:* the section 5 capability list. *Result:* every row has consumers, replacement state and rollback, or an explicit "retained, no replacement planned" entry. *Failure:* a row with an empty consumer list. *Proof:* a completeness check over the ledger.
- **UAC-41 — No silent retirement.** *Input:* a proposed retirement of the Pi tool, the LaunchAgent, the registration script, the CLI shim or the fetch ladder. *Result:* each named consumer is listed, and no consumer loses service before its own proof passes. *Proof:* the ledger plus a per-consumer proof reference.
- **UAC-42 — Rollback is real.** *Input:* a migrated capability. *Result:* the documented rollback restores the previous path with no data migration, and a test proves it. *Proof:* one executed rollback per capability.

---

## 12. Traceability

| Requirement | Priority | User / outcome | Acceptance criteria | Delivery slice |
| --- | --- | --- | --- | --- |
| FR-01 Outcome separation | P0 | All callers can tell a working request from an unwanted body | UAC-01, UAC-19 | 1 |
| FR-02 One contract, three adapters | P0 | Agents and jobs need no handwritten transport code | UAC-03, UAC-04 | 1, 3 |
| FR-03 Fail before work | P0 | Predictability and privacy | UAC-04 | 1 |
| FR-04 Signals, caller owns verdict | P0 | Correct for both APIs and articles | UAC-02, UAC-05 | 1 |
| FR-05 Attributable results | P0 | J5 accountability | UAC-06 | 1 |
| FR-06 Interface parity | P0 | J1, J2 | UAC-03, UAC-07 | 3 |
| FR-07 Batch job interface | P1 | J2 unattended | UAC-08 | 9 |
| FR-08 Session binding | P0 | J3 isolation | UAC-09 | 4 |
| FR-09 Cookie continuity | P0 | P3 lost continuity | UAC-10, UAC-11 | 4 |
| FR-10 Session release | P0 | J3, J5 | UAC-12 | 4 |
| FR-11 Policy is a versioned input | P0 | Missing policy is reported, not invented | UAC-13 | 4 |
| FR-12 Personal-account grant | P0 | Epic FS4 | UAC-14 | 4 |
| FR-13 One redaction rule | P0 | P7 divergence | UAC-15, UAC-16 | 5 |
| FR-14 No durable personal material | P0 | Epic FS4 | UAC-17 | 5 |
| FR-15 Whole-operation deadline | P0 | P4 unbounded work | UAC-18, UAC-19 | 2 |
| FR-16 Manual, bounded, re-validated redirects | P0 | A12, SSRF | UAC-20, UAC-21, UAC-19 | 3 |
| FR-17 Typed, bounded retries | P0 | P9 | UAC-22 | 2 |
| FR-18 Byte bounds everywhere | P0 | P4 memory exhaustion | UAC-23, UAC-24 | 2 |
| FR-19 Concurrency and backpressure | P0 | P4 | UAC-25 | 2 |
| FR-20 Shared per-destination pacing | P0 | P8 per-process loophole | UAC-26, UAC-27 | 6 |
| FR-21 Exit is configuration, no fallback | P1 | Epic FS6 | UAC-28 | 7 |
| FR-22 Destination restriction everywhere | P0 | P5 highest severity | UAC-29, UAC-30, UAC-31 | 3 |
| FR-23 WebSocket bounds | P1 | Unbounded live handles | UAC-32 | 3 |
| FR-24 Error taxonomy | P0 | J5 | UAC-33, UAC-34 | 1 |
| FR-25 Observability | P1 | J5, epic UAC5 | UAC-35 | 8 |
| FR-26 Liveness vs readiness | P1 | Rollout safety | UAC-36 | 8 |
| FR-27 Engine pin through review | P1 | P10 | UAC-37 | 10 |
| FR-28 Disabled, evidence-bound qualification | P1 | Issue #21 | UAC-38 | 10 |
| FR-29 Profile currency measured | P2 | Measured 1–8 release lag | UAC-39 | 10 |
| FR-30 Parity ledger | P0 | A9 silent retirement | UAC-40, UAC-41 | 1, 12 |
| FR-31 Reversible migration | P0 | Epic UAC6 | UAC-42 | 12 |

---

## 13. Delivery slices

Each slice is independently verifiable and independently reversible. Slices 1 to 5 need no new infrastructure and no new dependency.

**Slice 1 — Outcome honesty. The first delivery.** One bounded issue. Make the result contract content-neutral: add `transport` and `content` as separate always-present fields, emit the machine-checkable signals from FR-04, keep the existing `label` and `status` fields so no consumer breaks, return a named error when the hop budget is exhausted, instead of returning the eleventh hop as an ordinary result (FR-16's failure half), and publish the error taxonomy from FR-24. No new dependency, no cluster change, no interface removal.
*Why first:* it is the smallest change that removes the defect every other requirement depends on — the conflation of transport with content — and it is verifiable entirely by the existing test suites plus local fixture servers.
*Verify:* `uv run --frozen pytest python/tests -q` and `bun test` stay green; UAC-01, UAC-02, UAC-04, UAC-05, UAC-19, UAC-33 pass; the section 5 consumer list still works unchanged.
*Size:* one worker, well under one day of engineering.

**Slice 2 — Bounds.** Whole-operation deadline, typed bounded retries, request/response/header ceilings on every interface, and per-caller and per-instance concurrency with backpressure. Covers FR-15, FR-17, FR-18, FR-19.

**Slice 3 — Destination restriction and redirect enforcement on the identity.** Move the address and port checks out of `FetchAPI` and into the engine path so the Pi tool, the MCP stdio server and the loopback MCP service all get them. The engine already rejects a bad scheme and URL credentials. Enforce redirects manually with a hop budget and a named exhaustion error. Add interface-parity tests and WebSocket lifetime bounds. Covers FR-02, FR-06, FR-16, FR-22, FR-23. *This is the security-relevant slice and it should not wait for any architecture decision.*

**Slice 4 — Caller identity and sessions.** Per-caller credentials, versioned policy input, session binding to caller, task, account, profile and exit, cross-caller denial, cookie continuity across permitted redirects, release on every path, and the personal-account grant. Covers FR-08 to FR-12.

**Slice 5 — Privacy parity.** One redaction rule applied by every adapter, closing the measured Pi and MCP divergence, plus the durable-store hygiene in FR-14. Covers FR-13, FR-14.

**Slice 6 — Shared pacing.** One destination-keyed counter per instance, then across replicas, with the scope stated and proven before horizontal scaling. Covers FR-20.

**Slice 7 — Network exit integration.** Exit selection by configuration over the standard proxy interface, with no direct-egress fallback. Tatu's interface stays Tatu's. Covers FR-21.

**Slice 8 — Observability and health.** Request-ID correlation, bounded-cardinality counters, redacted traces, and separate liveness and readiness. Covers FR-25, FR-26.

**Slice 9 — Job interface.** Bounded batch submission with per-item outcomes. Covers FR-07.

**Slice 10 — Dependency and engine maintenance.** Raise the `curl_cffi` pin through the qualification and review path; finish the disabled weekly qualifier from issue #21 without activating it; record profile currency. Covers FR-27, FR-28, FR-29.

**Slice 11 — Component substitution, as a measured option, not a requirement.** Only after slices 1 to 5 are in production and a specific defect is measured. The research records that authorization, credential handling, redirect enforcement and shared pacing remain integration work under Crawlee Python, and that Envoy Gateway and OPA supply authentication and policy decisions but not sessions or exits. The decision is to substitute one component at a time, against one named requirement, with a before-and-after measurement. Candidate components are not a requirement and this document does not select one.

**Slice 12 — Retirement, ledger-gated.** Only after the parity ledger is complete and every named consumer has a passing proof or an accepted exception. Covers FR-30, FR-31.

---

## 14. Migration and parity requirements

1. **The ledger comes first.** Before slice 1, record every section 5 capability with its consumers, its replacement state, and its rollback. The named consumers are the Pi extension tool, the MCP stdio server registered for Claude, Codex and Grok, the loopback MCP service, `POST /v1/fetch` callers in the `phoapp` namespace, the shared `decent-curl` skill's CLI shim outside this repository, and the Civitai harvest worker's `curl_cffi` transport use.
2. **Additive first.** Contract changes are additive. The existing `status`, `label`, `attempts` and `body` fields stay until every consumer has migrated; their removal is a separate, ledger-gated step.
3. **Capability parity is per capability, not per release.** Downloads, uploads, sessions, WebSockets, fingerprint diagnostics, agent access and the register/check service tooling each need their own passing proof before any path is retired.
4. **One reversible step at a time.** Each migrated capability ships with a rollback that needs no data migration, and an executed rollback test.
5. **Existing consumers keep service.** No consumer loses service because a research memo proposed it. A memo is a proposal; a parity ledger with a passing proof is a decision.
6. **Bounded blast radius.** Each step changes one interface and one consumer set, and is deployable and revertible on its own.
7. **Dependency work stays separate.** An engine or dependency update proves maintenance, not migration, and never authorises rollout or deployment on its own.

---

## 15. Assumptions and unknowns

| # | Assumption or unknown | How it is treated |
| --- | --- | --- |
| S1 | The `curl_cffi` 0.15.0 pin is intentional pending a decision. | Verified true in `pyproject.toml` and `uv.lock`. Slice 10 raises it through review. |
| S2 | Both cluster fetch deployments run one replica each. | Recorded from the research and its live read; not re-verified in this task, which used no cluster. Slice 6 must state its own scope. |
| S3 | Destination restrictions in the cluster manifests exclude private ranges. | Recorded from the research. Slice 3 must not rely on it: the restriction belongs in the service, and a caller-reachable address must be refused by the service itself. |
| S4 | The measured source sets stay representative. | Slices 1 and 10 re-measure the same named sets, so drift is visible. |
| S5 | No caller currently needs personal-account access on a schedule. | Not measured. FR-12 keeps it off by default, so the cost of being wrong is a refusal, not a leak. |
| S6 | Cross-replica pacing behaviour is unmeasured. | FR-20 and UAC-27 require the scope to be stated or the limitation reported, not assumed. |
| S7 | `max_redirects`, `verify: false` and `proxy` have no test and were not exercised live. | Recorded as not measured. Slice 3 adds them to the parity proof before they are relied on. |
| S8 | Live HTTP/3 was never exercised. | Recorded. FR-18 and FR-27 do not depend on it. |
| S9 | The measured 6 concurrent calls taking ~15 s at 5-call stage indicates process-local pacing contention. | Treated as an observation to re-measure, not as a performance figure. No performance claim is made anywhere in this document. |
| S10 | Business policy on accounts, destinations, regions, retention, budget, licence and per-site permission is **not supplied**. | Recorded as a missing input. FR-11 makes the service fail closed rather than fill it in. |
| S11 | G1 (architecture and engine) and G2 (security review before external exposure) are Ben's. | Not pre-empted. This document proposes requirements, not the architecture. |

---

## 16. What is not claimed

- No latency, throughput, success-rate or cost figure is claimed. Every number in this document is either a configuration value proposed in section 9 or a measurement quoted from the research with its source named.
- No acceptance scenario in section 11 has been run. They are proposed future proof.
- No component is selected. Crawlee Python, Envoy Gateway, OPA, Miniflux, changedetection.io, Trafilatura and Temporal are named as candidates from the research.
- No capability is retired. No business policy is stated. No gate is closed.
- The cited cluster state is from the research snapshot of 2026-09-27 and was not re-read here; this task used no cluster.

---

## 17. Decision register (bounded)

Nine decisions. Each names the owner, because the difference matters: a product or business choice is Ben's, and an engineering choice is the team's to resolve without asking.

| # | Decision | Owner | Options | Recommendation | Needed by |
| --- | --- | --- | --- | --- | --- |
| D1 | Does the product remain "one browser-shaped HTTP system", or become "a fetch service with a bounded browser-shaped path"? | **Ben** — product framing | keep as-is; reframe per A1 | Reframe. Measurement inverts the emphasis. | Before slice 1 |
| D2 | Does the service return a shared content verdict, or signals with a caller-owned verdict? | **Ben** — product semantics | shared verdict; signals only; both, caller opt-in | Signals only, with the shared verdict retained as a non-authoritative convenience for existing consumers. | Before slice 1 |
| D3 | The threshold values in section 9. | **Ben** for the business-facing ones (budget, retention, permitted regions); **team** for the rest | adopt as proposed; adjust | Adopt the proposed values as defaults; all are configuration, all fail closed when absent. | Before slice 2 |
| D4 | Per-caller credential form and revocation. | **Ben** — credential policy; **team** — mechanism | shared token plus caller field; per-caller credentials; gateway-issued identities | Per-caller credentials. A shared token cannot express revocation or isolation. | Before slice 4 |
| D5 | Whether personal-account use is ever permitted unattended, and under what grant. | **Ben** — business policy | never; task-scoped grant; always | Task-scoped grant with expiry, off by default. | Before slice 4 |
| D6 | Whether the shared pacing counter may be a single point of failure at the proposed scale. | **team** — engineering | single shared counter; per-instance with a stated limit; external store | Start per-instance with the scope stated; prove the shared case before horizontal scaling, exactly as the epic requires. | Before slice 6 |
| D7 | Whether to substitute maintained components, and which one first. | **team** — engineering, after measurement | none; Crawlee Python; Envoy Gateway; OPA | Do not decide now. Substitute one component at a time against one named requirement with a before-and-after measurement. Ben's latest standing policy already prefers a maintained third-party tool unless ours is demonstrably better. | After slice 5, with evidence |
| D8 | The versioned policy input's owner, schema and distribution. | **Ben** — ownership; **team** — schema | Ben-authored file; service-configured; externally managed | Ben owns the content; the service owns the schema and refuses anything it cannot parse. | Before slice 4 |
| D9 | The measured source set used for content-success comparison and profile-currency checks. | **team** — engineering, with Ben's approval of destinations | the sets named in the research; a smaller approved set; a new set | Reuse the research sets, re-measured, with destinations approved by Ben. | Before slice 10 |

**Boundary note.** None of D1, D2, D4, D5 or D8 is an engineering choice; the team will not resolve them by assumption. D3, D6, D7 and D9 are engineering choices the team resolves and records here, except where the brief in D3, D7 or D9 names a Ben-owned input.

---

## 18. Evidence index

| Claim used here | Source |
| --- | --- |
| 1 of 24 regulator endpoints needs browser identity; Medsafe returns 200 for "Page not found" | [Regulatory monitoring research](../research/2026-09-27-regulatory-monitoring-approach.md) §2, §4 |
| 3 of 20 feeds blocked; 3 more block the article; `example.com` yields `label: blocked` | [News collection research](../research/2026-09-27-news-collection-approach.md) §Measurements; [capability inventory](../research/2026-09-27-decent-curl-capability-inventory.md) §5 |
| Capability table, tests present, not-measured list, cluster manifests | [Capability inventory](../research/2026-09-27-decent-curl-capability-inventory.md) |
| Engine ranking, fingerprint measurements, 1-to-8 profile lag, `curl_cffi 0.15.0` newest preset Chrome 146 | [Impersonation engines research](../research/2026-09-27-impersonation-engines.md) |
| Candidate components and what they do not supply | [Shared fetch platform research](../research/2026-09-27-shared-fetch-platform.md) |
| Actors, needs, failure modes, open questions for Ben | [Browser identity problem research](../research/2026-09-27-browser-identity-problem.md) |
| Architecture options A–D and the G1 decision list | [G1 decision memo, comment on issue #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31#issuecomment-5856676224) |
| Engine pin `0.15.0`; package version `0.2.2` | [`pyproject.toml`](../../pyproject.toml), [`uv.lock`](../../uv.lock) |
| Single `label` classification, ladder defaults, 3.0 s per-host interval, 16 KiB request cap, hop budget, eleventh-hop return | [`fetch_api.py`](../../python/decent_curl_impersonate/fetch_api.py) |
| Scheme and URL-credential checks at lines 676-679; no port or resolved-address check; per-transfer timeout; session-per-call when unnamed; retry without backoff | [`engine.py`](../../python/decent_curl_impersonate/engine.py) |
| MCP returns the engine result verbatim | [`mcp_server.py`](../../python/decent_curl_impersonate/mcp_server.py) |
| Pi strips query and fragment from result URLs | [`src/tools.ts`](../../src/tools.ts) |
| 32 MiB MCP request envelope; 30-minute idle; 5 MiB × 3 log | [`http_server.py`](../../python/decent_curl_impersonate/http_server.py) |
| 10 MiB protocol line cap; 18 stable error codes | [`src/worker-client.ts`](../../src/worker-client.ts) |
| Article evidence rule, WAF markers, 700-character threshold | [`article_verifier.py`](../../python/decent_curl_impersonate/article_verifier.py) |
| Installed interfaces, consumers, current documented limits | [`README.md`](../../README.md) |
| Prior accepted design boundaries | [Playwright removal design](../superpowers/specs/2026-07-21-playwright-removal-curl-impersonate-design.md), [compact gateway design](../superpowers/specs/2026-07-26-compact-gateway-tool-design.md) |
| Dependency maintenance boundaries | [Epic #20](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/20), [issue #21](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/21) |

**Repository state at the time of writing.** `main` is at `c6ffff4`, which includes the merged dependency update from PR #23. That update is complete, not in flight.
