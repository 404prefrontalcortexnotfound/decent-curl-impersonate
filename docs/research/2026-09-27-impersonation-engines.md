# Browser impersonation engines: measured comparison

Snapshot: 2026-09-27 UTC. Brief: [R2 #33](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/33), [epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31), [problem baseline](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30).

**Recommendation: keep curl_cffi as the production engine for now; prefer its maintained upstream release over freezing the installed version.** Native wreq ranks next. Seven configurations, including installed Chrome146, tied at 17/20 HTTP 200 responses. HTTP 200 does not establish content success. Ranking weighs outcomes, fingerprints, features, maintenance, and reproducibility; it does not endorse our wrapper.

## Maintenance

`python3 /tmp/r2-evidence/maintenance.py` ran the three required GitHub queries sequentially, counting commits since 2026-06-29 without pagination truncation. All candidates meet the 180-day rule, including CycleTLS's 2026-04-27 commit and AzureTLS's 2026-04-17 release. Stars do not prove correctness.

| Repository | Stars / open issues | License | Latest release date | Last push | Commits/90d |
|---|---:|---|---|---|---:|
| [lexiforest/curl_cffi](https://github.com/lexiforest/curl_cffi) | 6568 / 64 | MIT | 2026-09-20 | 2026-09-27 | 50 |
| [lexiforest/curl-impersonate](https://github.com/lexiforest/curl-impersonate) | 2784 / 30 | MIT | 2026-09-16 | 2026-09-26 | 47 |
| [0x676e67/wreq](https://github.com/0x676e67/wreq) | 1047 / 24 | Apache-2.0 | 2026-08-27 | 2026-09-25 | 73 |
| [0x676e67/rnet](https://github.com/0x676e67/rnet) | 1451 / 9 | Apache-2.0 | 2026-09-27 | 2026-09-27 | 23 |
| [bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) | 1863 / 46 | BSD-4-Clause | 2026-09-02 | 2026-09-04 | 14 |
| [Danny-Dasilva/CycleTLS](https://github.com/Danny-Dasilva/CycleTLS) | 1521 / 70 | GPL-3.0 | none (404) | 2026-07-07 | 0 |
| [imroc/req](https://github.com/imroc/req) | 4868 / 27 | MIT | 2026-08-13 | 2026-09-11 | 43 |
| [Noooste/azuretls-client](https://github.com/Noooste/azuretls-client) | 471 / 33 | MIT | 2026-04-17 | 2026-04-17 | 0 |
| [enetx/surf](https://github.com/enetx/surf) | 1837 / 0 | MIT | 2026-09-10 | 2026-09-10 | 11 |
| [refraction-networking/utls](https://github.com/refraction-networking/utls) | 2583 / 59 | BSD-3-Clause | 2026-01-13 | 2026-09-24 | 7 |
| [deedy5/primp](https://github.com/deedy5/primp) | 611 / 3 | MIT | 2026-09-12 | 2026-09-13 | 46 |

The rnet repository redirects to **wreq-python** (`wreq==0.12.3`). Frozen `rnet==2.4.2` exposes Chrome137. Primp adds a maintained Rust/Python alternative. curl-impersonate supplies curl_cffi's transport, not an independent result.[^profiles]

## Profiles and reproducibility

| ID | Tested engine/version | Newest selected Chrome | Release/snapshot date |
|---|---|---:|---|
| B | installed curl_cffi 0.15.0 | 146 | 2026-04-03 |
| C | curl_cffi 0.16.3 | 150 | 2026-09-02 |
| W | wreq 0.16.1 + wreq-util Git snapshot | 153 | profile snapshot 2026-09-14 |
| P | wreq Python 0.12.3 | 153 | 2026-09-27 |
| Q | primp 2.0.1 | 153 | 2026-09-12 |
| T | tls-client 1.16.0 | 152 | 2026-09-02 |
| S | Surf 1.0.206 | 152 | 2026-09-10 |
| R | req 3.61.0 | 120 | 2026-08-13 |
| A | AzureTLS 1.13.2 | TLS133 / UA135 | 2026-04-17 |
| Y | CycleTLS Go 1.0.30 | unversioned default JA3 | 2025-10-02 module tag |
| U | uTLS 1.8.2 + Go HTTP transport | 133 | 2026-01-13 |

The latest curl_cffi prerelease, 0.16.4b1, also enumerated Chrome150 as its newest profile (`/tmp/r2-curl-beta/.venv/bin/python`, `BrowserType` enumeration). Stable 0.16.3 therefore supplies the newest available named Chrome preset.

Dates identify tested releases; first profile introduction is **not measured**. CycleTLS has caller-supplied fingerprints instead of numbered presets. Its probe uses default JA3 and Chrome120 user-agent.[^profiles]

Google gives Chrome154's stable release as [2026-09-22](https://developer.chrome.com/release-notes/154). Profiles 153/152/150/146 therefore trail by 1/2/4/8 milestones. The [Chromiumdash Mac API](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Mac&num=3) also returned 155.0.8059.12 dated 2026-09-23. This source disagreement is unresolved; none of these engines claims 154 or 155 in the tested stable packages.

Blackfin: `go version go1.27.1 darwin/arm64`; `cargo 1.98.1`. Programs: `/tmp/r2-<engine>/`, no global installations. Separate Go modules resolved Surf's uTLS conflict. Rust reused cached revisions: wreq `cd76bcdf1307153de289d34e072528bdf0510a3b`, wreq-util `e3922a2b2d976487cb4cf4e7b0ac290b3ce77f66`, btls `129887582a538b8f4dcf371d15c953335312ca37`. The registry copy of wreq-util 0.2.0 only listed Chrome149. The current Git snapshot supplied 153; this packaging discrepancy is a reproducibility risk.[^build]

## Fingerprints

`python3 /tmp/r2-evidence/measure.py fingerprints` queried [Peet](https://tls.peet.ws/api/all). All negotiated h2 and offered ALPN `h2,http/1.1`. JA3 changes with shuffled extensions; JA4 normalizes order. Without a real-browser control, library agreement cannot prove browser equivalence.

| Engine | JA3 hash | JA4 | HTTP/2 group |
|---|---|---|---|
| B | `65cc36727db5e7a5de6e9c3ca268e1ca` | `t13d1516h2_8daaf6152771_d8a2da3f94cd` | H |
| C | `6d5f329df881bc48688495dc5b92603a` | `t13d1516h2_8daaf6152771_806a8c22fdea` | H |
| W | `f2cb3053d24390ccb5e76053700b7abe` | `t13d1517h2_8daaf6152771_cb7bf5808d99` | H |
| P | `0234d52efa0faad75e4e906a7cb6d983` | `t13d1517h2_8daaf6152771_cb7bf5808d99` | H |
| Q | `2dbf2ee7d792e8963d2e367a6bf481ec` | `t13d1517h2_8daaf6152771_cb7bf5808d99` | H |
| T | `2d25c56381929cc91bc97631a0a46f58` | `t13d1517h2_8daaf6152771_cb7bf5808d99` | H |
| S | `a4b3a686245c880ff5502f1ab8830c82` | `t13d1517h2_8daaf6152771_cb7bf5808d99` | H |
| R | `fe8e5df1ba3c40e41ea8c94e17b1b84d` | `t13d1516h2_8daaf6152771_02713d6af862` | R |
| A | `791ffdccee5263f22dce8d3110096bad` | `t13d1516h2_8daaf6152771_d8a2da3f94cd` | H |
| Y | `e1d8b04eeb8ef3954ec4f49267a783ef` | `t12d1515h2_8daaf6152771_4d8a99c1bc01` | Y |
| U | `dbb3b85c0156de67c4b65d8c9bad6084` | `t13d1516h2_8daaf6152771_d8a2da3f94cd` | U |

Exact Akamai signatures (HTTP/2 settings, window update, priority, pseudo-header order):

- H: `1:65536;2:0;4:6291456;6:262144|15663105|0|m,a,s,p`
- R: `1:65536;2:0;3:1000;4:6291456;6:262144|15663105|0|m,a,s,p`
- Y: `1:65536;3:1000;4:6291456;5:16384;6:262144|15663105|0|m,a,s,p`
- U: `2:0;4:4194304;5:1048576;6:10485760|1073741824|0|a,m,p,s`

Here m/a/s/p means `:method/:authority/:scheme/:path`. Surf and tls-client agree at Chrome152. Native/Python wreq and Primp agree at Chrome153. uTLS supplies TLS impersonation, while the harness's Go HTTP/2 transport produces a distinct HTTP fingerprint. CycleTLS's default reports TLS1.2, despite its Chrome120 user-agent. These are observed defaults, not limits on custom configuration.

Header order uses these abbreviations: c=`sec-ch-ua,sec-ch-ua-mobile,sec-ch-ua-platform`; n=`upgrade-insecure-requests,user-agent,accept,sec-fetch-site,sec-fetch-mode,sec-fetch-user,sec-fetch-dest`; e=`accept-encoding,accept-language,priority`.

| Engines | Regular header order |
|---|---|
| B,C,W,P,S | c,n,e |
| Q | n,c,e (observed Android platform) |
| T | user-agent,accept,accept-language,accept-encoding |
| R | pragma,cache-control,c,n,accept-encoding,accept-language |
| A | accept-encoding,user-agent |
| Y | user-agent |
| U | user-agent,accept-encoding |

An extractor error (`type` versus `frame_type`) required one repeat per engine for header order. A separate [Browserleaks](https://tls.browserleaks.com/json) pass matched JA4 and HTTP/2 for all 11 probes (`/tmp/r2-evidence/browserleaks.jsonl`). Fingerprint evidence contains no visitor IP or cookie values.

## Features and memory

Y means documented or source-supported, not live-tested. “?” means not established. Proxy columns cover HTTP CONNECT / SOCKS5, then authentication. Feature interoperability, HTTP/3 fingerprints, WebSockets, streaming, cookie persistence, and concurrent load are **not measured**. Sources: linked upstream documentation.

| Engine | Sessions/jar | H3 | WebSocket | Proxies/auth | Streaming | Concurrency | Idle RSS KiB |
|---|---|---|---|---|---|---|---:|
| [B/C](https://curl-cffi.readthedocs.io/en/latest/) | Y | Y | Y | Y/Y, Y | Y | sync/asyncio | 34336/35136 |
| [W/P](https://github.com/0x676e67/wreq#features) | Y | ? | Y | Y/Y, Y | Y | Tokio/Compio; Python async/blocking | 5680/23584 |
| [Q](https://github.com/deedy5/primp) | Y | ? | ? | proxy Y, types/auth ? | Y | sync/asyncio | 34240 |
| [T](https://github.com/bogdanfinn/tls-client) | Y | ? | Y | Y/Y, Y | io.Reader | goroutines | 12704 |
| [S](https://github.com/enetx/surf) | Y | Y | ? | Y/Y, auth ? | Y | goroutines | 12784 |
| [R](https://github.com/imroc/req) | Y | Y | ? | Y/Y, Y | Y | goroutines | 12496 |
| [A](https://github.com/Noooste/azuretls-client) | Y | Y | Y | Y/Y, Y | Y | goroutines | 19712 |
| [Y](https://github.com/Danny-Dasilva/CycleTLS) | caller cookies/jar | Y | Y | Y/Y, Y | Y | goroutines; JS wrapper | 19680 |
| [U](https://github.com/refraction-networking/utls) | caller transport | caller | caller | caller | TLS stream | caller | n/a |

`python3 /tmp/r2-evidence/measure.py memory` created one idle client per process, then sampled `ps -o rss= -p PID`. RSS includes runtime/shared libraries, not incremental client allocation. uTLS has no HTTP client. Feature source details: tls-client `connect.go:144`, req `transport.go:2154`, AzureTLS `structs.go:203`, and Primp's installed `__init__.pyi:329`, under the versioned `/tmp/r2-*` paths.

## Site measurements

The [20 specified URLs](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/33) ran anonymously on Blackfin. Each fresh client verified TLS, timed out at 20 seconds, and disabled redirects/application retries. tls-client/CycleTLS/uTLS required caller headers. Different platforms/languages prevent causal attribution to engines alone.

Stage counts were 11 requests to one site, 55 to the next five, then 154 to the remaining fourteen. Requests completed at least 1.1 seconds apart within each stage. Request wall-time sums were 1.661/68.186/131.874 seconds, excluding pacing. All 220 primary observations are in `/tmp/r2-evidence/sites.jsonl`. Cells give **status/bytes**. Byte counts describe decoded bodies (Go output re-encodes UTF-8), not network transfer sizes.

D = DataDome marker; I = Cloudflare script indicator, not proof of a challenge. E = transport error. Redirects were not followed. Earlier saved page samples show ordinary news content at psychiatrist/Mad in America, a Reddit humanity check or empty shell, and Civitai's Australian restriction. These samples inform interpretation; they do not validate every fresh response. Per-response article usefulness and exhaustive challenge detection are **not measured**.[^samples]

| Site | B | C | W | P | Q | T | S | R | A | Y | U |
|---|---|---|---|---|---|---|---|---|---|---|---|
| tga | 200/175599 | 200/175599 | 200/175599 | 200/175598 | 200/175598 | 200/175599 | 200/175599 | 200/175599 | 200/175229 | 200/175229 | 200/175229 |
| fda | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 | 200/41434 |
| ema | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 | 200/91957 |
| mhra | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 | 200/119475 |
| pmda | 200/56262 | 200/56262 | 200/56262 | 200/56262 | 200/56262 | 200/56262 | 200/56262 | 200/56262 | 200/56262 | 200/56262 | E/0* |
| anvisa | 200/579301 | 200/579305 | 200/579305 | 200/579301 | 200/579305 | 200/579304 | 200/579306 | 200/579306 | 200/579304 | 200/579305 | E/0* |
| canada | 200/31304 | 200/31304 | 200/31304 | 200/31292 | 200/31292 | 200/31304 | 200/31304 | 200/31304 | E/0 | 0/96 | E/0 |
| hsa | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 | 200/441277 |
| swissmedic | 200/67816 | 200/66647 | 200/66467 | 200/66919 | 200/66467 | 200/67105 | 200/67222 | 200/67824 | 200/66501 | 200/67690 | 200/66635 |
| medsafe | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 | 200/14957 |
| abc | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 | 301/0 |
| guardian | 200/1553710 | 200/1553710 | 200/1553710 | 200/1553710 | 200/1553714 | 200/1553714 | 200/1553714 | 200/1553710 | 200/1553716 | 200/1553717 | 200/1553710 |
| nytimes | 200/1478882 | 200/1478880 | 200/1478882 | 200/1478882 | 200/1478880 | 200/1478880 | 200/1541927 | 403/774D | 403/774D | 403/774D | 403/774D |
| statnews | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 | 200/355910 |
| psychiatrist (I) | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 | 200/71716 |
| madinamerica (I) | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 | 200/268984 |
| medscape | 200/275359 | 200/275360 | 200/275360 | 200/275359 | 200/275364 | 200/275361 | 200/275359 | 200/275360 | 200/275360 | 200/275359 | 200/275359 |
| civitai | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 | 307/15 |
| reddit | 200/166964 | 200/166964 | 200/166964 | 200/166964 | 200/8412 | 200/8412 | 200/166964 | 200/8412 | 200/8412 | 200/8412 | 200/8412 |
| bloomberg | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 | 302/142 |

R returned 16 HTTP 200; A/Y returned 15. U returned 13, then 15 after harness corrections.

Failures and corrections:

- U at PMDA/Anvisa: `http2: failed reading the frame payload: http2: frame too large, note that the frame header looked like an HTTP/1.1 header`. The harness ignored negotiated ALPN. Correction: use HTTP/1.1 when selected. Two additional requests returned `200/56262` in 2644 ms and `200/579305` in 9720 ms. These are harness failures, not uTLS defects.
- A at Canada: `stream error: stream ID 1; INTERNAL_ERROR`. U: `stream error: stream ID 1; INTERNAL_ERROR; received from peer`. Y returned status `0` with 96 bytes, not an HTTP response. Its message was not retained. Other engines reached Canada. No retry masked these observations.
- R/A/Y/U received NYTimes `403/774` with a DataDome challenge marker. The other seven received HTTP 200.

Fresh page bodies/visitor identifiers were discarded. There were 33 diagnostic and 222 site requests, including corrections that exceed the brief's one-request target.

## Ranking and decision boundary

1. **curl_cffi:** first for current production retention. Active upstream, complete default headers, documented HTTP/3 and WebSocket support, and tied site outcomes. Risk: older named Chrome preset; the installed 0.15.0 also needs an upstream-update decision.
2. **wreq / wreq-python:** first replacement candidate. Chrome153, matching native/binding fingerprints, tied site outcomes, and low native idle RSS. Risks: the Rust profile required Git pins, HTTP/3 remains unestablished, and state/load behavior was not tested. Prefer the current `wreq` Python package over frozen `rnet`.
3. **Surf:** Chrome152, full headers, HTTP/3, and tied site outcomes. Risks: WebSocket/auth completeness remains unestablished and it pins a uTLS development revision.
4. **tls-client:** Chrome152 and tied site outcomes. Risks: callers must construct matching headers; BSD-4-Clause needs a deployment license check; HTTP/3 remains unestablished.
5. **Primp:** Chrome153 and tied site outcomes. Risks: default platform varied to Android in the fingerprint probe; set a platform explicitly. WebSocket and proxy authentication coverage remain unestablished.
6. **req:** maintained, broad HTTP features, but its Chrome120 preset received NYTimes's challenge.
7. **AzureTLS:** broad features, but stale preset/UA disagreement, Canada transport failure, and NYTimes challenge.
8. **CycleTLS:** Go/JavaScript interfaces and documented H3/WebSocket support, but unversioned default fingerprint, TLS1.2 observation, Canada failure, and NYTimes challenge. GPL-3.0 is an additional deployment consideration.
9. **uTLS alone:** useful foundation, not a complete engine replacement. HTTP behavior, headers, cookies, proxies, and protocol fallback remain the caller's responsibility. The measured Go HTTP/2 signature differs from the browser-shaped clients.

Tatu already builds wreq with Chrome149 at `/Users/bo/code/tatu/rust/crates/tatu-router/src/net.rs:23`. Its dependency is `wreq=6.0.0-rc.31` (`/Users/bo/code/tatu/rust/crates/tatu-router/Cargo.toml:29`), unlike this upstream snapshot. Existing use reduces unfamiliarity, not acceptance requirements. Keep network exits separate from HTTP identity, as the epic requires. Tatu remained unchanged.

Change the retention recommendation when a pinned replacement delivers more verified target content under matched headers/platform/IP, or demonstrates a required capacity/feature advantage. Test cookies, authenticated HTTP/SOCKS proxies, streaming, WebSockets, cancellation, and concurrent memory before migration. Ben owns engine selection at G1; no implementation or deployment occurred.

Evidence hashes: `sites.jsonl` SHA-256 `a896fe7ef5fa350a5cb90dec00bd164b9651bdc2a09c25252a5eb260b5350677`; `fingerprints.log` `833648935aed64b79ebce32ad43f86287e2a77405fe4d7e58d300f5ebac585e7`. Harness commands: `python3 /tmp/r2-evidence/measure.py fingerprints`, `sites 1`, `sites 2`, `sites 3`, `memory`; `python3 /tmp/r2-evidence/browserleaks.py`. Local `/tmp` evidence remains for review. Idle probes terminated.

## Evidence paths

[^profiles]: `/tmp/r2-evidence/maintenance.json:1`; installed `BrowserType` enumeration; `/tmp/r2-evidence/python-install.txt:1`; `/tmp/r2-evidence/wreq-python-install.txt:1`; `/tmp/r2-go-cache/pkg/mod/github.com/bogdanfinn/tls-client@v1.16.0/profiles/profiles.go:37`; `/tmp/r2-go-cache/pkg/mod/github.com/imroc/req/v3@v3.61.0/client_impersonate.go:128`; `/tmp/r2-go-cache/pkg/mod/github.com/!noooste/azuretls-client@v1.13.2/profiles.go:43`; `/tmp/r2-go-cache/pkg/mod/github.com/refraction-networking/utls@v1.8.2/u_common.go:615`; [Primp profiles](https://github.com/deedy5/primp#supported-impersonations); [curl_cffi release](https://github.com/lexiforest/curl_cffi/releases/tag/v0.16.3).
[^build]: `/tmp/r2-wreq/Cargo.toml:1`; `/tmp/r2-evidence/wreq-build.txt:1`; [wreq-util snapshot](https://github.com/0x676e67/wreq-util/blob/e3922a2b2d976487cb4cf4e7b0ac290b3ce77f66/src/emulate.rs#L66). Earlier attempts supplied cached sources and build artifacts in `/tmp/r2-final`. Numerical measurements were collected again by this attempt.

[^samples]: Prior-attempt artifacts, inspected as page data rather than session transcripts: `/tmp/r2-sites/psychiatrist__curl_cffi.html:1`, `/tmp/r2-sites/madinamerica__curl_cffi.html:1`, `/tmp/r2-sites/civitai__curl_cffi.html:1`, `/tmp/r2-sites/reddit__curl_cffi.html:1`, `/tmp/r2-sites/reddit__rnet.html:1`. Reddit's 166964-byte sample says “Prove your humanity”; the 8412-byte sample has no visible content beyond “Reddit”. Fresh sizes match; hashes differ. This is supporting evidence, not identical-response confirmation.
