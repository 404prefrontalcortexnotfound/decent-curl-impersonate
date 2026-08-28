from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("updater_policy", ROOT / "scripts/updater_policy.py")
assert SPEC and SPEC.loader
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)
HEAD = "a" * 40
BASE = "b" * 40


def finding(**changes):
    value = {"id": "CONSISTENCY_1", "severity": "high", "category": "consistency", "path": "upstream/curl_cffi.lock.json", "line": 2, "evidence": "Mismatch.", "repairable": True}
    value.update(changes)
    return value


def triage(decision="approve", findings=None, head=HEAD):
    return json.dumps({"schema_version": 1, "decision": decision, "head_sha": head, "findings": findings or [], "summary": "Reviewed."}, separators=(",", ":"))


def final(decision="approve", findings=None, **statuses):
    value = {"schema_version": 1, "decision": decision, "head_sha": HEAD, "findings": findings or [], "security": "pass", "provenance": "pass", "license": "pass", "runtime": "pass", "summary": "Reviewed."}
    value.update(statuses)
    return json.dumps(value, separators=(",", ":"))


def test_claude_valid_approve_repair_block_and_final() -> None:
    assert policy.validate_claude("triage", triage(), HEAD)["decision"] == "approve"
    assert policy.validate_claude("triage", triage("repair", [finding()]), HEAD)["decision"] == "repair"
    assert policy.validate_claude("triage", triage("block", [finding(repairable=False)]), HEAD)["decision"] == "block"
    assert policy.validate_claude("final", final(), HEAD)["decision"] == "approve"
    repair = json.dumps({"schema_version": 1, "decision": "patched", "head_sha_before": HEAD, "attempt": 1, "paths": ["upstream/curl_cffi.lock.json"], "summary": "Patched."}, separators=(",", ":"))
    assert policy.validate_claude("repair", repair, HEAD, 1)["decision"] == "patched"


@pytest.mark.parametrize("text", ["", "```json\n{}\n```", "{} trailing", "{}{}", "\n{}"])
def test_claude_rejects_fences_empty_multiple_or_trailing(text: str) -> None:
    with pytest.raises(policy.PolicyError): policy.validate_claude("triage", text, HEAD)


@pytest.mark.parametrize(
    "value",
    [
        lambda: triage("approve", [finding()]),
        lambda: triage("repair", [finding(path="pyproject.toml")]),
        lambda: triage("repair", [finding(category="security")]),
        lambda: triage("repair", [finding(repairable=False)]),
        lambda: triage("approve", [], "c" * 40),
        lambda: json.dumps({"schema_version": 1, "decision": "approve", "head_sha": HEAD, "findings": [], "summary": "x", "extra": 1}),
        lambda: final("approve", runtime="fail"),
    ],
)
def test_claude_rejects_contradictions_scope_security_stale_and_unknown(value) -> None:
    kind = "final" if '"runtime"' in value() else "triage"
    with pytest.raises(policy.PolicyError): policy.validate_claude(kind, value(), HEAD)


def qualification() -> dict:
    pr = {"number": 7, "state": "open", "user": {"login": "dependabot[bot]", "type": "Bot"}, "base": {"repo": {"full_name": policy.REPOSITORY}, "ref": "main", "sha": BASE}, "head": {"repo": {"full_name": policy.REPOSITORY}, "ref": "dependabot/uv/curl-cffi-1", "sha": HEAD}}
    run = {"id": 11, "workflow_id": 9, "event": "pull_request", "status": "completed", "conclusion": "success", "head_sha": HEAD, "path": policy.CI_PATH, "repository": {"full_name": policy.REPOSITORY}}
    return {
        "workflow": {"id": 9, "name": "CI", "path": policy.CI_PATH}, "run": run,
        "prs_pages": [[pr]], "pr": pr,
        "ref": {"object": {"sha": HEAD}}, "main_ref": {"object": {"sha": BASE}},
        "files_pages": [[{"filename": path, "status": "modified"} for path in policy.INITIAL_PATHS]],
        "jobs_pages": [{"jobs": [{"name": name, "conclusion": "success", "head_sha": HEAD} for name in policy.MATRIX_NAMES]}],
    }


def test_qualification_requires_canonical_workflow_dependabot_live_exact_scope_and_jobs() -> None:
    result = policy.qualify(qualification())
    assert result["head_sha"] == HEAD and result["workflow_id"] == 9


@pytest.mark.parametrize("mutation", ["workflow_id", "path", "actor", "repo", "base", "head", "ref", "files", "jobs", "ambiguous_pr"])
def test_qualification_rejects_forged_stale_ambiguous_or_non_success_evidence(mutation: str) -> None:
    data = qualification()
    if mutation == "workflow_id": data["run"]["workflow_id"] = 10
    elif mutation == "path": data["workflow"]["path"] = ".github/workflows/fake.yml"
    elif mutation == "actor": data["pr"]["user"]["login"] = "dependabot-lookalike"
    elif mutation == "repo": data["run"]["repository"]["full_name"] = "other/repo"
    elif mutation == "base": data["main_ref"]["object"]["sha"] = "c" * 40
    elif mutation == "head": data["run"]["head_sha"] = "c" * 40
    elif mutation == "ref": data["ref"]["object"]["sha"] = "c" * 40
    elif mutation == "files": data["files_pages"][0].append({"filename": "README.md", "status": "modified"})
    elif mutation == "jobs": data["jobs_pages"][0]["jobs"][0]["conclusion"] = "skipped"
    else: data["prs_pages"][0].append(data["pr"].copy())
    with pytest.raises(policy.PolicyError): policy.qualify(data)


def valid_patch() -> bytes:
    return b"diff --git a/THIRD_PARTY_NOTICES.md b/THIRD_PARTY_NOTICES.md\n--- a/THIRD_PARTY_NOTICES.md\n+++ b/THIRD_PARTY_NOTICES.md\n@@ -1 +1 @@\n-old\n+new\n"


def test_patch_manifest_binds_identity_digest_paths_and_attempt() -> None:
    patch = valid_patch()
    manifest = policy.make_manifest(patch, 10, 2, 7, 1, HEAD)
    assert manifest["patch_sha256"]
    assert policy.validate_manifest(manifest, patch, 10, 2, 7, 1, HEAD) == manifest
    with pytest.raises(policy.PolicyError): policy.validate_manifest(manifest, patch + b"\n", 10, 2, 7, 1, HEAD)
    with pytest.raises(policy.PolicyError): policy.make_manifest(patch, 10, 2, 7, 3, HEAD)


@pytest.mark.parametrize("token", [b"GIT binary patch\n", b"old mode 100644\n", b"diff --git a/../x b/../x\n--- a/../x\n+++ b/../x\n", b"diff --git a/pyproject.toml b/pyproject.toml\n--- a/pyproject.toml\n+++ b/pyproject.toml\n"])
def test_patch_rejects_binary_mode_traversal_and_protected_paths(token: bytes) -> None:
    with pytest.raises(policy.PolicyError): policy.patch_paths(token)


def ci_evidence() -> dict:
    gate = "gate-1"
    run = {"id": 12, "workflow_id": 9, "event": "workflow_dispatch", "status": "completed", "conclusion": "success", "head_branch": "dependabot/uv/curl", "head_sha": HEAD, "display_title": f"CI {gate}", "repository": {"full_name": policy.REPOSITORY}}
    checks = [{"name": name, "conclusion": "success", "app": {"slug": "github-actions"}, "details_url": f"https://github/actions/runs/12/job"} for name in policy.MATRIX_NAMES]
    checks.append({"name": policy.PENDING_POLICY, "conclusion": "success", "app": {"slug": "github-actions"}, "details_url": "https://github/actions/runs/12/job"})
    payloads = [{"schema_version": 1, "gate_id": gate, "head_sha": HEAD, "run_id": 12, "os": os, "gates": {key: "pass" for key in ["baseline", "live_fingerprint", "npm_audit", "python_audit", "package", "runtime"]}} for os in ["ubuntu-24.04", "macos-14"]]
    return {"runs_pages": [{"workflow_runs": [run]}], "jobs_pages": [{"jobs": [{"name": name, "conclusion": "success", "run_id": 12} for name in policy.MATRIX_NAMES]}], "checks_pages": [{"check_runs": checks}], "artifacts_pages": [{"artifacts": [{"id": i + 1, "name": f"updater-evidence-{gate}-{os}", "expired": False, "workflow_run": {"id": 12}} for i, os in enumerate(["ubuntu-24.04", "macos-14"])]}], "artifact_evidence": payloads}


def test_ci_collection_binds_exact_run_jobs_checks_and_artifacts() -> None:
    result = policy.validate_ci(ci_evidence(), 9, 12, "dependabot/uv/curl", HEAD, "gate-1")
    assert result["artifacts"] == [1, 2]


@pytest.mark.parametrize("mutation", ["wrong_sha", "duplicate_run", "skipped", "terminal_collision", "old_artifact", "provider"])
def test_ci_rejects_ambiguous_stale_collision_and_every_non_success(mutation: str) -> None:
    data = ci_evidence()
    if mutation == "wrong_sha": data["runs_pages"][0]["workflow_runs"][0]["head_sha"] = "c" * 40
    elif mutation == "duplicate_run": data["runs_pages"][0]["workflow_runs"].append(data["runs_pages"][0]["workflow_runs"][0].copy())
    elif mutation == "skipped": data["jobs_pages"][0]["jobs"][0]["conclusion"] = "skipped"
    elif mutation == "terminal_collision": data["checks_pages"][0]["check_runs"].append({"name": policy.TERMINAL_POLICY, "conclusion": "success", "app": {"slug": "github-actions"}, "details_url": "https://github/actions/runs/12/job"})
    elif mutation == "old_artifact": data["artifacts_pages"][0]["artifacts"][0]["workflow_run"]["id"] = 99
    else: data["artifact_evidence"][0]["gates"]["npm_audit"] = "provider_failure"
    with pytest.raises(policy.PolicyError): policy.validate_ci(data, 9, 12, "dependabot/uv/curl", HEAD, "gate-1")


def test_final_verdict_fails_closed_on_stale_missing_or_provider_evidence() -> None:
    ci = policy.validate_ci(ci_evidence(), 9, 12, "dependabot/uv/curl", HEAD, "gate-1")
    claude = policy.validate_claude("final", final(), HEAD)
    data = {"pr_number": 7, "base_sha": BASE, "current_main_sha": BASE, "head_sha": HEAD, "current_head_sha": HEAD, "candidate_versions": {"curl_cffi": "1"}, "changed_files": policy.FINAL_PATHS, "repair_count": 0, "ci": ci, "claude_final": claude, "artifacts": [1, 2]}
    assert policy.build_verdict(data)["decision"] == "merge"
    data["current_head_sha"] = "c" * 40
    assert policy.build_verdict(data)["decision"] == "block"
