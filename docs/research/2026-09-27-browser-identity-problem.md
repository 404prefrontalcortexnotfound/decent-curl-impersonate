# Browser identity: problem research

Research snapshot: 2026-09-27. Brief: [issue #29](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/29). This blind review excluded the prohibited issues, plans, and session transcripts. Sources below distinguish code, documented operating constraints, and observed deployment state.

## Problem statement

Ben's devices, agents, and unattended workflows need usable website responses under several different identities: anonymous visitor, authenticated account, and automation client.[^brief][^curl][^pho] A browser-like network handshake does not supply JavaScript execution, personal login state, or a stable outbound IP.[^curl][^session][^cf] These capabilities also differ by execution location and interface.[^registration][^live]

The problem is to establish which identity and browser behavior each authorized task requires, how long that identity must survive, and what evidence proves success. A successful HTTP response or ready service alone cannot answer those questions.[^fetch][^live] The available evidence identifies separate needs below. It does not establish one universal browser requirement or a preferred architecture.

## Actors and places

| Actor or place | Evidence-backed role and boundary |
| --- | --- |
| Ben / Blackfin | Ben's laptop; shell-only research here. Interactive automation must avoid disturbing his desktop.[^brief][^hosts] |
| Silverfin | Second Mac for automation; documented location for Ben's authenticated Chrome access and disruptive browser work. Not accessed in this review.[^brief][^hosts] |
| Claude, Codex, Grok | Local MCP registration code supports these three clients. This proves integration support, not installation on both Macs.[^registration] |
| Pi | Extension exposes HTTP, downloads, sessions, and WebSockets through `decent_curl`.[^curl] |
| OpenCode | Required actor in the brief; shared shell shim is applicable, but dedicated registration and installed capabilities remain unverified.[^brief][^shim] |
| pohjola / linnunrata-v2 | Kubernetes execution locations declared in Omni manifests. Live reads found fetch and Tatu services in both.[^topology][^live] |
| PhoApp workflows | HTTP actions use native fetch; cron triggers support unattended execution. Workers are ready in `phoapp`, `decentpho`, and `mobilisepho`.[^pho][^schedule][^live] |
| Harvest workers / scheduled jobs | Tatu config names Civitai API/media destinations. A live nightly curation CronJob exists; this alone does not prove it needs browser impersonation.[^fleet][^live] |

## Needs

“Gap” means a code limitation, documented restriction, or explicitly unverified requirement, not a measured production outage.

| Need | Who | Where | Current tool | Gap | Evidence |
| --- | --- | --- | --- | --- | --- |
| Browser TLS/HTTP identity and consistent headers | Agents; public-page workflows; harvest workers | Macs; clusters | `curl_cffi` profiles; Tatu wreq emulation | PhoApp native fetch has no equivalent browser profile selection in the inspected client; destination acceptance remains unmeasured. | [^curl][^pho][^tatu] |
| Execute JavaScript and obtain rendered content | Agents reading dynamic sites; challenge-facing workflows | Silverfin; pohjola | Chrome interaction; deployed Byparr | HTTP impersonation does not execute scripts. Ready Byparr does not prove production challenge success. | [^hosts][^curl][^byparr][^cf] |
| Use the correct personal account | Agents acting for Ben | Silverfin | CLI `session-*` reads matching Chrome cookies | Requires profile, Keychain access, and supported cookie encryption. Cookie import does not supply other browser state or JavaScript. | [^session][^shim] |
| Preserve identity across calls and restarts | Agents; long-running or recurring workflows | Local daemon; clusters | In-memory sessions; Tatu sessions | Local handles expire or vanish on shutdown. Fetch API sends no session ID, so its redirects/profile attempts lack a shared named session. | [^engine][^fetch][^tatu] |
| Keep outbound IP, region, and session coherent | Mac callers; Civitai harvest; challenge-facing workflows | Macs; both clusters | Tatu CONNECT; session-bound wreq client; fixed Byparr exit | Geography and continuity are separate from TLS identity; changing IP during a challenge can invalidate it. Required countries remain unspecified. | [^fleet][^tatu][^byparr][^cf] |
| Complete interaction or obtain human help | Agents encountering login or interactive challenges | Silverfin; unattended clusters | Chrome/Orca; Byparr for page fetches | HTTP library cannot complete interactive CAPTCHA. Unattended tasks have no demonstrated human handoff contract. | [^curl][^hosts][^byparr] |
| Distinguish useful content from login, challenge, or paywall | Research agents; scheduled workflows | All callers | Fetch result classifier; PhoApp HTTP action | HTTP status alone is insufficient; article-oriented classification needs task-specific acceptance criteria. Skills cite Stripe/beehiiv login redirects as examples, not measurements from this run. | [^fetch][^article][^pho][^shim] |
| Reach authorized internal services without exposing them to arbitrary URLs | Agents; workflow authors | Macs; cluster workers | Public fetch gate; PhoApp SSRF guard; network policies | Public fetch rejects private destinations. PhoApp guard depends on configuration; browser compatibility does not decide internal-access policy. | [^fetch][^ssrf][^policy] |
| Bound pacing, retries, and resource use | Concurrent agents; unattended jobs | Shared Macs and clusters | Per-host fetch pacing; Tatu throttling; pod limits | Fetch pacing is process-local; overall latency, concurrency, and spending targets are absent from the brief. | [^fetch][^tatu][^byparr][^brief] |
| Obtain the same required capability through each agent interface | Claude, Codex, Grok, OpenCode, Pi | Macs; remote services | MCP, Pi extension, shell shim | Interfaces expose different capabilities; the public fetch route is GET-only, unlike the broader engine. | [^registration][^curl][^shim][^fetch] |

## Constraints

- **Secrets and personal sessions:** the brief restricts credential access to approved wrappers. Cookie values must remain outside reports and agent output. The inspected shim reads Chrome Safe Storage directly; this documents existing behavior, not permission to execute it under this run's wrapper-only rule.[^brief][^session][^hosts]
- **Internal addresses:** public-fetch DNS checks reject non-global addresses, including redirect destinations. PhoApp's in-process guard explicitly states it is not a boundary against malicious native code.[^fetch][^ssrf]
- **Blackfin and macOS:** browser automation belongs on Silverfin. The Tatu skill documents macOS Local Network privacy failures and a loopback relay requirement for Python clients. These restrictions were not reproduced here.[^hosts][^vpn]
- **Cost and capacity:** Byparr requests 768 MiB and permits 3 GiB; the observed EU fetch pod requests 128 MiB and permits 512 MiB. These are resource settings, not measured use or monetary prices. No spending ceiling or workload volume is supplied.[^byparr][^live][^brief]
- **Site permission:** the project requires authorized use and compliance with service terms. Cloudflare explicitly excludes automated browsers from supported production challenge solving. Site-specific permissions, permitted accounts, and escalation policy remain Ben's inputs.[^curl][^cf]

## Failure modes

These are code-derived or documented risks unless marked observed.

1. **False success:** a login, consent, or challenge response can contain HTML without the requested content. The fetch classifier distinguishes these states, while PhoApp accepts successful HTTP status independently of page meaning.[^fetch][^pho]
2. **Lost continuity:** each public-fetch engine call omits `session_id`; the engine creates and closes a temporary session. Cookies acquired on one redirect hop therefore do not carry to the next through a named session.[^fetch][^engine]
3. **Expired handles:** idle cleanup removes unused sessions; the daemon default is 30 minutes. Restart durability is absent from the in-memory implementation.[^engine]
4. **Identity mismatch:** a different IP for challenge solving can produce a loop. Tatu's fetch header allowlist also removes caller `Authorization` and `Cookie`; it is not transparent personal-session forwarding.[^cf][^tatu]
5. **Unavailable egress or capacity:** Tatu represents network failures, refused redirects, and oversized bodies separately. Byparr readiness is a TCP probe, so readiness does not establish destination reachability.[^tatu][^byparr]
6. **TLS trust differs from browser expectations:** PhoApp's inspected HTTP client sets `NODE_TLS_REJECT_UNAUTHORIZED='0'`. Its maintainer should assess this separately; no change occurred here, and deployed equivalence was not established.[^pho]

## Open questions for Ben

- Which sites and actions are essential, and what content or completed action proves success for each?
- Which tasks may use Ben's personal login, which need separate accounts, and which state may cross devices or persist?
- Which tasks require the same IP across requests or runs, and which countries are permitted?
- Which internal services may each automation reach, under whose identity?
- What request volume, latency, retry limit, resource budget, and paid-service ceiling are acceptable?
- When login, consent, payment, or a challenge requires a person, should unattended work stop, defer, or request help?

Saved workflow definitions, per-site outcomes, account permissions, and monetary costs were not established. Silverfin access was explicitly excluded. The fetch deployments are declared in Kalevala `origin/main` at `k8s/apps/pohjola/decent-fetch-eu/` and `k8s/apps/linnunrata-v2/decent-fetch-au/` (commit `91c88294`; `deployment.yaml:43-49` sets 128Mi/512Mi). A first search of an older local checkout missed them. Image-to-source equivalence remains unverified. These gaps prevent an exhaustive site/task inventory, not the separation of needs above.[^brief][^live]

## Evidence

Local source snapshots: `decent-curl-impersonate@5878f3d3f948`, `tatu@2dca3cd0d6fd`, `kalevala@0b94c99859b1`, `pho-app@8724448351fd`. Inspected source paths had no tracked diff. Skills and web sources were read on 2026-09-27.

[^brief]: [Issue #29, sections 1–5](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/29).
[^curl]: `/Users/bo/code/decent-curl-impersonate/README.md:3`, `:110`, `:183`, `:195`.
[^registration]: `/Users/bo/code/decent-curl-impersonate/python/decent_curl_impersonate/registration.py:92`.
[^shim]: `/Users/bo/.agents/skills/decent-curl/SKILL.md:10`, `:28`, `:34`, `:65`.
[^hosts]: `/Users/bo/.agents/skills/ssh-to-silverfin/SKILL.md`, “Browser and desktop work”; issue #29, section 3.
[^session]: `/Users/bo/.agents/skills/decent-curl/cli.sh:83`, `:97`, `:119`, `:144`, `:172`.
[^topology]: `/Users/bo/code/kalevala/omni/pohjola-cluster.yaml:1`; `/Users/bo/code/kalevala/omni/linnunrata-cluster.yaml:1`.
[^pho]: `/Users/bo/code/pho-app/packages/pieces/common/src/lib/http/core/fetch-http-client.ts:27`, `:45`, `:73`; `/Users/bo/code/pho-app/packages/pieces/core/http/src/lib/actions/send-http-request-action.ts:28`.
[^schedule]: `/Users/bo/code/pho-app/packages/pieces/core/schedule/src/lib/triggers/cron-expression.trigger.ts:5`.
[^fetch]: `/Users/bo/code/decent-curl-impersonate/python/decent_curl_impersonate/fetch_api.py:30`, `:44-47`, `:50`, `:81`, `:104`, `:120`, `:142`.
[^article]: `/Users/bo/code/decent-curl-impersonate/python/decent_curl_impersonate/article_verifier.py:22`, `:33`, `:38`.
[^engine]: `/Users/bo/code/decent-curl-impersonate/python/decent_curl_impersonate/engine.py:155`, `:215`, `:495`, `:623`; `/Users/bo/code/decent-curl-impersonate/python/decent_curl_impersonate/http_server.py:39`.
[^tatu]: `/Users/bo/code/tatu/rust/crates/tatu-router/src/sessions.rs:4`, `:93`, `:133`; `/Users/bo/code/tatu/rust/crates/tatu-router/src/net.rs:20`, `:39`, `:178`.
[^fleet]: `/Users/bo/code/kalevala/k8s/apps/pohjola/tatu/config/fleet.yaml:43`.
[^byparr]: `/Users/bo/code/kalevala/k8s/apps/pohjola/tatu/deployment-byparr.yaml:1`, `:63`, `:85`, `:110`.
[^ssrf]: `/Users/bo/code/pho-app/packages/server/engine/src/lib/network/ssrf-guard.ts:18`, `:46`.
[^policy]: `/Users/bo/code/kalevala/k8s/apps/pohjola/tatu/ciliumnetworkpolicy.yaml:395`, `:452`.
[^vpn]: `/Users/bo/.agents/skills/tatu/SKILL.md`, “Tatu”, “Relay”, and “Rules”.
[^cf]: Cloudflare: [supported browsers](https://developers.cloudflare.com/cloudflare-challenges/reference/supported-browsers/#unsupported-environments) and [challenge limitations](https://developers.cloudflare.com/cloudflare-challenges/concepts/how-challenges-work/#limitations).
[^live]: Read-only `kubectl` observations, 2026-09-27 11:04–11:06 UTC, commands exited 0. For each context, `kubectl --context CONTEXT get deployments,cronjobs -A --request-timeout=20s` showed: pohjola `decent-fetch-eu`, `phoapp-worker`, `decentpho-worker`, `tatu-byparr` each with one ready replica; linnunrata-v2 `decent-fetch-au`, `mobilisepho-worker` each with one. Both had two ready `tatu-router` and two ready `tatu-edge` replicas. Targeted `get deployment -n decent-fetch NAME -o json` reads showed both fetch deployments using digest `sha256:cd7b70d30f73ef36bdf8e97897b0faf24918cd5f98d2e2118e70f0f4d1b68453`; the EU read supplied resource settings. `kubectl --context pohjola get cronjob drawthings-curation-export-nightly -n drawthings` showed schedule `10 5 * * *`, `suspend=false`. These reads establish deployed presence, not successful browsing.
