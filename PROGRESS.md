# PROGRESS

Delivery record for [issue #46](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/46), "Redefine product requirements and acceptance criteria from user needs". Parent: [epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31).

## State

Complete. One documentation-only pull request is open. Not merged. The coordinator merges and closes.

## What was delivered

| Artifact | State |
| --- | --- |
| [`docs/product/requirements.md`](docs/product/requirements.md) | New. The proposed product specification: glossary, users and jobs, user journeys, observed current behaviour, twelve challenged assumptions, scope and exclusions, priorities, proposed threshold values, 31 numbered functional requirements, 42 measurable user acceptance criteria, a traceability table, twelve ordered delivery slices, migration and parity requirements, an assumptions register, what is not claimed, a bounded nine-item decision register, and an evidence index. |
| [`README.md`](README.md) | One added line pointing at the specification, marked as a proposal rather than policy. |
| `PROGRESS.md` | This file. |

## Proof, as run

All commands ran on Blackfin in the Orca worktree `product-requirements`, against `main` at `c6ffff4`.

| Command | Result |
| --- | --- |
| `git diff --check origin/main...HEAD` | exit 0, no output. No whitespace errors. |
| `git diff --name-only origin/main...HEAD` | `README.md`, `docs/product/requirements.md`, `PROGRESS.md`. Documentation only; no application code, dependency, workflow, manifest or deployment file. |
| Local Markdown link check over the changed files | 57 local links checked, all resolve, including the intra-document anchor. Script kept outside the repository at `/var/folders/s6/vzrzrmrd6w3_n7lqd0w7hhvw0000gn/T/opencode/check_md_links.py`; run as `python3 check_md_links.py . docs/product/requirements.md README.md PROGRESS.md`. |
| `git status --short` after staging | Only the three permitted paths. |

No application test suite was run. The change is prose only and touches no code path; the existing suites are unaffected by a new Markdown file and one README line.

## Code facts verified in this task

Each was read in the working tree, not taken from the research snapshot.

- `curl_cffi` is pinned at `0.15.0` in `pyproject.toml` and `uv.lock`; package version is `0.2.2`.
- `fetch_api.py:50-78` folds status, body type, WAF vendor, paywall and article heuristics into one `label`; a working non-article response is labelled `blocked`.
- `fetch_api.py:113-160` follows at most 10 redirects (`range(11)` with `redirect < 10`). The 11th hop assigns `output` from that response and returns it. The handler answers HTTP 200 with the eleventh-hop result, not with `{}`. There is no named exhaustion error.
- `fetch_api.py:127-131` calls the engine without `session_id`, and `engine.py:_use_session` creates and closes a fresh `AsyncSession` per call, so cookie continuity is lost between redirect hops.
- `engine.py:676-679` rejects a scheme other than HTTP or HTTPS, and rejects a username or password in the URL. It does not check the port or the resolved address. Public-address and standard-port checks are only in `fetch_api.py:30-47`.
- `engine.py:500-509` retries transport errors only, with no backoff and no `Retry-After`.
- `src/tools.ts:329` strips query and fragment from result URLs; `mcp_server.py:290-315` returns the engine result verbatim, so the two adapters redact differently.
- `fetch_api.py:82-85` holds pacing in per-process state (`self.last`, `self.locks`), so a destination reached from both regions is paced separately in each.

## Acceptance status

| Criterion | Status | Note |
| --- | --- | --- |
| AC1 | Met | 31 requirements, each with a stable ID, rationale, priority and mapped acceptance scenario. The traceability table maps every requirement to its criteria and its delivery slice. |
| AC2 | Met | Glossary plus inline definitions at first use. Section 5 is observed behaviour, section 10 is proposed, section 9 holds proposed thresholds, section 15 holds assumptions, section 18 holds evidence, section 17 holds unresolved decisions. |
| AC3 | Met | Coverage: general HTTP/API and article outcomes (FR-01, FR-04), agent and job interfaces (FR-06, FR-07), caller and session isolation (FR-08 to FR-10), credential and privacy handling (FR-11 to FR-14), redirects and retries (FR-16, FR-17), total deadlines (FR-15), byte and concurrency bounds (FR-18, FR-19), pacing (FR-20), network exits (FR-21), destination restrictions (FR-22), errors and observability (FR-24, FR-25), dependency maintenance (FR-27 to FR-29), migration (FR-30, FR-31). No requirement names or selects a heavyweight component. |
| AC4 | Met | Slice 1 is dependency-free, needs no cluster change, and is verifiable with the existing suites plus local fixture servers. Later slices and exclusions are explicit. Section 5 names five live consumers and section 14 forbids silent retirement. Section 16 states that no performance figure is claimed. |
| AC5 | Met | Two what/so what/now what explanations in sections 1 and 2, glossary in section 3, inline definitions, an 18-row evidence index, and a nine-item decision register that names which choices are Ben's. |
| AC6 | Met, except the merge, which is the coordinator's. | Documentation-only diff, links resolve, `git diff --check` clean, branch committed and pushed, PR references the issue with changed files, proof commands and results, remaining decisions, and a documentation-only rollback. This file records state and proof. |

## Remaining decisions

Recorded in section 17 of the specification. Six are product or business choices reserved for Ben and are not resolved here: D1 product framing, D2 shared verdict versus caller-owned verdict, D3 business-facing threshold values, D4 credential form, D5 personal-account use, D8 policy ownership. D6, D7 and D9 are engineering choices the team resolves, D7 only after a measured defect.

## Assumptions recorded rather than resolved

Business policy on accounts, destinations, regions, retention, budget, licence and per-site permission is not supplied. Section 15, S10 records this as a missing input. FR-11 makes the service fail closed on absent or invalid policy rather than fill it in.

## Premise check

No material false premise was found in issue #46, in epic #31, or in the G1 memo. `curl_cffi 0.15.0` was verified in code. The memo's claim that our service code is the weak part is supported by the research and is carried into the specification as assumption A8, not as a decision. No comment was added to the issue.

## Rollback

Documentation-only. Revert the merge commit, or close the pull request unmerged. No runtime, dependency, deployment or data change exists to reverse. The two files are a new specification document and one README line.
