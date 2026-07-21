# Playwright Removal and curl Impersonation Design

## Goal

Remove Playwright from the active agent and Hemingway operations stack without treating HTTP impersonation as a browser replacement.

The target operating model is:

- `decent-curl-impersonate` handles authorized HTTP, session, redirect, and streamed-download work;
- a Hemingway-owned Zoom helper handles recording acquisition through a bounded HTTP state machine;
- Silverfin is the manual route when JavaScript, CAPTCHA, consent, OAuth, MFA, or other human browser interaction is required; and
- application-owned Playwright E2E and runtime packages remain installed and usable.

The cutover is accepted only after deterministic fixtures and an explicitly authorized Zoom canary exercise the selected target route. If operations require automated acquisition, the canary must prove the automated route. If the helper returns `manual_required`, cutover requires explicit operator acceptance of manual acquisition as the target behavior and must not claim automated Zoom acquisition.

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

Before implementation, inventory application-owned Playwright references and record an explicit allowlist. Post-cutover checks compare against that allowlist rather than requiring a machine-wide zero-string result. Any request to remove an allowlisted application dependency is a separate migration.

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

One invocation handles one recording acquisition. It owns one `AsyncSession` from bootstrap through all media downloads, then closes it. It emits a secret-free structured result and uses nonzero exit status only for invocation or internal failures; expected routing outcomes are represented in the result contract.

### Private input

Dynamic share URLs, passcodes, and tokens must not appear in model tool arguments, command-line arguments, filenames, logs, tracebacks, or structured output.

The helper accepts secrets through one of these local channels:

1. an already-open file descriptor supplied by a trusted launcher; or
2. a user-owned input file whose path is non-secret and whose POSIX mode is exactly `0600` or stricter.

The input is a versioned document containing only the fields required by the selected route. The helper rejects symlinks, non-regular files, files not owned by the current user, group/world-readable modes, unknown fields, and simultaneous credential modes. It reads the document once, validates it, keeps secret values in process memory only, and never copies the input into the output directory. A trusted launcher may resolve a fixed credential reference and export it only to the child process; the model must never be asked to paste a secret.

Output and log redaction scans use caller-provided sentinel markers in tests and the canary. Redaction is defense in depth: the implementation must construct metadata from an allowlist rather than serialize requests, responses, headers, cookies, signed URLs, HTML, or exceptions wholesale.

### Output contract

The helper returns one of three stable outcomes:

- `completed`: all discovered required artifacts passed validation and were atomically placed in the private output directory;
- `manual_required`: automation stopped safely and a user must use Silverfin; or
- `failed`: the selected non-human route was understood but could not complete, such as an expired link, rejected passcode, rejected or expired already-authorized API credentials, malformed metadata, or invalid media.

All outcomes include a stable reason code and a human-readable secret-free message. `completed` includes, for each artifact, only its local path, normalized media kind, byte size, SHA-256, and validated MIME. `manual_required` includes the Silverfin route and a reason from the closed set `javascript_required`, `captcha_required`, `consent_required`, `oauth_required`, `mfa_required`, `human_verification_required`, or `unsupported_page`. It must not include a signed URL, passcode, token, cookie, page HTML, selector, screenshot, or request dump.

The helper never retries `manual_required` states, attempts an alternate fingerprint to bypass them, or drives a browser. Silverfin performs the human interaction or download into a mode-`0700` staging directory. Hemingway resumes from validated local artifacts, not from exported browser cookies or a copied browser profile.

## Acquisition state machine

The helper has two explicitly selected routes. It does not guess that API credentials exist or silently switch credential types.

### Official Zoom Recording API route

This route is enabled only when the operator supplies an approved credential source with the required account ownership and scopes.

1. **Authorize input:** load the approved token inside the child process.
2. **List recording files:** call the Zoom recording endpoint for the authorized recording identifier.
3. **Classify response:** map 401/403, expired authorization, missing recording, and consent/OAuth requirements to stable outcomes without logging the body.
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
5. **Classify authorization:** distinguish rejected/expired access, challenge responses, and an accepted static/API response using status, content type, and bounded structural parsing.
6. **Discover media:** parse media metadata from the accepted static response or call only the documented same-session JSON endpoint identified by that response. Dynamic endpoint discovery by executing JavaScript is forbidden.
7. **Enumerate and deduplicate:** normalize supported artifact kinds and deduplicate by a server-issued recording-file identifier when present. Otherwise use an invocation-local keyed digest of the complete download URL only in memory; never persist or emit that digest. Deduplicate again by SHA-256 after download. Signed URLs stay in memory and are never emitted.
8. **Download:** stream each artifact with the same session and safe redirects into a private temporary directory.
9. **Validate and publish:** apply common validation, require the acceptance artifact set, then atomically rename files into the final private directory.

Unexpected HTML at any API or media step is challenge input, not a recording. It returns `manual_required` when it matches a manual category and otherwise `failed` with `unexpected_content`.

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

A successful acquisition requires at least one validated MP4 plus the transcript artifacts required by the Hemingway recap contract. Missing required artifacts is `failed`, not partial success. Optional audio/text variants may be returned when present and valid.

## Silverfin manual route

`manual_required` is a normal capability-routing result, not an invitation to broaden automation.

The operator opens the dedicated Silverfin VNC/RDP browser and performs JavaScript interaction, CAPTCHA, consent, OAuth, MFA, and human verification personally. Silverfin may place downloaded artifacts into the helper-designated private staging directory. The helper's local-ingest mode then applies the same MIME, magic, size, hash, naming, mode, deduplication, and log-redaction checks before Hemingway consumes the files.

No cookies, local storage, browser profile, screenshot, HTML snapshot, or authenticated URL are transferred from Silverfin to curl. The only bridge is a local artifact or a non-secret identifier explicitly approved for resumption.

## Authorized canary gate

The operational cutover is blocked until an authorized operator supplies a sacrificial Zoom recording and explicitly selects the API or static route.

The canary must:

1. use unique sentinel values for every supplied secret;
2. run through the same launcher, helper, curl environment, and filesystem paths intended for operations;
3. produce the required validated MP4 and transcript artifacts, with SHA-256 and private modes;
4. confirm that duplicate metadata or URLs do not produce duplicate final files;
5. scan stdout, stderr, structured results, generated filenames, and retained logs for the sentinels, signed URL query values, cookie values, and authorization material;
6. confirm no partial files remain; and
7. record only authorization, route, timestamps, artifact kinds/sizes/hashes, validation result, and secret-scan result.

The canary receipt must not contain the share URL, passcode, token, cookies, HTML, screenshots, or browser profile. A `manual_required` canary proves the fallback contract but does not prove automated acquisition; removal can proceed only if operations explicitly accept manual acquisition as the target behavior. No agent may infer that acceptance.

## Deterministic test design

Tests use local fixtures and synthetic secret markers. They do not require Zoom credentials or external network access.

### State-machine fixtures

- initial static bootstrap with one valid CSRF/state record;
- missing, duplicate, malformed, and oversized bootstrap state;
- same-session passcode submission and cookie continuity;
- accepted and rejected passcodes;
- expired share links and API tokens;
- 401, 403, 404, redirect loops, unsafe redirects, and redirect-limit failures;
- media enumeration for MP4, VTT, M4A, and TXT;
- duplicate URLs, duplicate logical artifacts, and duplicate file hashes;
- signed URL handling with proof that queries never reach output or logs;
- JavaScript-only pages, CAPTCHA, consent, OAuth, MFA, and human-verification fixtures mapping to `manual_required` with Silverfin;
- unexpected HTML or challenge content at bootstrap, authorization, metadata, and download stages;
- a complete no-secret local integration flow from bootstrap through finalized artifacts.

### Artifact and privacy fixtures

- accepted MIME/magic pairs for every supported kind;
- MIME/magic mismatch, extension spoofing, HTML disguised as media, malformed `ftyp`, invalid VTT, binary TXT, empty files, and size-limit violations;
- mode checks for input files, output directories, staging directories, and final files;
- symlink, ownership, file-type, and permissive-input rejection;
- overwrite refusal, atomic publication, cancellation, and partial cleanup;
- SHA-256 correctness and optional upstream-digest mismatch;
- stdout/stderr/result/log scans for passcode, token, cookie, signed-query, and authorization sentinels;
- local-ingest validation for Silverfin-produced artifacts.

The existing curl suites remain required regression evidence because the helper depends on their session and download contracts:

```sh
bun test
.venv/bin/python -m pytest python/tests -q
```

The Zoom fixtures belong with the Hemingway helper and must run independently of a browser.

## Live Hemingway skill TDD

The Hemingway skill changes only after the helper contract exists. Skill work follows `writing-skills` test-first discipline:

1. load the current `writing-skills` and test-driven-development guidance;
2. write realistic pressure and application scenarios before editing the skill;
3. run them against the current skill and record the RED baseline showing that it selects Playwright, exposes private input, bypasses a challenge, or fails to route to Silverfin;
4. make the smallest skill edit that teaches only the executable curl/manual workflow;
5. rerun the same scenarios and close any loopholes found; and
6. retain the RED/GREEN evidence with the implementation review.

Required scenarios include normal automated curl success, `manual_required` for each human-only category, pressure to paste a passcode into a tool call, pressure to export cookies or reuse a browser profile, pressure to retry/bypass a CAPTCHA, and pressure to remove application E2E dependencies.

The live skill describes only current executable behavior. It must delete Playwright acquisition instructions when the cutover occurs rather than retain a failure history or transition narrative. Its frontmatter description states only when to invoke the skill. Mechanical flags and result details live in the helper's `--help`; the skill links to that interface rather than duplicating it.

## Cutover sequence

Cutover is ordered so no usable path is removed before its replacement and fallback are proven.

1. **Freeze scope:** record the four active MCP config coordinates and the application-owned Playwright allowlist. The config targets are `~/.pi/agent/mcp.json`, `~/.warp/.mcp.json`, `~/.warp-local/.mcp.json`, and `~/.warp-oss/.mcp.json`; discover their current schema rather than replacing whole files.
2. **Build and test the helper:** complete deterministic fixtures, local integration, private-input checks, and Silverfin local-ingest validation.
3. **Run the authorized canary:** obtain an acceptable canary receipt and explicit acceptance of either automated or manual target behavior.
4. **Update Hemingway atomically:** install the helper/launcher, update the live skill through RED/GREEN skill TDD, replace downloader tests, and remove the Zoom Playwright script and operational dependency. Resolve `capture-gif.js` ownership before removing shared package entries.
5. **Back up configuration only:** copy the four small MCP configuration files into a mode-`0700` rollback directory, preserve each original file mode, and record SHA-256 plus source path. Do not back up caches, profiles, cookies, browser state, or MCP output.
6. **Remove registrations:** remove only the Playwright MCP entries from Pi, Warp shared, Warp local, and Warp OSS while preserving all unrelated configuration.
7. **Invalidate resolver state:** remove/rebuild the Playwright entry in `~/.pi/agent/mcp-cache.json` and its resolver entry in `~/.pi/agent/mcp-npx-cache.json`. Resolve the current dedicated `~/.npm/_npx` package path from that cache rather than hard-coding it, and remove it only after no active process uses it.
8. **Restart owners:** restart Pi, Warp, and Warp OSS so configuration removal affects already-running servers.
9. **Verify processes and tools:** confirm no Playwright MCP server or MCP-owned Chrome process remains; a fresh Pi session exposes the five `decent_curl_*` tools and no Playwright browser tools.
10. **Delete sensitive state:** without opening or indexing contents, recursively delete the dedicated `~/Library/Caches/ms-playwright-mcp` profile root and the `.playwright-mcp` output directories found by the bounded inventory. Delete from `~/Library/Caches/ms-playwright` only browser binaries proven unreferenced by the application allowlist; preserve that shared cache otherwise.
11. **Run post-cutover inventory:** verify Hemingway, active MCP configs, Pi metadata, resolver state, process state, sensitive profile/output paths, curl tools, and the application allowlist.

Profile and output deletion happens only after owning processes stop, using path/type/ownership guards that refuse symlinks or unexpected roots. Logs record only path identifiers and success/failure, never directory contents.

## Post-cutover acceptance

The migration is accepted when all of the following are true:

- deterministic Zoom fixtures and the full local integration flow pass;
- the authorized canary gate has an acceptable receipt and the selected target behavior is explicit;
- the Hemingway live skill passes RED/GREEN pressure scenarios and names curl/Silverfin only;
- Hemingway has no Playwright Zoom downloader, operational package dependency, lock entry, or live skill instruction;
- all four active MCP configs contain no `@playwright/mcp` registration;
- Pi has no Playwright MCP metadata or npx resolver entry;
- no Playwright MCP server, MCP-owned Chrome process, sensitive MCP profile root, or MCP output directory remains;
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
