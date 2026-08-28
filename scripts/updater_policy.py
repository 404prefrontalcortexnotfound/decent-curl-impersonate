#!/usr/bin/env python3
"""Fail-closed validation for the trusted curl-cffi updater coordinator.

The utility validates captured public GitHub/Claude/patch evidence.  It performs
no network request and has no repository mutation capability.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import sys
from typing import Any

REPOSITORY = "404prefrontalcortexnotfound/decent-curl-impersonate"
CI_PATH = ".github/workflows/ci.yml"
INITIAL_PATHS = ["pyproject.toml", "uv.lock"]
REPAIR_PATHS = ["THIRD_PARTY_NOTICES.md", "upstream/curl_cffi.lock.json", "upstream/curl_impersonate.lock.json"]
FINAL_PATHS = sorted(INITIAL_PATHS + REPAIR_PATHS)
MATRIX_NAMES = ["Test (macos-14)", "Test (ubuntu-24.04)"]
PENDING_POLICY = "Updater policy (coordinator pending)"
TERMINAL_POLICY = "Updater policy"
HEX40 = re.compile(r"^[0-9a-f]{40}$")
MAX_PATCH_BYTES = 256 * 1024


class PolicyError(RuntimeError):
    def __init__(self, category: str, message: str):
        super().__init__(message)
        self.category = category


def canonical(value: Any) -> str:
    return json.dumps(value, separators=(",", ":"), sort_keys=True)


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise PolicyError("malformed", "malformed JSON evidence") from exc


def read_single_json_text(text: str) -> dict[str, Any]:
    if not text or text != text.strip() or text.startswith("```"):
        raise PolicyError("claude", "Claude output must be one bare JSON object")
    decoder = json.JSONDecoder()
    try:
        value, end = decoder.raw_decode(text)
    except json.JSONDecodeError as exc:
        raise PolicyError("claude", "Claude output is malformed") from exc
    if end != len(text) or not isinstance(value, dict):
        raise PolicyError("claude", "Claude output has trailing prose or multiple values")
    return value


def exact_keys(value: dict[str, Any], keys: set[str], context: str) -> None:
    if set(value) != keys:
        raise PolicyError("schema", f"{context} fields do not match schema")


def validate_finding(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise PolicyError("schema", "finding must be an object")
    exact_keys(value, {"id", "severity", "category", "path", "line", "evidence", "repairable"}, "finding")
    if not isinstance(value["id"], str) or not re.fullmatch(r"[A-Z0-9_-]{1,40}", value["id"]):
        raise PolicyError("schema", "invalid finding id")
    if value["severity"] not in {"low", "medium", "high", "critical"}:
        raise PolicyError("schema", "invalid finding severity")
    if value["category"] not in {"consistency", "provenance", "license", "runtime", "security", "scope"}:
        raise PolicyError("schema", "invalid finding category")
    if value["path"] not in {None, *FINAL_PATHS}:
        raise PolicyError("schema", "invalid finding path")
    if value["line"] is not None and (type(value["line"]) is not int or value["line"] < 1):
        raise PolicyError("schema", "invalid finding line")
    if not isinstance(value["evidence"], str) or not 1 <= len(value["evidence"]) <= 1000:
        raise PolicyError("schema", "invalid finding evidence")
    if type(value["repairable"]) is not bool:
        raise PolicyError("schema", "invalid repairable flag")
    return value


def validate_claude(kind: str, text: str, head_sha: str, attempt: int | None = None) -> dict[str, Any]:
    if not HEX40.fullmatch(head_sha):
        raise PolicyError("input", "invalid expected head SHA")
    value = read_single_json_text(text)
    if kind == "repair":
        exact_keys(value, {"schema_version", "decision", "head_sha_before", "attempt", "paths", "summary"}, kind)
        if value["schema_version"] != 1 or value["decision"] not in {"patched", "block"}:
            raise PolicyError("schema", "invalid repair decision")
        if value["head_sha_before"] != head_sha or value["attempt"] != attempt or attempt not in {1, 2}:
            raise PolicyError("stale", "repair output is stale or has invalid attempt")
        paths = value["paths"]
        if not isinstance(paths, list) or paths != sorted(paths) or len(paths) != len(set(paths)) or any(p not in REPAIR_PATHS for p in paths):
            raise PolicyError("scope", "repair claims invalid paths")
        if value["decision"] == "patched" and not paths:
            raise PolicyError("schema", "patched decision requires paths")
    else:
        base = {"schema_version", "decision", "head_sha", "findings", "summary"}
        if kind == "final":
            base |= {"security", "provenance", "license", "runtime"}
        exact_keys(value, base, kind)
        allowed = {"approve", "repair", "block"} if kind == "triage" else {"approve", "block"}
        if value["schema_version"] != 1 or value["decision"] not in allowed or value["head_sha"] != head_sha:
            raise PolicyError("stale", "Claude output decision or SHA invalid")
        if not isinstance(value["findings"], list) or len(value["findings"]) > 20:
            raise PolicyError("schema", "invalid findings")
        findings = [validate_finding(item) for item in value["findings"]]
        security = any(f["category"] == "security" for f in findings)
        if value["decision"] == "approve" and findings:
            raise PolicyError("contradiction", "approval cannot contain findings")
        if value["decision"] == "repair":
            if not findings or any(not f["repairable"] or f["path"] not in REPAIR_PATHS or f["category"] == "security" for f in findings):
                raise PolicyError("scope", "repair includes unrepairable, protected, or security finding")
        if security and value["decision"] != "block":
            raise PolicyError("security", "security finding must block")
        if kind == "final":
            statuses = [value[k] for k in ("security", "provenance", "license", "runtime")]
            if any(item not in {"pass", "fail"} for item in statuses):
                raise PolicyError("schema", "invalid final status")
            if value["decision"] == "approve" and statuses != ["pass"] * 4:
                raise PolicyError("contradiction", "final approval requires all pass")
            if value["decision"] == "block" and not findings and statuses == ["pass"] * 4:
                raise PolicyError("contradiction", "final block needs a finding or failed status")
    if not isinstance(value["summary"], str) or not 1 <= len(value["summary"]) <= 1000:
        raise PolicyError("schema", "invalid bounded summary")
    return value


def flatten_pages(value: Any, key: str | None = None) -> list[Any]:
    if not isinstance(value, list) or not value or any(not isinstance(page, (list, dict)) for page in value):
        raise PolicyError("pagination", "paginated evidence is missing or malformed")
    result: list[Any] = []
    for page in value:
        items = page if key is None else page.get(key)
        if not isinstance(items, list):
            raise PolicyError("pagination", "paginated page collection malformed")
        result.extend(items)
    return result


def one(values: list[Any], message: str) -> Any:
    if len(values) != 1:
        raise PolicyError("ambiguous", message)
    return values[0]


def validate_live_pr(pr: dict[str, Any], ref: dict[str, Any], main: dict[str, Any], expected_head: str, expected_base: str, pr_number: int | None = None) -> dict[str, str]:
    try:
        if pr.get("state") != "open" or (pr_number is not None and pr.get("number") != pr_number):
            raise PolicyError("pr", "PR is not the expected open PR")
        if pr["base"]["repo"]["full_name"] != REPOSITORY or pr["head"]["repo"]["full_name"] != REPOSITORY:
            raise PolicyError("pr", "PR repositories differ")
        if pr["base"]["ref"] != "main" or pr["base"]["sha"] != expected_base or main["object"]["sha"] != expected_base:
            raise PolicyError("stale", "main base advanced")
        if pr["head"]["sha"] != expected_head or ref["object"]["sha"] != expected_head:
            raise PolicyError("stale", "PR head/ref moved")
        branch = pr["head"]["ref"]
        if not isinstance(branch, str) or not branch.startswith("dependabot/uv/"):
            raise PolicyError("pr", "unexpected Dependabot head ref")
    except (KeyError, TypeError) as exc:
        raise PolicyError("malformed", "live PR evidence malformed") from exc
    return {"branch": branch, "base_sha": expected_base, "head_sha": expected_head}


def validate_files(files_pages: Any, expected: list[str]) -> list[str]:
    files = flatten_pages(files_pages)
    names = []
    for item in files:
        if not isinstance(item, dict) or item.get("status") != "modified" or item.get("filename") not in expected:
            raise PolicyError("scope", "PR file is not an allowed regular modification")
        if item.get("previous_filename") is not None:
            raise PolicyError("scope", "rename/copy file rejected")
        names.append(item["filename"])
    if sorted(names) != sorted(expected) or len(names) != len(set(names)):
        raise PolicyError("scope", "PR file set is not exact")
    return sorted(names)


def qualify(evidence: dict[str, Any]) -> dict[str, Any]:
    exact_keys(evidence, {"workflow", "run", "prs_pages", "pr", "ref", "main_ref", "files_pages", "jobs_pages"}, "qualification")
    workflow, run, pr = evidence["workflow"], evidence["run"], evidence["pr"]
    try:
        if workflow["path"] != CI_PATH or workflow["name"] != "CI" or workflow["id"] != run["workflow_id"]:
            raise PolicyError("workflow", "workflow ID/path/name mismatch")
        if run["repository"]["full_name"] != REPOSITORY or run["event"] != "pull_request" or run["status"] != "completed":
            raise PolicyError("run", "run repository/event/status mismatch")
        if run["conclusion"] != "success" or run["head_sha"] != pr["head"]["sha"]:
            raise PolicyError("run", "run conclusion/head mismatch")
        if run.get("path", CI_PATH) != CI_PATH:
            raise PolicyError("workflow", "run path mismatch")
        user = pr["user"]
        if user["login"] != "dependabot[bot]" or user.get("type") != "Bot":
            raise PolicyError("actor", "PR author is not Dependabot Bot")
    except (KeyError, TypeError) as exc:
        raise PolicyError("malformed", "qualification evidence malformed") from exc
    prs = flatten_pages(evidence["prs_pages"])
    matched = [item for item in prs if item.get("number") == pr.get("number") and item.get("head", {}).get("sha") == pr.get("head", {}).get("sha")]
    one(matched, "expected exactly one associated open PR")
    live = validate_live_pr(pr, evidence["ref"], evidence["main_ref"], pr["head"]["sha"], pr["base"]["sha"], pr["number"])
    validate_files(evidence["files_pages"], INITIAL_PATHS)
    jobs = flatten_pages(evidence["jobs_pages"], "jobs")
    for name in MATRIX_NAMES:
        one([job for job in jobs if job.get("name") == name and job.get("conclusion") == "success" and job.get("head_sha", run["head_sha"]) == run["head_sha"]], f"missing or ambiguous successful {name}")
    return {"schema_version": 1, "pr_number": pr["number"], **live, "workflow_id": workflow["id"], "run_id": run["id"]}


def patch_paths(patch: bytes) -> list[str]:
    if not patch or len(patch) > MAX_PATCH_BYTES or b"\x00" in patch:
        raise PolicyError("patch", "patch empty, binary, or too large")
    try:
        text = patch.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise PolicyError("patch", "patch is not UTF-8 text") from exc
    forbidden = ("GIT binary patch", "Binary files ", "old mode ", "new mode ", "new file mode ", "deleted file mode ", "similarity index ", "rename from ", "rename to ")
    if any(token in text for token in forbidden):
        raise PolicyError("patch", "binary/mode/type/rename patch rejected")
    diffs = re.findall(r"(?m)^diff --git a/(.+) b/(.+)$", text)
    if not diffs:
        raise PolicyError("patch", "patch has no unified diff headers")
    paths = []
    for left, right in diffs:
        if left != right or left not in REPAIR_PATHS:
            raise PolicyError("patch", "patch path outside repair subset")
        pure = PurePosixPath(left)
        if pure.is_absolute() or ".." in pure.parts or "\\" in left:
            raise PolicyError("patch", "unsafe patch path")
        if text.count(f"--- a/{left}\n") != 1 or text.count(f"+++ b/{right}\n") != 1:
            raise PolicyError("patch", "unexpected or duplicate patch headers")
        paths.append(left)
    if paths != sorted(set(paths)) or len(paths) > 3:
        raise PolicyError("patch", "patch paths must be unique and sorted")
    return paths


def make_manifest(patch: bytes, run_id: int, run_attempt: int, pr: int, attempt: int, head: str) -> dict[str, Any]:
    if min(run_id, run_attempt, pr) < 1 or attempt not in {1, 2} or not HEX40.fullmatch(head):
        raise PolicyError("manifest", "invalid patch manifest identity")
    return {
        "schema_version": 1,
        "coordinator_run_id": run_id,
        "coordinator_run_attempt": run_attempt,
        "pr_number": pr,
        "repair_attempt": attempt,
        "head_sha_before": head,
        "patch_sha256": hashlib.sha256(patch).hexdigest(),
        "changed_paths": patch_paths(patch),
    }


def validate_manifest(manifest: dict[str, Any], patch: bytes, run_id: int, run_attempt: int, pr: int, attempt: int, head: str) -> dict[str, Any]:
    expected = make_manifest(patch, run_id, run_attempt, pr, attempt, head)
    if manifest != expected:
        raise PolicyError("manifest", "patch manifest identity, digest, or paths mismatch")
    return expected


def validate_ci(evidence: dict[str, Any], workflow_id: int, run_id: int, branch: str, head: str, gate_id: str) -> dict[str, Any]:
    exact_keys(evidence, {"runs_pages", "jobs_pages", "checks_pages", "artifacts_pages", "artifact_evidence"}, "CI evidence")
    runs = flatten_pages(evidence["runs_pages"], "workflow_runs")
    run = one([
        item for item in runs
        if item.get("id") == run_id and item.get("workflow_id") == workflow_id
        and item.get("event") == "workflow_dispatch" and item.get("head_branch") == branch
        and item.get("head_sha") == head and item.get("repository", {}).get("full_name") == REPOSITORY
        and gate_id in str(item.get("display_title", ""))
    ], "selected updater CI run missing or ambiguous")
    if run.get("status") != "completed" or run.get("conclusion") != "success":
        raise PolicyError("ci", "updater CI did not succeed")
    jobs = flatten_pages(evidence["jobs_pages"], "jobs")
    checks = flatten_pages(evidence["checks_pages"], "check_runs")
    for name in MATRIX_NAMES:
        one([j for j in jobs if j.get("name") == name and j.get("conclusion") == "success" and j.get("run_id", run_id) == run_id], f"CI job {name} missing")
        one([c for c in checks if c.get("name") == name and c.get("conclusion") == "success" and c.get("app", {}).get("slug") == "github-actions" and f"/actions/runs/{run_id}/" in c.get("details_url", "")], f"CI check {name} missing")
    one([c for c in checks if c.get("name") == PENDING_POLICY and c.get("app", {}).get("slug") == "github-actions" and f"/actions/runs/{run_id}/" in c.get("details_url", "")], "pending policy check missing")
    if any(c.get("name") == TERMINAL_POLICY and c.get("app", {}).get("slug") == "github-actions" and f"/actions/runs/{run_id}/" in c.get("details_url", "") for c in checks):
        raise PolicyError("collision", "dispatched CI created exact terminal policy check")
    artifacts = flatten_pages(evidence["artifacts_pages"], "artifacts")
    selected = [a for a in artifacts if a.get("workflow_run", {}).get("id", run_id) == run_id and a.get("name") in {f"updater-evidence-{gate_id}-ubuntu-24.04", f"updater-evidence-{gate_id}-macos-14"} and not a.get("expired")]
    if len(selected) != 2 or len({a["name"] for a in selected}) != 2:
        raise PolicyError("artifact", "exactly two current evidence artifacts required")
    payloads = evidence["artifact_evidence"]
    if not isinstance(payloads, list) or len(payloads) != 2:
        raise PolicyError("artifact", "artifact payload evidence missing")
    gates = ["baseline", "live_fingerprint", "npm_audit", "python_audit", "package", "runtime"]
    normalized = []
    for payload in payloads:
        if not isinstance(payload, dict) or payload.get("schema_version") != 1 or payload.get("gate_id") != gate_id or payload.get("head_sha") != head or payload.get("run_id") != run_id:
            raise PolicyError("artifact", "artifact payload is stale or malformed")
        if payload.get("os") not in {"ubuntu-24.04", "macos-14"} or any(payload.get("gates", {}).get(gate) != "pass" for gate in gates):
            raise PolicyError("provider", "one updater gate is not pass")
        normalized.append(payload)
    return {"schema_version": 1, "run_id": run_id, "head_sha": head, "gate_id": gate_id, "artifacts": sorted(a["id"] for a in selected), "os_evidence": sorted(normalized, key=lambda p: p["os"])}


def build_verdict(data: dict[str, Any]) -> dict[str, Any]:
    reasons: list[str] = []
    required = {"pr_number", "base_sha", "current_main_sha", "head_sha", "current_head_sha", "candidate_versions", "changed_files", "repair_count", "ci", "claude_final", "artifacts"}
    if set(data) != required:
        reasons.append("malformed verdict inputs")
    else:
        if data["base_sha"] != data["current_main_sha"]:
            reasons.append("base advanced")
        if data["head_sha"] != data["current_head_sha"]:
            reasons.append("head moved")
        if data["changed_files"] != FINAL_PATHS:
            reasons.append("final path set mismatch")
        if type(data["repair_count"]) is not int or data["repair_count"] not in {0, 1, 2}:
            reasons.append("repair count invalid")
        ci = data["ci"]
        if not isinstance(ci, dict) or ci.get("head_sha") != data["head_sha"] or len(ci.get("os_evidence", [])) != 2:
            reasons.append("CI evidence stale or incomplete")
        final = data["claude_final"]
        if not isinstance(final, dict) or final.get("decision") != "approve" or final.get("head_sha") != data["head_sha"]:
            reasons.append("final Claude gate did not approve exact head")
        if not isinstance(data["artifacts"], list) or not data["artifacts"]:
            reasons.append("artifact identity missing")
    return {
        "schema_version": 1,
        "decision": "block" if reasons else "merge",
        "pr_number": data.get("pr_number"),
        "base_sha": data.get("base_sha"),
        "head_sha": data.get("head_sha"),
        "candidate_versions": data.get("candidate_versions"),
        "changed_files": data.get("changed_files"),
        "repair_count": data.get("repair_count"),
        "selected_ci_run_id": data.get("ci", {}).get("run_id") if isinstance(data.get("ci"), dict) else None,
        "evidence_artifact_ids": data.get("artifacts", []),
        "os_gates": data.get("ci", {}).get("os_evidence", []) if isinstance(data.get("ci"), dict) else [],
        "claude_final_gate": data.get("claude_final"),
        "blocking_reasons": reasons,
    }


def write_json(value: Any, path: Path | None) -> None:
    text = json.dumps(value, indent=2) + "\n"
    if path:
        path.write_text(text, encoding="utf-8", newline="\n")
    else:
        print(text, end="")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    subs = parser.add_subparsers(dest="command", required=True)
    q = subs.add_parser("qualify")
    q.add_argument("--evidence", type=Path, required=True); q.add_argument("--output", type=Path)
    live = subs.add_parser("validate-live")
    live.add_argument("--evidence", type=Path, required=True); live.add_argument("--head", required=True); live.add_argument("--base", required=True); live.add_argument("--pr", type=int, required=True); live.add_argument("--output", type=Path)
    claude = subs.add_parser("validate-claude")
    claude.add_argument("--kind", choices=["triage", "repair", "final"], required=True); claude.add_argument("--input", type=Path, required=True); claude.add_argument("--head", required=True); claude.add_argument("--attempt", type=int); claude.add_argument("--output", type=Path)
    manifest = subs.add_parser("create-patch-manifest")
    manifest.add_argument("--patch", type=Path, required=True); manifest.add_argument("--run-id", type=int, required=True); manifest.add_argument("--run-attempt", type=int, required=True); manifest.add_argument("--pr", type=int, required=True); manifest.add_argument("--attempt", type=int, required=True); manifest.add_argument("--head", required=True); manifest.add_argument("--output", type=Path, required=True)
    check_manifest = subs.add_parser("validate-patch")
    check_manifest.add_argument("--patch", type=Path, required=True); check_manifest.add_argument("--manifest", type=Path, required=True); check_manifest.add_argument("--run-id", type=int, required=True); check_manifest.add_argument("--run-attempt", type=int, required=True); check_manifest.add_argument("--pr", type=int, required=True); check_manifest.add_argument("--attempt", type=int, required=True); check_manifest.add_argument("--head", required=True)
    ci = subs.add_parser("collect-ci")
    ci.add_argument("--evidence", type=Path, required=True); ci.add_argument("--workflow-id", type=int, required=True); ci.add_argument("--run-id", type=int, required=True); ci.add_argument("--branch", required=True); ci.add_argument("--head", required=True); ci.add_argument("--gate-id", required=True); ci.add_argument("--output", type=Path)
    verdict = subs.add_parser("verdict")
    verdict.add_argument("--evidence", type=Path, required=True); verdict.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.command == "qualify": result = qualify(read_json(args.evidence))
        elif args.command == "validate-live":
            value = read_json(args.evidence); result = validate_live_pr(value["pr"], value["ref"], value["main_ref"], args.head, args.base, args.pr)
        elif args.command == "validate-claude": result = validate_claude(args.kind, args.input.read_text(encoding="utf-8"), args.head, args.attempt)
        elif args.command == "create-patch-manifest": result = make_manifest(args.patch.read_bytes(), args.run_id, args.run_attempt, args.pr, args.attempt, args.head)
        elif args.command == "validate-patch": result = validate_manifest(read_json(args.manifest), args.patch.read_bytes(), args.run_id, args.run_attempt, args.pr, args.attempt, args.head)
        elif args.command == "collect-ci": result = validate_ci(read_json(args.evidence), args.workflow_id, args.run_id, args.branch, args.head, args.gate_id)
        else: result = build_verdict(read_json(args.evidence))
        write_json(result, getattr(args, "output", None))
        return 0 if result.get("decision") != "block" else 1
    except (PolicyError, OSError, UnicodeError) as exc:
        category = exc.category if isinstance(exc, PolicyError) else "malformed"
        write_json({"schema_version": 1, "decision": "block", "blocking_reasons": [category]}, getattr(args, "output", None))
        print(f"updater policy blocked: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
