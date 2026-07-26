# Compact Decent Curl Gateway Tool Design

## Goal

Expose every Decent Curl HTTP, download, session, WebSocket, profile, and fingerprint capability through one low-overhead Pi tool without changing the Python worker, privacy guarantees, or one-call execution path.

## Public tool contract

The extension registers one model-visible tool named `decent_curl`.

Its standing schema has two fields:

- `operation`: a string accepted only when it matches the runtime allowlist `request`, `download`, `session.create`, `session.list`, `session.close`, `websocket.connect`, `websocket.send`, `websocket.receive`, `websocket.close`, `profiles.list`, or `profiles.fingerprint`.
- `args`: an optional object containing the selected operation's arguments.

The model-visible schema deliberately uses a string rather than a provider-enforced enum. The gateway applies the closed allowlist inside `execute`, so an unknown operation produces a safe tool result listing valid operations without any provider or Pi validation path echoing the sibling `args` object.

Every known operation executes in one tool call. The description includes the non-obvious shapes needed for direct use: basic and bearer authentication, multipart file and value parts, `allow_redirects: "safe"`, and the rule that request bodies are mutually exclusive. It explicitly warns that headers, authentication, proxies, query values, request bodies, upload content, and outbound WebSocket messages may contain secrets and must not be disclosed.

## Validation and dispatch

The TypeScript gateway becomes the security and validation boundary. Pi currently passes extension arguments to `execute` without enforcing the registered TypeBox schema, so this change must prove that validation does not narrow any input accepted by the Python worker contract.

- Existing TypeBox schemas remain authoritative for request, download, session, WebSocket, and profile inputs.
- `RequestParameters` becomes one flat object with `additionalProperties: false`; gateway code separately enforces that at most one of `json`, `form`, `content`, and `multipart` is present.
- The gateway reconstructs the existing finite `action` value for session, WebSocket, and profile operations before validating against those schemas.
- Runtime validation uses `Value` from `typebox/value`, matching the package that creates the schemas.
- Invalid input stops before worker dispatch and returns only `{path, message}` entries. Validation output never includes rejected values or the phrase `Received arguments`.
- Valid input follows this exhaustive dispatch table:

| Gateway operation | Worker operation |
| --- | --- |
| `request` | `request.execute` |
| `download` | `download.execute` |
| `session.create` | `session.create` |
| `session.list` | `session.list` |
| `session.close` | `session.close` |
| `websocket.connect` | `websocket.connect` |
| `websocket.send` | `websocket.send` |
| `websocket.receive` | `websocket.receive` |
| `websocket.close` | `websocket.close` |
| `profiles.list` | `profiles.list` |
| `profiles.fingerprint` | `diagnostic.fingerprint` |

The worker protocol and Python implementation do not change. Existing per-operation result rendering remains verbatim: `responseResult`, `sessionDetails`, `websocketResult`, the download summary, and the profiles summary. Response truncation, secure spill files, cookie redaction, header redaction, and URL sanitisation remain unchanged.

## Prompt budget

The prompt measurement includes the tool name, description, and parameter schema. It reports both provider forms:

- OpenAI form: the complete JSON-serialised schema.
- Anthropic form: `{type: "object", properties: schema.properties ?? {}, required: schema.required ?? []}`.

The larger form must not exceed 2,500 UTF-8 bytes. A test enforces this budget.

The current five-tool surface is measured with the same two provider serialisations before replacement. The pull request reports old and new byte counts and the percentage reduction.

## Compatibility and release

The five model-facing names beginning with `decent_curl_` are replaced by `decent_curl`. This is an intentional public tool-contract change and ships as version `0.2.0` across npm metadata, Python metadata, lockfiles, status output, generated distribution output, and documentation.

The package remains installed normally through Pi. No local wrapper or package fork is introduced.

## Verification

Tests prove:

- exactly one Pi tool is registered;
- every allowlisted operation dispatches exhaustively to the worker operation shown above, including `profiles.fingerprint` → `diagnostic.fingerprint`;
- unknown operations return a safe result from `execute` without echoing `args`;
- every documented request, download, session, WebSocket, profile, and fingerprint argument shape remains accepted;
- every argument shape exercised by the Python worker contract remains accepted by gateway validation;
- malformed or operation-inappropriate arguments fail before worker dispatch, including unknown request fields and multiple request bodies;
- validation errors are `{path, message}` entries containing neither rejected secret values nor `Received arguments`;
- the registered gateway description warns about headers, authentication, proxies, query values, request bodies, upload content, and outbound WebSocket messages;
- existing per-operation result rendering, privacy, and truncation behaviour remains intact;
- both provider prompt measurements are reported and the larger standing surface remains at or below 2,500 bytes;
- the default extension status version matches `package.json`, and Python `__version__` matches `pyproject.toml`;
- after building, `dist/index.js` contains `decent_curl` and none of `decent_curl_request`, `decent_curl_download`, `decent_curl_session`, `decent_curl_websocket`, or `decent_curl_profiles`;
- `uv run pytest python/tests -q`, `bun test`, `bun run typecheck`, `bun run build`, generated-distribution drift checking, dry-run package creation, and package verification pass.

## Local Pi configuration

After a verified `0.2.0` package is installed, Smart Fetch is removed from `/Users/bo/.pi/agent/settings.json`. Decent Curl remains installed and active as the single `decent_curl` gateway tool.
