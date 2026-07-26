# Compact Decent Curl Gateway Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace five model-visible Decent Curl tools with one validated `decent_curl` gateway whose larger provider prompt representation is at most 2,500 UTF-8 bytes.

**Architecture:** One compact Pi tool accepts an operation string and generic arguments. TypeScript checks the operation against an exhaustive dispatch table, reconstructs operation-specific action fields, validates with the existing TypeBox schemas, and delegates to the unchanged Python worker while preserving existing result renderers.

**Tech Stack:** TypeScript, Pi Extension API, TypeBox v1 with `typebox/value`, Bun tests/build, Python 3.13 with pytest and uv.

## Global Constraints

- Keep the Python worker protocol and implementation unchanged.
- Never include rejected argument values in validation errors.
- Preserve all current request, download, session, WebSocket, profile, fingerprint, result-rendering, redaction, truncation, and secure spill-file behavior.
- Register exactly one model-visible tool named `decent_curl`.
- Keep the larger OpenAI/Anthropic standing prompt measurement at or below 2,500 UTF-8 bytes.
- Ship the public tool-contract change as version `0.2.0`.

---

### Task 1: Define the gateway contract with failing tests

**Files:**
- Modify: `test/tools.test.ts`
- Modify: `src/schemas.ts`
- Test: `test/tools.test.ts`

**Interfaces:**
- Consumes: existing `RequestParameters`, `DownloadParameters`, `SessionParameters`, `WebSocketParameters`, and `ProfilesParameters`.
- Produces: `createToolDefinition(worker): ToolDefinition<any, Record<string, unknown>>`, a single tool with `{operation: string, args?: Record<string, unknown>}`.

- [ ] **Step 1: Replace the five-tool count test with the wished-for gateway API**

Assert that `createToolDefinition(new RecordingWorker())` has name `decent_curl`, and its schema exposes only `operation` and `args`.

- [ ] **Step 2: Add exhaustive dispatch tests**

Use a table containing all eleven gateway operations and expected worker operations:

```ts
const dispatchCases = [
  ["request", "request.execute"],
  ["download", "download.execute"],
  ["session.create", "session.create"],
  ["session.list", "session.list"],
  ["session.close", "session.close"],
  ["websocket.connect", "websocket.connect"],
  ["websocket.send", "websocket.send"],
  ["websocket.receive", "websocket.receive"],
  ["websocket.close", "websocket.close"],
  ["profiles.list", "profiles.list"],
  ["profiles.fingerprint", "diagnostic.fingerprint"],
] as const;
```

Each case executes the gateway with its minimum valid arguments and asserts the worker receives the expected operation and no reconstructed `action` field.

- [ ] **Step 3: Add validation and secrecy tests**

Add tests proving:

- unknown operations return a safe result and make zero worker calls;
- unknown request fields make zero worker calls;
- two request body fields make zero worker calls;
- invalid session/WebSocket/profile arguments make zero worker calls;
- serialized errors include only `path` and `message` and exclude `SECRET` and `Received arguments`.

- [ ] **Step 4: Add prompt-budget tests**

Measure `name + description + schema` in complete OpenAI form and Anthropic's top-level object form. Assert the larger is at most 2,500 bytes and print old/new measurements in the test failure message.

- [ ] **Step 5: Run the focused test and verify RED**

Run: `bun test test/tools.test.ts`

Expected: FAIL because `createToolDefinition` and the gateway behavior do not exist.

- [ ] **Step 6: Flatten request validation**

Replace `RequestParameters`' intersect/union with one object that has `additionalProperties: false` and optional `json`, `form`, `content`, `content_base64`, and `multipart` fields. Gateway code, not TypeBox, enforces at most one body.

- [ ] **Step 7: Run existing schema tests**

Run: `bun test test/tools.test.ts`

Expected: gateway tests still fail, while documented schema-shape tests pass after adapting their imports and assertions.

### Task 2: Implement the validated gateway and preserve result behavior

**Files:**
- Modify: `src/tools.ts`
- Modify: `src/index.ts`
- Modify: `test/tools.test.ts`
- Test: `test/tools.test.ts`
- Test: `test/contract.test.ts`

**Interfaces:**
- Consumes: operation string, generic argument record, existing TypeBox schemas, and `WorkerCaller`.
- Produces: one `decent_curl` Pi tool and operation-specific worker calls/results.

- [ ] **Step 1: Add the operation table and validation helpers**

Define one readonly operation table as the source for accepted names, worker mappings, reconstructed actions, schema selection, and result renderer selection. Import `Value` from `typebox/value`.

- [ ] **Step 2: Implement safe validation errors**

Use `Value.Errors(schema, candidate)` and map each error to:

```ts
{ path: error.instancePath, message: error.message }
```

Never include `error.params`, candidate values, or the original arguments.

- [ ] **Step 3: Implement `createToolDefinition`**

Register `decent_curl` with a compact description covering capabilities, authentication shapes, multipart shapes, safe redirects, mutually exclusive bodies, and all secret categories. Accept `{operation, args}` with a small top-level schema. Reject unknown operations inside `execute`.

- [ ] **Step 4: Preserve operation-specific results**

Route request and profile fingerprint through `responseResult`; download through its current private-file summary; sessions through `sessionDetails`; WebSockets through `websocketResult`; and profile listing through its current profile/family summary.

- [ ] **Step 5: Update extension registration**

Replace the loop over `createToolDefinitions(worker)` with one `pi.registerTool(createToolDefinition(worker))` call.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `bun test test/tools.test.ts test/contract.test.ts`

Expected: all focused tests pass, with only the opt-in live fingerprint test absent from this command.

- [ ] **Step 7: Run typechecking**

Run: `bun run typecheck`

Expected: exit 0.

### Task 3: Release metadata, documentation, distribution, and package verification

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `pyproject.toml`
- Modify: `uv.lock`
- Modify: `python/decent_curl_impersonate/__init__.py`
- Modify: `src/index.ts`
- Modify: `test/tools.test.ts`
- Modify: `python/tests/test_package_metadata.py`
- Regenerate: `dist/index.js`

**Interfaces:**
- Consumes: verified gateway implementation.
- Produces: installable version `0.2.0` with one documented tool and synchronized metadata.

- [ ] **Step 1: Add failing version-consistency tests**

Add a Bun test that exercises the default extension status and compares its reported version with `package.json`. Add a Python test that compares `decent_curl_impersonate.__version__` with `project.version` from `pyproject.toml`.

- [ ] **Step 2: Run metadata tests and verify RED**

Run: `bun test test/tools.test.ts && uv run pytest python/tests/test_package_metadata.py -q`

Expected: FAIL until metadata and the default status source are synchronized.

- [ ] **Step 3: Set version `0.2.0` everywhere**

Update npm and Python metadata, lockfiles, Python `__version__`, and the extension status source. Prefer reading the default status version from package metadata rather than maintaining another independent literal.

- [ ] **Step 4: Rewrite the README tool reference**

Document `decent_curl`, all eleven operations, direct request/download/session/WebSocket/profile examples, the generic-argument validation boundary, privacy behavior, and version `0.2.0`. Remove the five legacy tool sections.

- [ ] **Step 5: Build and verify distribution drift**

Run:

```bash
bun run build
git diff --exit-code -- dist/index.js
```

If the drift check fails because the build deliberately changed the tracked distribution, inspect and stage the generated change; rerun the build and then rerun `git diff --exit-code -- dist/index.js` against the staged distribution with `git diff --exit-code --cached -- dist/index.js` used only to inspect the intentional staged delta.

- [ ] **Step 6: Verify legacy names are absent from the built tool surface**

Assert in Bun tests that `dist/index.js` contains the new gateway registration and none of the five legacy model-facing names.

- [ ] **Step 7: Run complete verification**

Run:

```bash
uv run pytest python/tests -q
bun test
bun run typecheck
bun run build
npm pack --dry-run --json > /tmp/decent-curl-pack.json
node scripts/verify-package.mjs /tmp/decent-curl-pack.json
```

Expected: every command exits 0; only the explicitly opt-in live fingerprint test is skipped.

### Task 4: Independent review, merge, and load into Pi

**Files:**
- Modify after merge: `/Users/bo/.pi/agent/settings.json`
- Verify: installed Decent Curl package and Pi active-tool inventory

**Interfaces:**
- Consumes: reviewed, verified `0.2.0` branch.
- Produces: merged source and a Pi configuration with Decent Curl loaded and Smart Fetch absent.

- [ ] **Step 1: Obtain fresh Opus 5 review**

Have an independent Claude Opus 5 agent inspect the full diff against the design. Resolve every Critical and Important finding and rerun affected checks.

- [ ] **Step 2: Merge only after review and checks are satisfactory**

Merge `feat/compact-gateway-tool` into local `main` without disturbing the separate updater worktree. Do not discard or overwrite unrelated working-tree changes.

- [ ] **Step 3: Load the verified package locally**

Use Pi's supported local-package source pointing at the merged clean checkout, or install published `npm:decent-curl-impersonate@0.2.0` when publication is available. Keep the package installed; do not copy extension code into a wrapper.

- [ ] **Step 4: Remove Smart Fetch from user settings**

Remove only `npm:pi-smart-fetch@0.3.12` from `/Users/bo/.pi/agent/settings.json`.

- [ ] **Step 5: Verify a fresh Pi process**

Use a non-LLM RPC audit command to prove:

- `decent_curl` is registered and active;
- no legacy `decent_curl_*` tools are active or registered;
- `web_fetch` and `batch_web_fetch` are absent;
- the measured active-tool prompt surface reflects the expected reduction.

- [ ] **Step 6: Report exact evidence**

Report merge SHA, loaded package source/version, test commands, prompt bytes before/after, Smart Fetch removal, and any residual release risk.
