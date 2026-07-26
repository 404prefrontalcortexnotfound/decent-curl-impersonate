# Compact Decent Curl Gateway Tool Design

## Goal

Expose every Decent Curl HTTP, download, session, WebSocket, profile, and fingerprint capability through one low-overhead Pi tool without changing the Python worker, privacy guarantees, or one-call execution path.

## Public tool contract

The extension registers one model-visible tool named `decent_curl`.

Its standing schema has two fields:

- `operation`: a closed enum of `request`, `download`, `session.create`, `session.list`, `session.close`, `websocket.connect`, `websocket.send`, `websocket.receive`, `websocket.close`, `profiles.list`, `profiles.fingerprint`, and `help`.
- `args`: an optional object containing the selected operation's arguments.

Known operations execute in one tool call. The `help` operation returns concise argument guidance when an agent is uncertain; it is not required before execution.

The gateway description states the common arguments and capability boundaries compactly. It explicitly warns that headers, authentication, proxies, query values, request bodies, upload content, and outbound WebSocket messages may contain secrets and must not be disclosed.

## Validation and dispatch

The TypeScript gateway remains the security and validation boundary.

- Existing TypeBox schemas remain authoritative for request, download, session, WebSocket, and profile inputs.
- The gateway reconstructs the existing finite `action` value for session, WebSocket, and profile operations before validating against those schemas.
- Invalid input stops before worker dispatch and returns only schema paths and messages. Validation output never includes rejected values.
- Valid input is translated to the existing Python worker operation names. The worker protocol and Python implementation do not change.
- Existing result sanitisation, response truncation, secure spill files, cookie redaction, header redaction, and URL sanitisation remain unchanged.

## Prompt budget

The UTF-8 byte length of the gateway description plus its JSON-serialised parameter schema must not exceed 2,500 bytes. A test enforces this budget.

The current five-tool surface is measured before replacement. The pull request reports the old and new byte counts and the percentage reduction.

## Compatibility and release

The five model-facing names beginning with `decent_curl_` are replaced by `decent_curl`. This is an intentional public tool-contract change and ships as version `0.2.0` across npm metadata, Python metadata, lockfiles, status output, generated distribution output, and documentation.

The package remains installed normally through Pi. No local wrapper or package fork is introduced.

## Verification

Tests prove:

- exactly one Pi tool is registered;
- every closed operation dispatches to the correct existing worker operation;
- documented request, download, session, WebSocket, profile, and fingerprint arguments remain accepted;
- malformed or operation-inappropriate arguments fail before worker dispatch;
- validation errors contain no rejected secret values;
- existing result privacy and truncation behaviour remains intact;
- the standing prompt budget remains at or below 2,500 bytes;
- the built distribution contains the gateway tool and no legacy model-facing tool names;
- TypeScript typechecking, Bun tests, Python tests, build, and package verification pass.

## Local Pi configuration

After a verified `0.2.0` package is installed, Smart Fetch is removed from `/Users/bo/.pi/agent/settings.json`. Decent Curl remains installed and active as the single `decent_curl` gateway tool.
