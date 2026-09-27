# Browser impersonation engines: measured comparison

Snapshot: 2026-09-27 UTC. Brief: [R2 #33](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/33), [epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31), [problem baseline](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30).

**Interim finding:** wreq, its Python binding, Surf, and tls-client supply fresher profiles than the installed curl_cffi. Site measurements are still running. This draft does not authorize implementation.

## Maintenance

These are outputs of `python3 /tmp/r2-evidence/maintenance.py`, which ran the issue's three GitHub API queries sequentially. The 90-day window starts 2026-06-29. All commit counts fit one 100-entry page. Every candidate meets the 180-day rule, including CycleTLS's 2026-04-27 commit and AzureTLS's 2026-04-17 release. A push timestamp alone did not establish maintenance. Stars indicate adoption, not correctness.

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

The rnet repository redirects to **wreq-python**. Its current package is `wreq==0.12.3`; `rnet==2.4.2` exposes only Chrome137. Tests use the maintained successor. Primp is the extra candidate: a maintained Rust/Python alternative with Chrome153. curl-impersonate supplies curl_cffi's C transport, so it is not an independent result.[^profiles]

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

Dates identify the tested release containing the profile, not its first introduction, which is **not measured**. CycleTLS requires caller-supplied fingerprints rather than a maintained numbered Chrome catalogue. Its probe uses the default JA3 and Chrome120 user-agent.[^profiles]

Google gives Chrome154's stable release as [2026-09-22](https://developer.chrome.com/release-notes/154). Profiles 153/152/150/146 therefore trail by 1/2/4/8 milestones. The [Chromiumdash Mac API](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Mac&num=3) also returned 155.0.8059.12 dated 2026-09-23. This source disagreement is unresolved; none of these engines claims 154 or 155 in the tested stable packages.

Blackfin commands returned `go version go1.27.1 darwin/arm64` and `cargo 1.98.1`. Programs are under `/tmp/r2-<engine>/`; no global package installation occurred. Separate Go modules avoid Surf's uTLS dependency conflict. Rust used cached upstream revisions: wreq `cd76bcdf1307153de289d34e072528bdf0510a3b`, wreq-util `e3922a2b2d976487cb4cf4e7b0ac290b3ce77f66`, btls `129887582a538b8f4dcf371d15c953335312ca37`. The registry copy of wreq-util 0.2.0 only listed Chrome149. The current Git snapshot supplied 153; this packaging discrepancy is a reproducibility risk.[^build]

## Fingerprints

`python3 /tmp/r2-evidence/measure.py fingerprints` queried [Peet](https://tls.peet.ws/api/all). All negotiated h2 and offered ALPN `h2,http/1.1`. JA3 changes with extension shuffling, so hash inequality alone does not establish mismatch. JA4 normalizes that order. No real-browser control was permitted, so agreement between libraries does not prove browser equivalence.

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

The first extractor used `type` instead of Peet's `frame_type`, losing header order. One repeat per engine corrected extraction. A separate [Browserleaks](https://tls.browserleaks.com/json) pass cross-checks JA4 and HTTP/2. Fingerprint evidence contains no visitor IP or cookie values.

## Site measurements

Pending completion of the 20-URL matrix.

## Evidence paths

[^profiles]: `/tmp/r2-evidence/maintenance.json:1`; installed `BrowserType` enumeration; `/tmp/r2-evidence/python-install.txt:1`; `/tmp/r2-evidence/wreq-python-install.txt:1`; `/tmp/r2-go-cache/pkg/mod/github.com/bogdanfinn/tls-client@v1.16.0/profiles/profiles.go:37`; `/tmp/r2-go-cache/pkg/mod/github.com/imroc/req/v3@v3.61.0/client_impersonate.go:128`; `/tmp/r2-go-cache/pkg/mod/github.com/!noooste/azuretls-client@v1.13.2/profiles.go:43`; `/tmp/r2-go-cache/pkg/mod/github.com/refraction-networking/utls@v1.8.2/u_common.go:615`; [Primp profiles](https://github.com/deedy5/primp#supported-impersonations); [curl_cffi release](https://github.com/lexiforest/curl_cffi/releases/tag/v0.16.3).
[^build]: `/tmp/r2-wreq/Cargo.toml:1`; `/tmp/r2-evidence/wreq-build.txt:1`; [wreq-util snapshot](https://github.com/0x676e67/wreq-util/blob/e3922a2b2d976487cb4cf4e7b0ac290b3ce77f66/src/emulate.rs#L66). Earlier attempts supplied cached sources and build artifacts in `/tmp/r2-final`; all measurements in this report were collected again by this attempt.
