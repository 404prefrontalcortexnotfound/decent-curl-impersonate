# R3c: platform shape for one shared cluster fetch service

Research date: 2026-09-27. Brief: [issue #36](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/36). Parent: [epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31). Baseline: [PR #30](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30). Unmeasured claims say so.

## 1. The requirements this platform must meet

The epic sets four non-negotiables: two separate layers (identity versus egress), a system and not a script, the identity policy, and no JavaScript for now.[^epic] With the measured callers, that gives eight requirements.

| # | Requirement | Where it comes from |
| --- | --- | --- |
| R1 | Browser-shaped TLS and HTTP identity without a browser | `README.md:3`; epic "no JavaScript" |
| R2 | Session isolation per caller, one cookie jar and one identity per task | epic identity policy |
| R3 | Per-host politeness, shared across all callers | epic; measured in §2 |
| R4 | Egress chosen by policy, never by caller code | epic layer rule; `k8s/apps/pohjola/tatu/config/fleet.yaml:44` |
| R5 | Several authenticated tenants, revocable individually | measured in §2 |
| R6 | Metrics, logs and traces per caller and per host | `k8s/pohjola/argocd/apps/kube-prometheus-stack.yaml` |
| R7 | Scheduling and scaling on Kubernetes | `k8s/pohjola/decent-fetch-eu/deployment.yaml:10` (`replicas: 1`) |
| R8 | SSRF and internal-address boundary that callers cannot bypass | `k8s/apps/pohjola/decent-fetch-eu/network-policy.yaml:1` |

## 2. What the deployed service actually is, measured

`decent-fetch-eu` (pohjola) and `decent-fetch-au` (linnunrata-v2) are already presented as **one logical service with a region choice**: the EU Service carries selectors, the AU Service carries none and `service.cilium.io/affinity: remote`, so the name resolves to the other cluster (`k8s/apps/pohjola/decent-fetch-eu/services.yaml:1`). Both are one replica, 128 MiB request, 512 MiB limit, and only namespace `phoapp` may call them (`k8s/apps/pohjola/decent-fetch-eu/deployment.yaml:39`, `network-policy.yaml:11`). The public contract is one endpoint, `POST /v1/fetch`, with a single shared bearer token (`python/decent_curl_impersonate/http_server.py:136`, `:100`).

I ran that contract on Blackfin against `https://example.com/` (`/tmp/r3c-measure.py`, curl_cffi 0.15.0, no proxy, no cluster writes):

| Probe | Result |
| --- | --- |
| 1 request | HTTP 200, 559 bytes, 6.07 s, `label: "blocked"` |
| `attempts` for that 200 | three profiles tried (`chrome146`, `safari2601`, `firefox147`), 50/49/78 ms, each `blocker: "non_article_landing"` |
| 5 concurrent callers, one host | 45.03 s total; individual 33.0/36.0/39.0/42.0/45.0 s |
| 2 concurrent callers, two hosts | 8.97 s total (6.08 s and 8.97 s) |
| wrong bearer token | 401 `unauthorized` |
| `session_id` in the body | 200, silently ignored |
| `caller` and `egress` in the body | 200, silently ignored |

Four consequences decide the shape.

1. **A caller cannot state a need.** The body is read at `python/decent_curl_impersonate/fetch_api.py:104` and only `url`, `profiles` and `timeout_s` exist; extra keys are accepted and discarded. Nothing expresses caller, task, identity, egress or expected result. This is the direct cause of the epic's "a system, not a script" gap.
2. **The verdict is task-specific but lives in the shared path.** A healthy 200 page came back `blocked` because `classify` (`fetch_api.py:50`) asks an article detector (`python/decent_curl_impersonate/article_verifier.py:22`). The profile ladder then retried all three profiles on a *content* verdict, so a caller wanting a non-article page pays three requests and is told "blocked". A regulator index, an API or a sitemap is not an article.
3. **Politeness is correct and throughput is the bottleneck.** The per-host lock plus interval (`fetch_api.py:121-125`) serialised five callers into 45 s. Locks are per host, so different hosts do run in parallel (8.97 s for two hosts). One in-flight request per host is defensible, but with `replicas: 1` and in-process state (`fetch_api.py:82-85`) it cannot scale out without losing the guarantee.
4. **All callers are one principal.** One token for the whole deployment means no per-caller attribution, quota or revocation. The measured 401 is the whole auth story.

Two further gaps sit outside the service. `decent-fetch` egresses straight to the internet: the Cilium policy allows `0.0.0.0/0` on 80/443 minus private ranges, with no Tatu endpoint in the allow list (`network-policy.yaml:35`). Meanwhile Tatu's router builds its own Chrome-shaped `wreq` client through its own CONNECT proxy (`/Users/bo/code/tatu/rust/crates/tatu-router/src/net.rs:20-37`). The layer rule is broken from both sides today.

The Civitai harvester shows what a caller actually needs, and it needs little from us: one session with a fixed profile, a bearer key, retry with backoff on a status list, and a proxy (`/Users/bo/code/civitai/worker/pull.py:146`, `:148-163`, `:28`; `requirements.txt` pins `curl-cffi==0.15.0`). Its politeness is hardcoded per process, so N callers means N times the pressure (`pull.py:150`, `:325`).

## 3. Candidates

Maintenance evidence, one request at a time, `gh api repos/<o>/<r>`, `releases/latest`, and a commit count since 2026-06-29 with `per_page=100` (so 100 means "at least 100").

| Project | Stars | Licence | Last push | Last release | Commits/90d | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `apify/crawlee-python` | 9,554 | Apache-2.0 | 2026-09-26 | 2026-09-22 | ≥100 | **Adopt as the engine** |
| `apify/crawlee` | 25,916 | Apache-2.0 | 2026-09-26 | 2026-08-12 | ≥100 | same monorepo, JS side |
| `scrapy/scrapy` | 64,498 | BSD-3 | 2026-09-27 | 2026-09-10 | ≥100 | reject for now |
| `unclecode/crawl4ai` | 84,343 | Apache-2.0 | 2026-09-25 | 2026-09-23 | ≥100 | adopt later, JS phase only |
| `mendableai/firecrawl` | 185,332 | AGPL-3.0 | 2026-09-27 | 2026-06-19 | ≥100 | reject |
| `projectdiscovery/katana` | 17,581 | MIT | 2026-09-25 | 2026-08-05 | ≥100 | reject as a service |
| `spider-rs/spider` | 2,744 | MIT | 2026-09-16 | 2026-03-31 | 51 | reject |
| `scrapy/scrapyd` | 3,098 | BSD-3 | 2026-09-21 | 2023-02-10 | 5 | reject |
| `my8100/scrapydweb` | 3,412 | GPL-3.0 | 2025-02-19 | 2025-02-16 | 0 | reject, dormant |
| `crawlab-team/crawlab` | 12,277 | BSD-3 | 2026-02-10 | 2023-07-26 | 0 | reject, abandoned |
| `Boris-code/feapder` | 3,739 | none stated | 2026-08-21 | 2025-02-14 | 6 | reject, thin activity |
| `lexiforest/curl_cffi` | 6,568 | MIT | 2026-09-27 | 2026-09-20 | 50 | already our engine |
| `deedy5/primp` | 611 | MIT | 2026-09-13 | 2026-09-12 | 46 | watch (R2 owns) |
| `lwthiker/curl-impersonate` | 7,051 | MIT | 2024-07-18 | 2024-03-02 | 0 | dead, superseded by curl |
| `mitmproxy/mitmproxy` | 45,163 | MIT | 2026-09-27 | 2026-05-12 | 56 | reject, breaks the layer rule |
| `open-policy-agent/opa` | 12,279 | Apache-2.0 | 2026-09-26 | 2026-09-24 | ≥100 | **adopt for the policy plane** |
| `nats-io/nats-server` | 20,776 | Apache-2.0 | 2026-09-25 | 2026-09-17 | ≥100 | **adopt, already deployed** |
| `kedacore/keda` | 10,550 | Apache-2.0 | 2026-09-27 | 2026-09-23 | ≥100 | optional, only if KEDA is added |
| `modelcontextprotocol/python-sdk` | 24,409 | MIT | 2026-09-25 | 2026-09-07 | ≥100 | **adopt for the agent face** |

### Scored against the requirements

Identity and session isolation. **Crawlee** is the only candidate with a first-class answer: `SessionPool` holds isolated sessions with `max_pool_size: int = 1000` (`src/crawlee/sessions/_session_pool.py:39`) and rotates them on blocked responses, which maps onto R2 exactly. Firecrawl and Crawl4AI both bind identity to a person's browser profile, which the identity policy forbids: Crawl4AI's documentation makes a real Chrome `user-data-dir` with cookies and local storage the recommended path and calls the alternative "not a substitute for true user-based sessions" (`docs.crawl4ai.com/advanced/identity-based-crawling/`). Katana, spider-rs and scrapyd have no session concept.

Browser-shaped TLS identity. **Crawlee wins again**: its Python port ships a `CurlImpersonateHttpClient` wrapping `curl_cffi` (`src/crawlee/http_clients/_curl_impersonate.py:1-17`) with cookie, proxy and HTTP-version handling, and the JS port documents an impersonating client (`apify/crawlee/docs/guides/impit-http-client/`). Adopting Crawlee costs no identity regression, because it is the engine we already ship. Scrapy has no impersonating download handler in core. Katana and spider-rs send plain requests unless a browser backend is chosen.

Per-host politeness. Crawlee gives a request queue, a session pool and a retry budget per crawl. Whether it enforces per-host concurrency limits is **not measured**: the concurrency documentation page refused the request (HTTP 436) and I could not read the source. That is the one gap in the recommendation, and it is small, because our interval is three lines and the traffic is low.

Egress by policy. Crawlee's `ProxyConfiguration` rotates from a list the caller supplies, so policy would be in code. Fix it the Tatu way: give Crawlee one proxy URL whose *user name is the exit name*, and keep the policy where it already lives as data, in `k8s/apps/pohjola/tatu/config/fleet.yaml:44-70` (pools, `exclude_countries`, per-status rest and halve rules). Tatu is already the only path Byparr may use (`deployment-byparr.yaml:63-70`).

Multi-tenant auth. No crawler project has it. Crawl4AI 0.9.x is the strongest: secure by default, a bearer token on every endpoint, loopback binding when the token is missing, declarative hooks because the old Python-string hooks were a remote-code-execution surface (`docs.crawl4ai.com/core/self-hosting/`). Firecrawl's own self-host guide ships `USE_DB_AUTHENTICATION=false` and says the baseline "is not a production architecture" and that authentication must be designed before the API leaves a trusted network (`docs.firecrawl.dev/contributing/self-host`). Crawl4AI still gives one token, not many tenants, so it fails R5 too.

Observability, scheduling, scaling. Crawlee exposes statistics and an event manager. Firecrawl adds a Postgres and RabbitMQ queue; Crawl4AI adds a job queue with webhooks and a dashboard. We already run kube-prometheus-stack, Loki, Argo CD, Kargo, Traefik, authentik, Cilium and NATS with JetStream (`k8s/pohjola/argocd/apps/`, `k8s/apps/pohjola/phosphor/nats.yaml:33` runs `-js -sd /data`). Adding a database to adopt one of these platforms would be a net loss.

## 4. Recommended shape

**One Fetch Plane: a stateless API in front of a Crawlee-based worker pool, with Tatu as the only way out.** One logical service, not two: keep `decent-fetch-eu` and `decent-fetch-au` as the regional addresses of one service, and select the region by policy, not by the caller.

**A caller states its need as data.** A versioned need document, one per task, stored in Git through Argo CD so it is reviewable, with this shape:

```yaml
task: whimh-weekly
caller: phoapp-worker          # becomes an authenticated principal, see below
identity: task-account/whimh   # a named account, never a personal one, by default
egress: { pool: eu, countries: [AU, NZ, GB, IE] }   # resolved by Tatu policy
expect: { kind: article, min_words: 300 }          # replaces the article detector
budget: { max_requests_per_host_per_minute: 20, max_bytes: 5000000, deadline_s: 900 }
profile: chrome146
```

`expect` is the field the measurement demands. The verdict is hardcoded to articles today and wrong for everything else; putting it in the need moves article detection to the WHIMH task where it belongs and leaves a regulator index asking for `kind: any`.

**Exits and identities are chosen by policy.** The API resolves the need against OPA policies, then issues a short-lived job to NATS JetStream. The worker asks Tatu for the exit named in the resolved policy. Tatu never learns who asked, and no caller can name an exit: today's Byparr comment records that a caller's `X-Proxy-Server` header could otherwise route around Tatu (`deployment-byparr.yaml:63`), which is exactly the code-as-policy the epic forbids.

**The SSRF boundary is the dataplane, and it gets stricter.** Keep the Cilium egress `except` list (`network-policy.yaml:35`) because it also blocks DNS rebinding, and change the allow list so the only permitted destination is the Tatu CONNECT port. Today the service reaches the internet directly, so a worker compromise is one hop from anywhere; after the change it is one hop from Tatu only. Keep `public_url` and `check_public_host` (`fetch_api.py:30`, `:44`) as the application layer of the same boundary. The PhoApp in-process guard is not a boundary and should not be treated as one.

**Several tenants, revocable individually.** Put Traefik with authentik forward-auth in front of the service. Both are already in the clusters (`k8s/pohjola/argocd/apps/traefik.yaml`, `authentif.yaml`, and the existing `linnunrata-authentik-forwardauth.yaml`). The forwarded identity becomes the `caller` field, which turns the measured single principal into per-caller quota, attribution and revocation, and it is a reviewed SSO rather than a hand-rolled bearer. This is the natural gate-G2 object.

**Agents reach it through a thin CLI and one MCP server.** A CLI that renders and signs a need document, plus an MCP server on `modelcontextprotocol/python-sdk` exposing `fetch`, `fetch_batch` and `session_status`. It carries no policy of its own and cannot pick an exit. Locally, `~/.agents/skills/decent-curl/cli.sh` and `mcp.sh` stay as they are; only the cluster route changes.

**Scaling.** The worker pool scales on NATS queue depth, not pod count, because politeness state must be shared. Do not raise `replicas` on the current deployment: the pacing map is per process (`fetch_api.py:82`), so a second replica doubles the per-host rate. A single NATS-backed scheduler owning per-host permits is the fix, and the one place where we write real code.

## 5. What we stop maintaining

- The in-process pacing map and its locks, replaced by a shared per-host permit in the scheduler.
- The universal profile ladder. Retrying all three profiles on a content verdict tripled the cost of a single caller (§2) for no gain. One profile per need, then a scheduler retry.
- The article detector as shared behaviour. It stays in the WHIMH task and becomes an `expect` implementation.
- The single shared bearer token and its Infisical secret, replaced by authentik forward-auth.
- Tatu's embedded `wreq` fetcher (`net.rs:20-37`). After this change Tatu gives exits and nothing else, which is what the epic asks for.
- The harvester's per-process retry ladder and `HTTPS_PROXY` env var (`pull.py:28`, `:148-163`). It becomes one more need document; it keeps its own parsing.
- Byparr's pinned exit and per-deployment GeoIP (`deployment-byparr.yaml:63-90`), which become a policy entry and a Tatu-side concern.

## 6. What we do not adopt, and why

- **Firecrawl self-hosted.** AGPL-3.0, and the vendor's own guide says the default stack has authentication off, no durable storage, and that its anti-bot service is not included. Adopting it means owning a Postgres, a queue and the auth it refuses to ship.
- **Crawl4AI now, Crawl4AI later.** It is the right answer for use case 5, which the epic defers because it needs JavaScript. Run it later behind this same need contract; do not build a browser service in the meantime.
- **Crawlab.** 0 commits in 90 days, no release since July 2023. It is exactly the shape we want and it is abandoned.
- **scrapyd and ScrapydWeb.** scrapyd has 5 commits in 90 days and no release since 2023; ScrapydWeb had 0. scrapy itself is healthy and worth keeping as a library for a future JS-free Spider job.
- **mitmproxy as the egress broker.** It would be an excellent per-caller identity and exit broker, and it is actively maintained, but it must terminate TLS. That puts a proxy in the identity path, which merges the two layers the epic keeps apart.
- **n8n or Windmill as the caller face.** Both are healthy workflow engines with their own database. Our callers are agents, not people filling in forms, and the need document is ten lines of YAML.

## 7. Not measured, and open for G1

- Whether Crawlee enforces per-host concurrency limits, as R3 requires. Its docs returned HTTP 436 and the source path was not read. If it does not, three lines of our own cover it.
- Crawlee's `max_requests_per_second` value and where it is configured: not read.
- Any real destination acceptance test. Every measurement here used `example.com`, a 559-byte static page, so it proves contract behaviour and pacing, not that any regulator or news site accepts this identity.
- Cost, latency and volume targets, none of which the brief supplies.
- Whether the AU Service's remote affinity survives a second replica: not tested, no cluster writes were made.

G1 needs three decisions: whether the need document is a CRD or an Infisical-backed config, whether `expect` is a small closed set or caller-supplied rules, and whether gate G2 accepts authentik forward-auth as the ingress auth.

[^epic]: [Issue #31, "Ben's direction" and "Identity policy"](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31).
