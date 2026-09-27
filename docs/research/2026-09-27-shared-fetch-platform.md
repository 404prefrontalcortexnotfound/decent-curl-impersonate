# Shared fetch platform: recommendation and evidence

Research snapshot: 2026-09-27. [Brief #36](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/36), [epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31), [problem baseline PR #30](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30). This is a design recommendation, not a deployed platform or a destination-success benchmark.

## Recommendation

Adopt **Crawlee Python's HTTP-only components behind an authenticated service API**, with **Envoy Gateway** for caller authentication and admission quotas, and **OPA** for supplied, versioned policy. Keep network exits behind a standard proxy interface. Deployment configuration connects that interface to Tatu; neither library needs Tatu-specific code. Keep recurring schedules with callers, including Temporal where already used.[^epic][^crawlee][^gateway][^opa][^tatu]

Use Crawlee's maintained queue, session, retry and throttling components instead of extending our fetch ladder. This does **not** buy a complete tenant-safe platform: authorization, transient credential handling, redirect enforcement and shared pacing remain integration work. Start with one active scheduler across both regions; scale HTTP workers independently only after every network attempt passes that scheduler. Cross-replica correctness and capacity are **not measured**.[^throttle][^session]

This choice is based on documented fit, active upstream maintenance and a concrete defect in our current contract. It does not establish Crawlee as the fastest engine. Engine choice remains G1/R2's decision; Crawlee supports both `CurlImpersonateHttpClient` and `ImpitHttpClient` without JavaScript.[^crawlee][^epic]

## Current callers and boundaries

Source snapshots: this repository's runtime at `5878f3d`; Tatu `2dca3cd0d6fd`; Civitai `8005ef8c06ee`. `git -C /Users/bo/code/kalevala fetch origin` succeeded; inspected `origin/main` was `ac7c4c45c086f2c80bf8149f85da2caf95f5f673`. Kalevala citations below refer to that revision, not its older working tree. No cluster runtime read occurred in this run.

- EU and AU fetch manifests each declare one replica. Both ingress policies admit only the pohjola `phoapp` worker identity. Their egress policies allow public HTTP(S), not an exit-service-only route. These are manifest facts, not fresh readiness measurements.[^deploy]
- The fetch endpoint uses one bearer token, a process-local host clock and an article classifier. Its request schema reads `url`, `profiles` and `timeout_s`; its engine invocation contains no named session. This is insufficient for separate caller identities and arbitrary content.[^fetch]
- `/Users/bo/code/civitai/worker/pull.py:146-163` creates a Chrome146 `curl_cffi` session with a proxy, optional bearer authentication and four attempts. `:324-325` adds jitter. `mine_users.py:24-25` reuses that transport; `Dockerfile:1-7` packages both scripts. These establish caller requirements, not the deployed image.[^harvest]
- The cluster harvest manifest instead names `inferencegallery-worker` and a Temporal `WorkerDeployment`; its network policy routes to Tatu gRPC. Do not assume the supplied Python script is the running cluster worker.[^harvest]
- Tatu constructs Chrome149 `wreq` clients and cookie jars through CONNECT. Its session owner combines exit, cookie jar and fingerprint. Byparr's manifest selects a fixed CONNECT exit and describes a browser/Playwright path. The first mixes identity with exits; the second is outside this epic's HTTP-only scope.[^tatu][^byparr]

## Candidate comparison

The entries describe documented features, not measured isolation guarantees. “Integration” means the inspected upstream interfaces do not establish the required shared-service property; it does not claim the feature is impossible.

| Candidate | Identity, sessions and caller authentication | Per-host limits and policy-selected egress | Observability, scheduling and Kubernetes scaling |
|---|---|---|---|
| **Crawlee Python** | SessionPool and per-session cookies; separate pools/workers and API authorization required for tenants. HTTP impersonation clients available. | Opt-in `ThrottlingRequestManager`: configured domains, crawl-delay, 429 backoff and Retry-After. ProxyConfiguration accepts resolved proxies. Policy evaluation and cross-process clocks need integration. | Statistics/logs, documented OpenTelemetry instrumentation; request queues and resource-based concurrency. Web-server integration is documented. Cron, cluster placement and shared ownership are external.[^crawlee][^session][^throttle][^trace] |
| **Scrapy + Scrapyd** | Scrapy supports cookie jars; isolate jobs/accounts explicitly. Scrapyd documents one Basic-auth username/password, not tenant authorization. | Per-domain/IP slots, download delay and AutoThrottle; proxy middleware accepts configuration. Shared limits across independent jobs and policy resolution need integration. | Scrapy statistics/logs; Scrapyd schedules and lists processes with SQLite queues. Calendar scheduling, distributed ownership and trace export need integration. Strong alternative for spider jobs; core documentation does not establish a coherent browser TLS profile.[^scrapy][^scrapyd] |
| **spider-rs** | Cookie configuration exists; separate Website instances are not proof of tenant isolation. OSS service authentication not established. | Delay, concurrency and proxy configuration exist; global limits and identity-to-exit policy not measured. | HTTP-first engine, streaming and distributed examples; cron examples exist. Kubernetes service lifecycle, tenant metrics/log redaction and trace coverage need integration. Avoid automatic browser escalation.[^spider] |
| **Crawl4AI** | Named sessions and optional browser profiles; current Docker migration requires API-token authentication. Tenant ownership checks not established. | Domain RateLimiter and adaptive dispatcher; proxy configuration exists. Shared replica budgets need integration. | Docker API, monitor and asynchronous jobs. HTTP strategy exists, so it is not exclusively browser-based; no measured impersonating HTTP advantage here. Browser-oriented features and persistence require explicit restriction.[^crawl4ai] |
| **Firecrawl self-hosted** | Source-aligned baseline disables DB authentication; production auth must be configured. Task-account session isolation not established. | Proxy/engine configuration is deployment work; platform-wide politeness under several tenants not measured. | API/workers, queue databases and Kubernetes/Helm examples; monitoring/scaling remain operator decisions. Baseline bundles Playwright. Larger extraction stack than this HTTP-only requirement; source warns against treating examples as production architecture.[^firecrawl] |
| **Katana** | Header/cookie input; tenant sessions and API authentication need a wrapper. Experimental JA3 randomization is not proof of a coherent browser identity. | Current README includes per-host and global rate flags, delay and proxy input. Limits across CLI processes and policy selection need integration. | CLI/JSONL output suits discovery jobs; Kubernetes scheduling, service authentication, metrics and tracing need integration. Prefer as a caller, not the shared fetch service.[^katana] |

Supporting components fill different gaps. **Envoy Gateway** supplies JWT validation, shared admission limits and proxy telemetry; it supplies neither website accounts nor fetch scheduling. **OPA** evaluates authorization policy but does not provision accounts, store sessions or execute exits. **Temporal** supplies durable workflow/task scheduling; keep it on the caller side so fetch bodies, cookies and personal URLs do not enter workflow history.[^gateway][^opa][^temporal]

## Maintenance evidence

Fresh sequential GitHub API reads, at least 1.1 seconds between request starts, all exited 0. Repository links identify each upstream. Columns are stars/open issues, SPDX license, latest push, latest GitHub release publication, and default-branch commits since `2026-06-29T00:00:00Z`. A 100-item first page is **≥100**, not an exact count. Release dates do not alone establish package freshness; low activity does not establish abandonment.

| Upstream | Stars / open | License | Push | Release | 90d commits |
|---|---:|---|---|---|---:|
| [apify/crawlee-python](https://github.com/apify/crawlee-python) | 9554 / 97 | Apache-2.0 | 2026-09-26 | 2026-09-22 | ≥100 |
| [scrapy/scrapy](https://github.com/scrapy/scrapy) | 64498 / 331 | BSD-3-Clause | 2026-09-27 | 2026-09-10 | ≥100 |
| [scrapy/scrapyd](https://github.com/scrapy/scrapyd) | 3098 / 8 | BSD-3-Clause | 2026-09-21 | 2023-02-10 | 5 |
| [spider-rs/spider](https://github.com/spider-rs/spider) | 2744 / 1 | MIT | 2026-09-16 | 2026-03-31 | 51 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | 84343 / 207 | Apache-2.0 | 2026-09-25 | 2026-09-23 | ≥100 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | 185340 / 653 | AGPL-3.0 | 2026-09-27 | 2026-06-19 | ≥100 |
| [projectdiscovery/katana](https://github.com/projectdiscovery/katana) | 17581 / 20 | MIT | 2026-09-25 | 2026-08-05 | ≥100 |
| [envoyproxy/gateway](https://github.com/envoyproxy/gateway) | 3054 / 791 | Apache-2.0 | 2026-09-25 | 2026-08-28 | ≥100 |
| [open-policy-agent/opa](https://github.com/open-policy-agent/opa) | 12279 / 305 | Apache-2.0 | 2026-09-26 | 2026-09-24 | ≥100 |
| [temporalio/temporal](https://github.com/temporalio/temporal) | 23315 / 1010 | MIT | 2026-09-27 | 2026-09-11 | ≥100 |
| [lexiforest/curl_cffi](https://github.com/lexiforest/curl_cffi) | 6568 / 64 | MIT | 2026-09-27 | 2026-09-20 | 50 |

Reproduce each row with these commands, separated by at least one second:

```sh
gh api --include repos/OWNER/REPO
gh api --include repos/OWNER/REPO/releases/latest
gh api --include 'repos/OWNER/REPO/commits?since=2026-06-29T00:00:00Z&per_page=100'
```

## Proposed service contract and ownership

These are proposed controls, not upstream defaults or new business policy. Ben supplies approved account, destination, region, retention and budget rules; absent policy fails closed.[^epic]

```json
{
  "version": 1,
  "task_id": "opaque-task-id",
  "policy_ref": "owner-approved-policy@version",
  "identity_ref": "task-account-alias",
  "url": "https://example.com/",
  "method": "GET",
  "expect": {"kind": "bytes"},
  "deadline_s": 30
}
```

**Authentication and policy.** Derive caller identity from a verified credential, never a caller-supplied field. OPA intersects the request with supplied policy and returns an account lease, transport profile, proxy configuration and limits. Reject raw proxy URLs, cookie imports, TLS-verification overrides and unknown fields. Keep ingress private until G2. Machine credentials must be independently revocable; gateway token validation alone does not establish revocation.[^gateway][^opa][^epic]

**Account isolation and privacy.** Separate task accounts by default; deny personal accounts without an explicit task-scoped grant. Bind each opaque session handle to caller, task, account, profile and exit lease. Disable automatic account rotation. Keep jars and bodies in task-scoped memory; close them on completion, cancellation or expiry. Disable persistent queues/caches for sensitive payloads, request-body logs, query strings and credential-bearing trace attributes. Do not put personal material in durable scheduler history. A crash loses the session; report that loss instead of silently changing identity. Crawlee storage is configurable, but cleanup and absence of residual material require acceptance tests.[^session][^storage][^epic]

**Politeness and scaling.** One active admission scheduler owns normalized host limits across callers and EU/AU workers. Use Crawlee's throttler for configured domains and 429 handling; reject admission for unconfigured domains. Its state is in-memory, so sharing queue storage does not share throttle clocks. Count every redirect, retry, robots request and profile attempt; disable hidden client retries/redirects or route them back through admission. Gateway caller quotas do not count those outbound attempts. Keep session affinity; a lost scheduler stops dispatch. Horizontal scheduler scaling needs leases, fencing and failover proof before rollout. This deliberate availability limit avoids claiming unproven distributed politeness.[^throttle][^gateway]

**Exit and SSRF boundary.** Supply generic CONNECT endpoints through deployment configuration, with no Tatu RPC in the fetch library. Keep the destination TLS handshake in the HTTP client. At every hop, restrict schemes/ports, resolve and validate all IPv4/IPv6 answers, and prevent DNS rebinding at connection time. With remote proxy DNS, enforce destination-address rejection at the proxy/exit too: a worker policy allowing CONNECT cannot inspect its destination. Deny loopback, private, link-local, metadata and cluster/service ranges at the actual outbound dialer. Internal fetch needs a separate authorized service, not a public-fetch bypass. No TLS interception or direct-egress fallback. This extends the existing public-address boundary; proxy-path enforcement is not measured.[^fetch][^deploy]

**Interfaces and operations.** CLI and MCP adapters submit the same contract and return bytes/content type, HTTP result and explicit challenge/login/session-loss states. Article acceptance belongs to callers. Keep request IDs, bounded latency/status counters, queue depth and redacted traces; tenant identifiers must be opaque. Apply backpressure, deadlines and byte limits. Caller schedules submit jobs through the API; workers scale by queue age and capacity, with session affinity and the single scheduler constraint.[^fetch][^trace][^temporal]

## Measurement and acceptance limits

Blackfin shell probe used the actual `create_app(container_mode=True)` ASGI entry point and live HTTPS through this repository's engine; no network mock. Input: `https://example.com/`, only `chrome146`, `curl_cffi 0.15.0`. It completed stages **1 → 5 → 2** before continuing; the last two supplied `session_id` and `egress`. Command:

```sh
PYTHONPATH="$PWD/python" /Users/bo/code/decent-curl-impersonate/.venv/bin/python /tmp/r3c-platform-verify/probe.py
```

Observed output: 1 call in **0.082s**; 5 concurrent calls in **14.998s**; remaining 2 in **6.031s**. All eight returned service/upstream HTTP 200, 559 bytes, one attempt and `label=blocked`. Body SHA256: `ff67a9d764d6a2367a187734e697f6a53217db9a21c101d410a113ca871a299d`. Supplied session/egress fields had no effect, consistent with the source.[^fetch]

Initial harness exited 1: `ModuleNotFoundError: No module named 'httpx'`. Correction: invoke ASGI directly; no installation needed. Corrected run exited 0, closed the application lifespan and left no service process. Temporary source/probe evidence is under `/tmp/r3c-platform-verify`; no credentials or response bodies were saved.

Candidate runtime acceptance, throughput, cross-tenant leakage, cross-region limits, restart privacy and cost are **not measured**. Before implementation, G1 chooses architecture/engine. Before exposure, G2 needs two-caller isolation, account-grant denial, malicious redirects/rebinding, rate accounting including retries, cancellation cleanup and failover tests. No third-party default establishes these guarantees.[^epic]

## What we stop maintaining after acceptance

Replace our profile ladder, cookie/queue plumbing and crawler backoff with maintained components. Remove article-only success from shared transport. Migrate harvester transport retries to the service while keeping parsing and storage with callers. Remove Tatu's browser-shaped fetch/session ownership once consumers migrate to the separated service. Keep Byparr outside this HTTP-only platform. Retain only the contract, policy integration, isolation and network-boundary code that upstream does not supply.[^fetch][^tatu][^epic]

## Sources

[^epic]: [Epic direction and G1/G2](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31).
[^fetch]: `/Users/bo/orca/workspaces/decent-curl-impersonate/r3c-platform/python/decent_curl_impersonate/fetch_api.py:30`, `:44`, `:50`, `:82`, `:90`, `:104`, `:127`.
[^deploy]: `/Users/bo/code/kalevala`, revision above: `k8s/apps/pohjola/decent-fetch-eu/deployment.yaml:10`; `k8s/apps/linnunrata-v2/decent-fetch-au/deployment.yaml:10`; each directory's `network-policy.yaml:12`, `:34`. Read with `git show origin/main:PATH`.
[^harvest]: `/Users/bo/code/civitai/worker/pull.py:146`; `mine_users.py:24`; `Dockerfile:1`. Kalevala revision above: `k8s/apps/pohjola/drawthings/p3-worker.yaml:11`, `:111`; `p3-worker-cnp.yaml:20`.
[^tatu]: `/Users/bo/code/tatu/rust/crates/tatu-router/src/net.rs:20`; `sessions.rs:4`, `:186`; `/Users/bo/code/tatu/rust/README.md:3`.
[^byparr]: Kalevala revision above: `k8s/apps/pohjola/tatu/deployment-byparr.yaml:1`, `:65`.
[^crawlee]: [HTTP clients](https://crawlee.dev/python/docs/guides/http-clients), [web-server integration](https://crawlee.dev/python/docs/guides/running-in-web-server).
[^session]: [Sessions](https://crawlee.dev/python/docs/guides/session-management), [v1.10.2 HTTP client source](https://github.com/apify/crawlee-python/blob/v1.10.2/src/crawlee/http_clients/_curl_impersonate.py#L151).
[^throttle]: [Throttling](https://crawlee.dev/python/docs/guides/request-throttling), [v1.10.2 state and dispatch](https://github.com/apify/crawlee-python/blob/v1.10.2/src/crawlee/request_loaders/_throttling_request_manager.py#L87), [crawler scaling](https://crawlee.dev/python/docs/guides/scaling-crawlers).
[^trace]: [Crawlee telemetry](https://crawlee.dev/python/docs/guides/trace-and-monitor-crawlers).
[^storage]: [Storage lifecycle](https://crawlee.dev/python/docs/guides/storages).
[^scrapy]: [Middleware](https://docs.scrapy.org/en/latest/topics/downloader-middleware.html), [AutoThrottle](https://docs.scrapy.org/en/latest/topics/autothrottle.html).
[^scrapyd]: [Configuration](https://scrapyd.readthedocs.io/en/latest/config.html), [job API](https://scrapyd.readthedocs.io/en/latest/api.html).
[^spider]: [README](https://github.com/spider-rs/spider), [configuration](https://docs.rs/spider/latest/spider/configuration/struct.Configuration.html), [examples](https://github.com/spider-rs/spider/blob/main/examples/README.md).
[^crawl4ai]: [Current server migration](https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/MIGRATION.md), [self-hosting](https://docs.crawl4ai.com/core/self-hosting/), [dispatcher](https://docs.crawl4ai.com/advanced/multi-url-crawling/), [HTTP configuration](https://docs.crawl4ai.com/api/parameters/).
[^firecrawl]: [Source-aligned self-hosting](https://github.com/firecrawl/firecrawl/blob/main/SELF_HOST.md).
[^katana]: [Current CLI flags](https://github.com/projectdiscovery/katana/blob/dev/README.md).
[^gateway]: [JWT](https://gateway.envoyproxy.io/docs/tasks/security/jwt-authentication/), [global limits](https://gateway.envoyproxy.io/docs/tasks/traffic/global-rate-limit/), [telemetry](https://gateway.envoyproxy.io/docs/tasks/observability/).
[^opa]: [OPA/Envoy authorization](https://www.openpolicyagent.org/docs/envoy).
[^temporal]: [Temporal task queues](https://docs.temporal.io/task-queue).
