# Playwright Removal and curl Impersonation Design

## Goal

Remove Playwright from the active agent and Hemingway operations stack without treating HTTP impersonation as a browser replacement.

The target operating model is:

- `decent-curl-impersonate` handles authorized HTTP, session, redirect, and streamed-download work;
- a Hemingway-owned Zoom helper handles recording acquisition through a bounded HTTP state machine;
- Silverfin is the manual route when JavaScript, CAPTCHA, consent, OAuth, MFA, or other human browser interaction is required; and
- application-owned Playwright E2E and runtime packages remain installed and usable.

The cutover is accepted only after deterministic fixtures and an explicitly authorized Zoom canary exercise the selected target route through the common artifact completion predicate. If operations require automated acquisition, the canary must prove the automated route. If operations accept manual acquisition, a `manual_required` classification proves routing only; the canary must continue through remote browser download, guarded transfer, and verified local ingest before cutover, and must not claim automated Zoom acquisition.

## Scope and ownership boundary

### In scope

- the Playwright MCP registrations used by Pi, Warp shared, Warp local, and Warp OSS;
- Pi's Playwright MCP metadata and npx resolver entries;
- Playwright MCP processes, MCP browser profiles, MCP output directories, and unreferenced MCP/browser package caches;
- the Hemingway Zoom downloader, its tests, its operational package dependency, and its live skill instructions;
- a private-input Zoom helper, its fixture suite, authorized canary gate, and Silverfin handoff contract;
- configuration backup, cutover verification, and rollback instructions that contain no browser profile or cookie state.

### Out of scope

- Playwright packages used by application E2E, integration, smoke, visual, or runtime functionality;
- application Playwright configuration, tests, browsers, and caches still referenced by those packages;
- automated JavaScript execution, DOM interaction, CAPTCHA solving, consent, OAuth, MFA, or human-verification bypasses;
- creating Zoom apps, granting scopes, supplying credentials, or inferring authorization;
- rewriting historical handoffs, transcripts, release notes, vendor caches, or repository history to remove the word “Playwright”;
- changing `decent-curl-impersonate` into a site-specific Zoom client.

Before implementation, inventory application-owned Playwright references and record an explicit allowlist. Post-cutover checks compare against that allowlist rather than requiring a machine-wide zero-string result. Any request to remove an allowlisted application dependency is a separate migration. Design review and fixture planning are read-only: they do not authorize live Zoom or Silverfin access or browser, process, configuration, cache, profile, or package mutation.

Hemingway's shared data package cannot retain Playwright solely for `capture-gif.js`. Before the operational dependency is removed, that utility must either use an independently approved non-Playwright implementation or move with its package ownership into the application/design-tool allowlist. Designing that renderer or changing its behavior is a separate prerequisite, not part of the Zoom helper.

## Existing curl guarantees used by this design

The Zoom helper composes the installed curl stack instead of changing its public five-tool surface. The current extension provides:

- `curl_cffi.AsyncSession` cookie and connection continuity within one process;
- browser impersonation profiles discovered from the installed `curl_cffi` version;
- explicit redirect policy;
- streaming downloads with SHA-256 results;
- mode-`0700` directories and mode-`0600` files on POSIX;
- refusal to overwrite by default and partial-file cleanup on failure; and
- redaction of authorization, cookie, proxy-authorization, and `Set-Cookie` values from result metadata.

These are transport guarantees only. The curl project does not execute JavaScript, render a DOM, click controls, import browser profiles, solve challenges, or promise that impersonation defeats detection.

## Hemingway Zoom helper

### Boundary

The helper is a Hemingway-owned Python entry point executed in the pinned `decent-curl-impersonate` Python environment. It imports the curl transport library directly and does not add Zoom-specific operations to Pi's generic curl tools.

One invocation handles one recording acquisition. It owns one `AsyncSession` from bootstrap through all media downloads, then closes it. It emits one secret-free structured result. Outcomes, reasons, and exit statuses follow the closed result contract below; callers must not infer success from process exit alone.

### Private input

Dynamic share URLs, passcodes, and tokens must not appear in model tool arguments, command-line arguments, filenames, logs, tracebacks, or structured output.

The trusted launcher creates a unique mode-`0700` input directory and an ephemeral versioned input document within it. It opens the document with exclusive creation and no symlink following, sets and verifies mode `0600` and current-user ownership, writes only the fields required by the explicitly selected route, and supplies an already-open descriptor or non-secret path to the helper. A fixed credential reference may be resolved only inside the launcher and child process; the model must never be asked to paste a secret.

The helper opens the document without following symlinks, then verifies that the opened object is the same regular file the launcher identified, is owned by the current user, has mode exactly `0600`, contains no unknown fields, and selects exactly one credential mode. It reads and validates the document once and keeps secret values in process memory only. The helper unlinks the input immediately after a successful open where the platform permits; independently, the launcher's `finally` path removes the input document and its private directory after every child exit, signal, timeout, validation rejection, or launch failure. Tests must prove the path is absent on every exit class. No persistent credential document is part of this design.

Output and log redaction scans use caller-provided sentinel markers in tests and the canary. Scans inspect only generated output and the existence, names, modes, sizes, and hashes of allowed artifacts; they never print or copy the private input document's contents. Redaction is defense in depth: the implementation constructs metadata from an allowlist rather than serializing requests, responses, headers, cookies, signed URLs, HTML, or exceptions wholesale.

### Output contract

The result is a versioned closed schema with exactly these common fields: `schema_version`, `outcome`, `reason`, `route`, `message`, and `artifacts`. Unknown fields, outcomes, or reasons are protocol errors. `route` is exactly `api`, `static`, or `silverfin`; `manual_required` always names `silverfin`, while automated completion names the route actually exercised. `message` is human-readable and secret-free. `artifacts` is empty unless the completion predicate has been met; each entry contains only a generated local path, normalized kind, byte size, SHA-256, validated MIME, and transcript role when applicable. A Silverfin result also includes the non-secret `handoff_id`; other routes must omit it, and no other fields are allowed.

The outcome/reason pairs and exits are closed:

| Outcome | Allowed reasons | Exit |
| --- | --- | --- |
| `completed` | `acquisition_completed` | `0` |
| `manual_required` | `javascript_required`, `challenge_required`, `captcha_required`, `consent_required`, `oauth_required`, `mfa_required`, `human_verification_required`, `unsupported_page` | `10` |
| `failed` | `rejected_passcode`, `expired_share_link`, `expired_api_token`, `authentication_failed`, `recording_not_found`, `malformed_metadata`, `unexpected_content`, `unsafe_redirect`, `redirect_failed`, `missing_artifacts`, `invalid_artifact`, `network_error` | `20` |
| `failed` | `invocation_error` | `64` |
| `failed` | `internal_error` | `70` |

`invocation_error` is limited to invalid arguments, input schema, permissions, ownership, unavailable private-filesystem guarantees, or launcher contract violations. `internal_error` is an invariant violation or unclassified helper defect. DNS, TLS, connection, timeout, and exhausted transport retry failures are `network_error`; redirect loops and limit exhaustion are `redirect_failed`. HTTP authentication rejection is `authentication_failed` unless a verified API response specifically identifies expiration as `expired_api_token`. A share endpoint's verified expiry is `expired_share_link`. Missing required kinds are `missing_artifacts`; corrupt, spoofed, digest-mismatched, or unusable media are `invalid_artifact`. Challenges and JavaScript requirements always route to `manual_required`, never `unexpected_content`.

A `manual_required` result means only that automation classified and routed safely. It must not include a signed URL, passcode, token, cookie, page HTML, selector, screenshot, request dump, browser log, or profile. The helper never retries a manual state, attempts an alternate fingerprint to bypass it, or drives a browser. Operational completion can be claimed only after the Silverfin route finishes local ingest and satisfies the same completion predicate as an automated route.

## Acquisition state machine

The helper has two explicitly selected routes. It does not guess that API credentials exist or silently switch credential types.

### Official Zoom Recording API route

This route is enabled only when the operator supplies an approved credential source with the required account ownership and scopes.

1. **Authorize input:** load the approved token inside the child process.
2. **List recording files:** call the Zoom recording endpoint for the authorized recording identifier.
3. **Classify response:** map verified token expiry to `expired_api_token`, other 401/403 responses to `authentication_failed`, missing recordings to `recording_not_found`, and consent/OAuth requirements to their manual reasons without logging the body.
4. **Enumerate:** accept only expected recording file metadata and normalize MP4, VTT, M4A, and TXT artifact kinds.
5. **Download:** use Bearer authorization, safe redirects, and streamed private files.
6. **Validate and publish:** apply the common artifact validation rules, deduplicate, and atomically finalize the result.

The design does not create or authorize a Zoom application. Missing scopes, OAuth consent, or MFA return `manual_required` with the Silverfin route; they are not automated.

### Static share-link route

This route implements only an HTTP contract established by an authorized, sanitized observation. It does not use selectors or infer page behavior from retained browser artifacts.

1. **Initial GET:** fetch the share URL with safe redirects in the invocation's session.
2. **Classify bootstrap:** detect challenge/interstitial HTML before parsing. JavaScript-only bootstrap, CAPTCHA, consent, OAuth, MFA, and human-verification responses return `manual_required` immediately.
3. **Extract state:** parse an allowlisted anti-CSRF token and required bootstrap identifiers from static HTML or embedded JSON. Ambiguous, duplicate, or missing state fails closed; arbitrary script is never evaluated.
4. **Submit passcode:** post the passcode and extracted state in the same session. The passcode is never placed in a query string.
5. **Classify authorization:** map a rejected passcode to `rejected_passcode`, a verified expired share to `expired_share_link`, challenges to the matching manual reason, and only a structurally accepted static/API response to continuation.
6. **Discover media:** parse media metadata from the accepted static response or call only the documented same-session JSON endpoint identified by that response. Dynamic endpoint discovery by executing JavaScript is forbidden.
7. **Enumerate and deduplicate:** normalize supported artifact kinds and deduplicate by a server-issued recording-file identifier when present. Otherwise use an invocation-local keyed digest of the complete download URL only in memory; never persist or emit that digest. Deduplicate again by SHA-256 after download. Signed URLs stay in memory and are never emitted.
8. **Download:** stream each artifact with the same session and safe redirects into a private temporary directory.
9. **Validate and publish:** apply common validation, require the acceptance artifact set, then atomically rename files into the final private directory.

Unexpected HTML at any API or media step is challenge input, not a recording. It returns `manual_required` when it matches a manual category and otherwise `failed` with `unexpected_content`.

### Redirect and credential policy

Every request and redirect target must use HTTPS, explicit port 443 or the HTTPS default, no URL userinfo, and a hostname present as an exact string in the route's reviewed Zoom host allowlist. The base allowlist contains only `api.zoom.us`, `zoom.us`, and `www.zoom.us`; an account-specific Zoom web hostname or API media hostname may be added only as an exact host from the authorized sanitized observation. Wildcards, suffix matching such as `*.zoom.us`, IP-literal substitutions, alternate ports, and runtime host discovery are forbidden.

Before each redirect is followed, the helper canonicalizes and checks scheme, host, and port without making the next request. A transition to HTTP, a non-443 port, userinfo, or a host not on the exact allowlist fails closed as `unsafe_redirect`. Redirect loops and limit exhaustion are `redirect_failed`.

Bearer `Authorization` is retained on a same-origin redirect. It may be retained across origins only when the destination is an exact, separately approved API download host associated with the selected API route; otherwise it is stripped before an allowlisted cross-origin request. Bearer authorization is never used by the static route. Cookies remain under the session's RFC domain/path/secure jar rules, but the host gate is applied before jar selection so no cookie is sent to an unapproved target. The helper does not synthesize a broader `Domain` cookie or copy cookies between origins.

Fixtures use local capture endpoints and deterministic host mapping to prove: same-origin authorization retention; stripping on an allowlisted non-API cross-origin redirect; explicitly approved API-download-host retention; cookie domain/path behavior between approved hosts; and zero Bearer or cookie bytes reaching an unapproved host, HTTP downgrade, userinfo target, alternate port, redirect loop, or redirect beyond the limit. Sentinel scans cover request captures as well as helper output.

## Artifact integrity and privacy

### Type validation

Supported recording artifacts are MP4 video, VTT transcript/captions, M4A audio, and plain-text transcript/metadata. Every download must satisfy all of these checks:

- the declared recording kind is supported;
- the response MIME is on the allowlist for that kind, ignoring safe parameters such as charset;
- local magic/signature inspection agrees with the declared kind;
- the file is non-empty and within configured size limits; and
- HTML, JSON error payloads, login pages, and challenge pages are rejected even when served with a misleading media MIME.

MP4/M4A validation checks an ISO Base Media File Format `ftyp` box and compatible brands rather than filename extension alone. VTT requires a valid `WEBVTT` header after an optional byte-order mark. TXT must decode under the accepted text encoding, contain no NUL bytes, and must not match the HTML/challenge detectors. The implementation records the normalized validated MIME, never an untrusted filename-derived type.

### Filesystem and hashing

- The output root and every staging directory are `0700`; artifacts are `0600`.
- The helper verifies effective modes after creation and fails closed where the platform cannot provide the required privacy guarantee.
- User-supplied artifact names are never used directly. Final names are generated from normalized kind plus a collision-safe identifier.
- Existing destinations are not overwritten.
- SHA-256 is computed while streaming and verified against any trustworthy upstream digest when one is supplied.
- Failed, rejected, canceled, and duplicate temporary downloads are removed before exit.
- Final artifacts appear only after validation through an atomic same-filesystem rename.
- Structured output and logs contain no URL query, fragment, userinfo, authorization value, passcode, token, cookie value, response body, or browser state.

Every automated, manual-ingest, fixture, canary, and live route uses one completion predicate:

1. at least one validated MP4 is atomically published; and
2. either a validated usable VTT/TXT transcript is atomically published, or a validated M4A is published and a separately invoked local transcription step succeeds, produces a validated usable VTT/TXT transcript, and atomically publishes that transcript before the acquisition result is changed to `completed`.

A VTT is usable only when it passes the `WEBVTT` checks and contains at least one non-empty timed cue. A TXT transcript is usable only when it passes text validation, contains non-whitespace transcript text, and is classified by allowlisted upstream metadata or the local transcriber as a transcript rather than generic metadata. The helper classifies transcript roles only from allowlisted metadata: `preferred` for the recording transcript and `cc` for closed captions. Selection ranks `preferred` over `cc`, then VTT over TXT within the same role. Ties use the stable recording-file identifier; if equally ranked candidates lack an unambiguous stable identifier, the route fails with `malformed_metadata` rather than choosing by filename or response order. Invalid preferred candidates are rejected and do not silently force failure when a separately valid lower-ranked candidate exists; the result records only the selected usable transcript and any independently valid optional artifacts.

Validated MP4 plus M4A is an intermediate state, not completion. A local transcription failure leaves the route `failed` with `missing_artifacts` when no transcript was produced or `invalid_artifact` when produced transcript output fails validation. Missing MP4 or transcript completion is never partial success.

## Silverfin manual route

`manual_required` is a normal capability-routing result, not an invitation to broaden automation. It proves routing only; it is never evidence that an artifact was downloaded, transferred, ingested, or completed.

Each handoff uses a fresh random UUIDv4 `handoff_id` containing no recording, account, time, route, or credential data. Before browser work, an operator-approved remote setup command on Silverfin creates a handoff staging directory owned by `bobrain` with mode `0700`, under a fixed private root owned by `bobrain` with mode `0700`. It refuses symlinks, unexpected ownership, or an existing handoff ID. Browser download destinations and completed artifact files are regular files under that directory, owned by `bobrain`, mode `0600`; browser partials stay inside it and are never eligible for transfer.

The operator opens the dedicated Silverfin VNC/RDP browser, completes JavaScript, CAPTCHA, consent, OAuth, MFA, or human verification personally, and downloads only the recording artifacts. After downloads finish, a remote manifesting command that does not inspect browser state verifies the guards and writes a mode-`0600` manifest owned by `bobrain`. Each manifest entry contains exactly the basename, byte size, SHA-256, and detected MIME of one regular completed artifact. The manifest contains no absolute path, handoff metadata, URL, query, passcode, token, cookie, browser data, timestamps, or logs.

Artifact transfer uses guarded SFTP or SCP over a trusted SSH path selected and approved separately from the browser/VNC path. The transfer configuration pins the Silverfin host key, remote host, `bobrain` user, and fixed remote staging root; it disables agent or configuration features that could redirect the connection through an unapproved host. Before transfer, the local launcher creates a unique mode-`0700` temporary staging directory under the fixed local private root and verifies current-user ownership and no symlinks. It fetches the manifest and only its listed basenames into mode-`0600` `.partial` files. Remote paths are constructed from the fixed root plus the validated UUID and manifest basenames; absolute names, separators, traversal, links, devices, and unlisted files are rejected.

After transfer, local ingest recomputes every size and SHA-256 and compares them to the manifest before parsing content. It then independently detects MIME and magic, applies the common type, size, usability, naming, deduplication, transcript-selection, and secret-free output checks, and atomically renames accepted files on the same filesystem into the private output directory. The route is complete only when those local artifacts satisfy the common MP4-and-transcript completion predicate, including successful local transcription when the MP4+M4A branch is used.

On any setup, download, manifest, transfer, comparison, validation, transcription, or ingest failure, local `.partial` and rejected staging files are removed before exit. The local manifest and emptied temporary staging directory are removed after every success or failure. Remote browser partials and rejected manifest temporaries are removed under the same root/type/owner guards; completed remote source artifacts remain available for a guarded retry and are not reported as ingested.

Before the handoff starts, the operator selects one explicit retention policy: `delete_after_verified_ingest` or `retain_after_verified_ingest_until` with a UTC deadline. Remote source artifacts, manifest, and handoff directory may be deleted only after a local verified-ingest receipt names the `handoff_id` and the recomputed hashes that satisfied the completion predicate. The first policy deletes them immediately after that receipt; the second retains them until its deadline and then deletes them with the same path/type/owner guards. Without a verified-ingest receipt, source deletion is forbidden and the operator must resolve retention explicitly.

The bridge transfers only manifest bytes and validated artifact bytes. It never transfers or exports cookies, passcodes, tokens, authenticated or signed URLs, local storage, browser profiles, screenshots, HTML, request/response dumps, browser logs, helper logs, shell history, or credential files.

## Authorized canary gate

The operational cutover is blocked until an authorized operator supplies a sacrificial Zoom recording and explicitly selects the API, static, or complete Silverfin manual route as the target operating behavior.

Every canary must:

1. use unique sentinel values for every supplied secret;
2. run through the same launcher, helper, curl environment, local transcription step, and filesystem paths intended for operations;
3. satisfy the common completion predicate and produce the selected validated MP4 and usable transcript with SHA-256 and private modes;
4. confirm that duplicate metadata or URLs do not produce duplicate final files;
5. scan stdout, stderr, structured results, generated filenames, retained logs, and local request-capture fixtures for the sentinels, signed URL query values, cookie values, and authorization material without printing private-input contents;
6. confirm the ephemeral input and all local partial files are absent; and
7. record only operator authorization, route, timestamps, artifact kinds/sizes/hashes, validation result, retention policy, and secret-scan result.

If the selected target is manual, the canary must first observe the safe `manual_required` classification and then execute the complete remote browser download, secret-free manifest, guarded SFTP/SCP transfer, local hash comparison, validation, optional local transcription, atomic local ingest, partial cleanup, and selected remote retention policy. Its final receipt must prove the same completion predicate as an automated canary. A `manual_required` result by itself proves routing only and leaves cutover blocked.

The canary receipt may name only the non-secret handoff ID and allowed receipt fields. It must not contain the share URL, passcode, token, cookies, HTML, screenshots, browser profile, authenticated/signed URL, or logs. Removal can proceed only if operations explicitly accept the successfully exercised route as target behavior; no agent may infer that acceptance.

## Deterministic test design

Tests use local fixtures and synthetic secret markers. They do not require Zoom credentials or external network access.

### State-machine fixtures

- every allowed outcome/reason pair and exit mapping, plus rejection of unknown schema fields, outcomes, and reasons;
- initial static bootstrap with one valid CSRF/state record;
- missing, duplicate, malformed, and oversized bootstrap state;
- same-session passcode submission and cookie continuity;
- accepted and rejected passcodes;
- expired share links and API tokens;
- 401, 403, 404, rejected and expired credentials, redirect loops, unsafe redirects, and redirect-limit failures mapped to the closed taxonomy;
- media enumeration for MP4, VTT, M4A, and TXT;
- duplicate URLs, duplicate logical artifacts, and duplicate file hashes;
- signed URL handling with proof that queries never reach output or logs;
- redirect leakage captures proving Authorization retention only for same-origin and explicitly approved API download hosts, stripping on other approved cross-origin hops, cookie-jar scoping, and zero credential bytes at disallowed scheme/host/port targets;
- JavaScript-only pages, CAPTCHA, consent, OAuth, MFA, and human-verification fixtures mapping to `manual_required` with Silverfin;
- unexpected HTML or challenge content at bootstrap, authorization, metadata, and download stages;
- a complete no-secret local integration flow from bootstrap through finalized artifacts.

### Artifact and privacy fixtures

- accepted MIME/magic pairs for every supported kind;
- MIME/magic mismatch, extension spoofing, HTML disguised as media, malformed `ftyp`, invalid VTT, binary TXT, empty files, and size-limit violations;
- mode checks for ephemeral input files, input/output directories, staging directories, and final files;
- symlink, ownership, file-type, and permissive-input rejection, with ephemeral input deletion after success, each result outcome, validation failure, timeout, signal, and launch failure;
- overwrite refusal, atomic publication, cancellation, and partial cleanup;
- SHA-256 correctness and optional upstream-digest mismatch;
- stdout/stderr/result/log scans for passcode, token, cookie, signed-query, and authorization sentinels;
- preferred-versus-CC and VTT-versus-TXT transcript ranking, tie rejection, usable-cue/text checks, and both completion branches;
- Silverfin fixtures for manifest field closure, path traversal/link rejection, transfer truncation, local size/hash mismatch, MIME/magic mismatch, local partial cleanup, atomic ingest, verified-ingest receipts, and both remote retention policies.

The existing curl suites remain required regression evidence because the helper depends on their session and download contracts:

```sh
bun test
.venv/bin/python -m pytest python/tests -q
```

The Zoom fixtures belong with the Hemingway helper and must run independently of a browser.

## Live Hemingway skill TDD

The Hemingway skill changes only after the helper contract exists. Skill work follows `writing-skills` test-first discipline:

1. load the current `writing-skills` and test-driven-development guidance;
2. write realistic application scenarios before editing the skill, including discipline scenarios that combine at least three simultaneous pressures such as urgency, authority, sunk cost, exhaustion, or apparent operator convenience;
3. run every scenario without the proposed skill edits and record the RED baseline verbatim, including the pressures and rationalizations showing that the current skill selects Playwright, exposes private input, bypasses a challenge, accepts routing as completion, or fails to route to Silverfin;
4. make the smallest skill edit that teaches only the executable curl/manual workflow;
5. rerun the same scenarios and close any loopholes found; and
6. retain the RED/GREEN evidence with the implementation review.

Required coverage includes normal automated curl success, `manual_required` for each human-only category, pressure to paste a passcode into a tool call, pressure to export cookies or reuse a browser profile, pressure to treat `manual_required` as operational success, pressure to retry/bypass a CAPTCHA, and pressure to remove application E2E dependencies. The discipline RED set must exercise these temptations in combined-pressure scenarios with at least three pressures per scenario; separate single-pressure prompts do not satisfy the `writing-skills` baseline requirement. GREEN reruns use the identical scenarios, and REFACTOR adds and reruns cases for any new rationalization.

The live skill describes only current executable behavior. It must delete Playwright acquisition instructions when the cutover occurs rather than retain a failure history or transition narrative. Its frontmatter description states only when to invoke the skill. Mechanical flags and result details live in the helper's `--help`; the skill links to that interface rather than duplicating it.

## Cutover sequence

Cutover is ordered so no usable path is removed before its replacement and fallback are proven.

1. **Freeze scope:** record the four active MCP config coordinates and the application-owned Playwright allowlist. The config targets are `~/.pi/agent/mcp.json`, `~/.warp/.mcp.json`, `~/.warp-local/.mcp.json`, and `~/.warp-oss/.mcp.json`; discover their current schema rather than replacing whole files.
2. **Build and test the helper:** complete deterministic fixtures, local integration, private-input checks, and Silverfin local-ingest validation.
3. **Run the authorized canary:** obtain an acceptable canary receipt and explicit acceptance of either automated or manual target behavior.
4. **Update Hemingway atomically:** install the helper/launcher, update the live skill through RED/GREEN skill TDD, replace downloader tests, and remove the Zoom Playwright script and operational dependency. Resolve `capture-gif.js` ownership before removing shared package entries.
5. **Back up configuration only:** copy the four small MCP configuration files into a mode-`0700` rollback directory, preserve each original file mode, and record SHA-256 plus source path. Do not back up caches, profiles, cookies, browser state, or MCP output.
6. **Remove registrations:** remove only the Playwright MCP entries from Pi, Warp shared, Warp local, and Warp OSS while preserving all unrelated configuration.
7. **Invalidate registrations and resolver metadata:** remove/rebuild the Playwright entry in `~/.pi/agent/mcp-cache.json` and its resolver entry in `~/.pi/agent/mcp-npx-cache.json`. Before removing that entry, record the resolved dedicated `~/.npm/_npx` package path as a guarded deletion target; do not delete the package or any profile/output state yet.
8. **Stop and restart owners:** stop Pi, Warp, and Warp OSS, wait for their prior MCP children to exit, and restart the owners so the edited registrations and cache metadata take effect.
9. **Verify zero users:** confirm no Playwright MCP server, process with an open executable/file under the recorded dedicated npx path, or MCP-owned Chrome process remains. A fresh Pi session must expose the five `decent_curl_*` tools and no Playwright browser tools. Package or sensitive-state deletion is blocked while any user remains.
10. **Delete the dedicated package and sensitive state:** revalidate that the recorded npx target is the expected dedicated package path, is not a symlink, is owned by the current user, and has zero process users, then delete it. Without opening or indexing contents, delete the dedicated `~/Library/Caches/ms-playwright-mcp` profile root and bounded `.playwright-mcp` output directories under equivalent path/type/ownership guards. Delete from `~/Library/Caches/ms-playwright` only browser binaries proven unreferenced by the application allowlist; preserve that shared cache otherwise.
11. **Run post-cutover inventory:** verify Hemingway, active MCP configs, Pi metadata, resolver state, process state, absence of the recorded dedicated npx path and sensitive profile/output paths, curl tools, and the application allowlist.

Profile and output deletion happens only after owning processes stop, using path/type/ownership guards that refuse symlinks or unexpected roots. Logs record only path identifiers and success/failure, never directory contents.

## Post-cutover acceptance

The migration is accepted when all of the following are true:

- deterministic Zoom fixtures and the full local integration flow pass;
- the authorized canary gate has an acceptable receipt and the selected target behavior is explicit;
- the Hemingway live skill passes RED/GREEN pressure scenarios and names curl/Silverfin only;
- Hemingway has no Playwright Zoom downloader, operational package dependency, lock entry, or live skill instruction;
- all four active MCP configs contain no `@playwright/mcp` registration;
- Pi has no Playwright MCP metadata or npx resolver entry, and the recorded dedicated npx package path is absent;
- no Playwright MCP server, process using the recorded dedicated npx path, MCP-owned Chrome process, sensitive MCP profile root, or MCP output directory remains;
- a fresh Pi session exposes all five `decent_curl_*` tools and no Playwright browser tools;
- application-owned Playwright references exactly match the approved allowlist; and
- config backups and receipts contain no cookie, credential, profile, signed URL, HTML, or screenshot data.

## Rollback

Rollback restores capability without restoring authenticated browser state.

1. Stop Pi, Warp, and Warp OSS and confirm no partial MCP process remains.
2. Verify the mode and SHA-256 of each configuration backup, then restore it to its recorded path without changing unrelated entries.
3. Restore the reviewed Hemingway code/package commit if rollback includes the downloader.
4. Rebuild resolver metadata and reinstall the MCP package and required browser binaries from trusted sources. Prefer the last reviewed exact MCP version rather than a floating `latest` reference.
5. Restart the owning applications and verify registration/process health.
6. Require fresh user authentication for every browser-backed flow.

Never restore, archive, or recreate cookies from a copied profile. Sensitive MCP profiles and output remain deleted. Rollback evidence consists only of checksummed configuration, exact package versions, code commits, fresh-install logs, and secret-free verification results.

## Stop and escalation conditions

Implementation stops for explicit operator decision when:

- the requested scope includes an application-owned Playwright package;
- Zoom app creation, OAuth scopes, consent, or account authorization is required;
- the static share route requires JavaScript or its observed contract no longer matches fixtures;
- CAPTCHA, MFA, consent, or human verification appears;
- an authorized canary cannot be supplied;
- the canary proves only `manual_required` but automated acquisition is still required;
- private filesystem guarantees cannot be enforced; or
- a proposed rollback requires cookies, browser profiles, or signed URLs.

No implementation may convert one of these conditions into an implicit bypass, credential request, or scope expansion.

## Design self-review gate

Before implementation approval, a cold reviewer must verify each requirement at its authoritative section rather than rely on a completion claim:

- scope and ownership preserve application Playwright allowlists and prohibit live/browser mutation during design work;
- the Silverfin section defines remote download, secret-free manifest, guarded trusted-SSH transfer, local verification/atomic ingest, cleanup, and post-verification retention;
- the output, artifact, and canary sections distinguish routing from completion and use one exact completion predicate;
- the closed schema table covers every state-machine, artifact, network, invocation, and internal result with a defined exit;
- redirect fixtures prove credentials cannot leak across an unapproved scheme, host, or port transition;
- the private-input lifecycle removes its ephemeral file and directory on every exit without content-printing scans;
- cutover stops/restarts owners and proves zero users before deleting the dedicated package and sensitive state, then asserts the package path is absent; and
- live-skill RED evidence contains three-or-more-pressure combined scenarios run before edits, followed by identical GREEN reruns and loophole REFACTOR reruns.

Approval is blocked by an undefined placeholder, an open outcome/reason value, a route-specific completion rule, or acceptance evidence that stops at `manual_required`.
