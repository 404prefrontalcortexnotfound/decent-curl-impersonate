from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[2]
CI = ROOT / ".github/workflows/ci.yml"
SMOKE = ROOT / ".github/workflows/updater-ci-dispatch-smoke.yml"
JANITOR = ROOT / ".github/workflows/updater-ci-dispatch-smoke-cleanup.yml"
README = ROOT / "README.md"
COORDINATOR = ROOT / ".github/workflows/curl-cffi-updater.yml"
DEPENDABOT = ROOT / ".github/dependabot.yml"


def workflow_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_ci_preserves_baseline_checks_and_commands() -> None:
    text = workflow_text(CI)

    for trigger in ("push:", "pull_request:", "workflow_call:", "workflow_dispatch:"):
        assert trigger in text
    assert "branches:\n      - main" in text
    assert "name: Test (${{ matrix.os }})" in text
    assert "os: [ubuntu-24.04, macos-14]" in text

    for command in (
        "npm ci",
        "uv sync --frozen --python 3.13",
        "uv run pytest python/tests -q",
        "bun test",
        "bun run typecheck",
        "bun run build",
        "git diff --exit-code -- dist/index.js",
        "npm pack --dry-run --json",
        "node scripts/verify-package.mjs",
    ):
        assert command in text


def test_ci_supports_smoke_and_production_exact_head_without_policy_dependency() -> None:
    text = workflow_text(CI)

    for dispatch_input in ("gate_id:", "pr_number:", "expected_head_sha:", "validation_mode:"):
        assert dispatch_input in text
    assert "run-name:" in text
    assert "- smoke\n          - updater" in text
    assert "Updater policy (coordinator pending)" in text
    assert "github.actor == 'dependabot[bot]'" in text
    assert "name: Test (${{ matrix.os }})" in text
    test_prefix = text.split("  test:", 1)[1].split("    steps:", 1)[0]
    assert "needs:" not in test_prefix
    assert "scripts/updater_metadata.py verify-final" in text
    for gate in (
        "DECENT_CURL_LIVE_TESTS=1",
        "npm audit --omit=dev --audit-level=low --json",
        "pip-audit==2.10.1",
        "uv sync --frozen --python 3.13 --no-dev",
        "runtime-report",
        "updater-evidence-${{ inputs.gate_id }}-${{ matrix.os }}",
    ):
        assert gate in text
    assert "cmp --silent" in text  # Stage 1 remains through rollout.


def test_touched_privileged_actions_are_immutable() -> None:
    text = workflow_text(CI) + workflow_text(COORDINATOR)
    uses = re.findall(r"^\s*- uses:\s*([^\s#]+)", text, flags=re.MULTILINE)

    assert uses
    for action in uses:
        assert re.search(r"@[0-9a-f]{40}$", action), action


def job_block(text: str, job: str) -> str:
    start = text.index(f"  {job}:\n")
    match = re.search(r"^  [a-zA-Z0-9_-]+:\n", text[start + 3 :], flags=re.MULTILINE)
    return text[start:] if match is None else text[start : start + 3 + match.start()]


def test_dependabot_is_uv_weekly_curl_cffi_only() -> None:
    text = workflow_text(DEPENDABOT)
    assert text.count("package-ecosystem:") == 1
    assert "package-ecosystem: uv" in text
    assert "interval: weekly" in text and "day: monday" in text
    assert 'time: "06:37"' in text and "target-branch: main" in text
    assert "rebase-strategy: auto" in text and "open-pull-requests-limit: 1" in text
    assert text.count("dependency-name:") == 1
    assert "dependency-name: curl-cffi" in text and "dependency-type: direct" in text
    assert "npm" not in text and "release" not in text.lower()


def test_coordinator_qualifies_trusted_run_and_unrolls_two_repairs() -> None:
    text = workflow_text(COORDINATOR)
    trigger = text.split("permissions:", 1)[0]
    assert "workflow_run:" in trigger and "workflows: [CI]" in trigger and "types: [completed]" in trigger
    assert "pull_request_target:" not in text
    for guard in (
        'EXPECTED_REPOSITORY: 404prefrontalcortexnotfound/decent-curl-impersonate',
        'actions/workflows/ci.yml',
        'commits/${head_sha}/pulls?per_page=100',
        'pulls/${pr_number}/files?per_page=100',
        'actions/runs/${SOURCE_RUN_ID}/jobs?per_page=100',
        'scripts/updater_policy.py qualify',
        'persist-credentials: false',
        'path: candidate',
        '[dependabot skip]',
    ):
        assert guard in text
    assert text.count("Claude repair 1") == 1
    assert text.count("Claude repair 2") == 1
    assert "Claude repair 3" not in text
    assert text.count("Apply validated repair 1") == 1
    assert text.count("Apply validated repair 2") == 1
    assert "Claude mandatory final no-repair review" in text
    for job in ("dispatch-ci-0", "dispatch-ci-1", "dispatch-ci-2"):
        block = job_block(text, job)
        assert "actions: write" in block and "contents: read" in block
        assert "validation_mode=updater" in block
        assert "collect-ci" in block


def test_claude_and_writer_permissions_are_strictly_separated() -> None:
    text = workflow_text(COORDINATOR)
    for job in ("claude-triage-0", "claude-repair-1", "claude-triage-1", "claude-repair-2", "claude-final-review"):
        block = job_block(text, job)
        assert "environment: curl-cffi-updater-claude" in block
        assert "contents: read" in block and "contents: write" not in block
        assert "claude_code_oauth_token:" in block
        assert "--model claude-sonnet-4-6" in block
        assert "Bash" not in re.findall(r"--allowedTools ([^\n]+)", block)[0]
        assert "display_report: false" in block and "show_full_output: false" in block
    for job in ("enrich", "writer-1", "writer-2"):
        block = job_block(text, job)
        assert "contents: write" in block
        assert "CLAUDE_CODE_OAUTH_TOKEN" not in block
        assert "claude_code_oauth_token" not in block
    assert "--allowedTools Read,Edit,Write,Glob,Grep" in job_block(text, "claude-repair-1")
    assert "--allowedTools Read,Glob,Grep" in job_block(text, "claude-final-review")


def test_terminal_status_and_native_auto_merge_are_exact_and_release_free() -> None:
    text = workflow_text(COORDINATOR)
    status = job_block(text, "terminal-status")
    merge = job_block(text, "native-auto-merge")
    assert "statuses: write" in status and '-f context="Updater policy"' in status
    assert "contents: write" not in status
    assert "--auto --squash --match-head-commit" in merge
    assert "CURL_CFFI_UPDATER_ENABLED == 'true'" in merge
    assert "CURL_CFFI_UPDATER_AUTO_MERGE == 'true'" in merge
    for forbidden in ("--admin", "npm publish", "gh release", "git tag", "pull_request_target:"):
        assert forbidden not in text
    assert "package.json" not in merge and "publish.yml" not in merge


def test_privileged_workflows_forbid_api_key_names_and_mutable_actions() -> None:
    text = workflow_text(CI) + workflow_text(COORDINATOR)
    for forbidden in ("ANTHROPIC_API_KEY", "anthropic_api_key", "pull_request_target:"):
        assert forbidden not in text
    assert not re.search(r"^\s*- uses:\s*[^\s#]+@(?![0-9a-f]{40}(?:\s|$))", text, re.MULTILINE)


def test_smoke_is_manual_exact_head_and_always_cleans_up() -> None:
    text = workflow_text(SMOKE)
    trigger_block = text.split("permissions:", 1)[0]

    assert "workflow_dispatch:" in trigger_block
    for automatic_trigger in ("schedule:", "pull_request:", "push:", "workflow_call:"):
        assert automatic_trigger not in trigger_block

    assert "contents: read" in text
    for permission in ("actions: write", "contents: write", "pull-requests: write"):
        assert permission in text
    assert "if: ${{ always() }}" in text
    assert "ci.yml" in text
    assert "expected_head_sha" in text
    assert "updater-ci-dispatch-smoke:" in text

    for check_name in ("Test (ubuntu-24.04)", "Test (macos-14)", "Updater policy"):
        assert check_name in text


def test_smoke_state_records_explicit_creation_ownership() -> None:
    text = workflow_text(SMOKE)

    for field in (
        "base_sha: null",
        "intended_head_sha: null",
        "branch_created: false",
        "pr_created: false",
    ):
        assert field in text
    state_sha_update = text.index(
        ".base_sha = $base_sha | .intended_head_sha = $intended_head_sha"
    )
    ref_creation = text.index('gh api --method POST "repos/${REPOSITORY}/git/refs"')
    branch_flag = text.index(".branch_created = true")
    pr_creation = text.index('gh api --method POST "repos/${REPOSITORY}/pulls"')
    pr_flag = text.index(".pr_number = $pr_number | .pr_created = true")
    assert state_sha_update < ref_creation < branch_flag < pr_creation < pr_flag
    assert "branch_created == true" in text
    assert "pr_created == true" in text
    assert "matching_prs" not in text


def test_smoke_cleanup_proves_exact_ownership_before_mutation() -> None:
    text = workflow_text(SMOKE)

    for guard in (
        '.base.repo.full_name == $repository',
        '.base.sha == $base_sha',
        '.base.ref == "main"',
        '.head.repo.full_name == $repository',
        '.head.ref == $branch',
        '.head.sha == $head_sha',
        '.merged == false',
        '.merged_at == null',
        '.[0].filename == "uv.lock"',
        '.[0].additions == 1',
        '.[0].deletions == 0',
        "contents/uv.lock?ref=${base_sha}",
        "contents/uv.lock?ref=${head_sha}",
        "printf '# updater-ci-dispatch-smoke: %s\\n'",
        "cmp --silent",
        '.object.sha == $head_sha',
    ):
        assert guard in text

    proof_end = text.index("Smoke cleanup ownership proof succeeded.")
    proof_prefix = text[:proof_end]
    assert "--method PATCH" not in proof_prefix
    assert "--method DELETE" not in proof_prefix
    assert text.index("--method PATCH", proof_end) > proof_end
    assert text.index("--method DELETE", proof_end) > proof_end


def test_smoke_live_discovery_is_fully_paginated_and_flattened() -> None:
    text = workflow_text(SMOKE)

    for endpoint_key in (
        "actions/workflows/ci.yml/runs",
        "actions/runs/${ci_run_id}/jobs",
        "commits/${head_sha}/check-runs",
        "pulls/${pr_number}/files",
    ):
        endpoint_at = text.index(endpoint_key)
        command_start = text.rfind("gh api", 0, endpoint_at)
        command_end = text.find(")", endpoint_at)
        command = text[command_start:command_end]
        assert "--paginate" in command
        assert "--slurp" in command

    assert "map(.workflow_runs) | add" in text
    assert "map(.jobs) | add" in text
    assert "map(.check_runs) | add" in text
    assert "jq 'add' <<<\"${files_pages}\"" in text
    assert text.count('length > 0') >= 4
    assert '.workflow_runs | type == "array"' in text
    assert '.jobs | type == "array"' in text
    assert '.check_runs | type == "array"' in text
    assert "type == \"array\"" in text


def test_smoke_avoids_admin_endpoints_and_requires_exact_dispatched_checks() -> None:
    text = workflow_text(SMOKE)

    for forbidden_endpoint in (
        "rules/branches",
        "branches/main/protection",
    ):
        assert forbidden_endpoint not in text

    assert '--arg run_path "/actions/runs/${ci_run_id}/"' in text
    assert '.details_url | contains($run_path)' in text
    assert '.app.slug == "github-actions"' in text
    assert '[[ "${job_count}" -eq 1 ]]' in text
    assert '[[ "${check_count}" -eq 1 ]]' in text
    for check_name in ("Test (ubuntu-24.04)", "Test (macos-14)", "Updater policy"):
        assert check_name in text


def test_readme_documents_smoke_and_ruleset_trust_boundary() -> None:
    text = workflow_text(README)

    assert "exact pull-request head" in text
    assert "authenticated maintainer/admin" in text
    assert 'gh api --paginate --slurp "repos/${repository}/rules/branches/main?per_page=100"' in text
    assert "jq -e" in text
    for check_name in ("Test (ubuntu-24.04)", "Test (macos-14)", "Updater policy"):
        assert check_name in text


def test_independent_janitor_is_guarded_and_deterministic() -> None:
    text = workflow_text(JANITOR)
    trigger_block = text.split("permissions:", 1)[0]

    assert "workflow_run:" in trigger_block
    assert 'workflows: ["Updater CI dispatch smoke"]' in trigger_block
    assert "types: [completed]" in trigger_block
    assert "workflow_dispatch:" in trigger_block
    for forbidden_trigger in ("pull_request_target:", "pull_request:", "push:", "schedule:"):
        assert forbidden_trigger not in trigger_block

    assert "contents: read" in text
    assert "contents: write" in text
    assert "pull-requests: write" in text
    assert "actions: read" in text
    assert "github.event.workflow_run.path == '.github/workflows/updater-ci-dispatch-smoke.yml'" in text
    assert "github.event.workflow_run.event == 'workflow_dispatch'" in text
    assert "github.event.workflow_run.status == 'completed'" in text
    assert "github.event.workflow_run.head_branch == 'main'" in text
    assert "github.event.workflow_run.head_repository.full_name == github.repository" in text
    assert "github.event.workflow_run.name ==" not in text
    assert "AUTO_WORKFLOW_NAME" not in text
    assert 'branch_name="automation/token-pr-smoke-${run_id}-${run_attempt}"' in text
    for guard in (
        'EXPECTED_REPOSITORY="404prefrontalcortexnotfound/decent-curl-impersonate"',
        'EXPECTED_WORKFLOW_PATH=".github/workflows/updater-ci-dispatch-smoke.yml"',
        'actions/workflows/updater-ci-dispatch-smoke.yml',
        "'.workflow_id'",
        '"${run_workflow_id}" == "${expected_workflow_id}"',
        '"${run_event}" == "workflow_dispatch"',
        '"${run_status}" == "completed"',
        '"${head_branch}" == "main"',
    ):
        assert guard in text
    assert 'EXPECTED_WORKFLOW="' not in text
    assert "jq -r '.name'" not in text
    for ownership_guard in (
        'base_sha="$(jq -r \'.head_sha\' <<<"${run_json}")"',
        '[[ "${base_sha}" =~ ^[0-9a-f]{40}$ ]]',
        '.object.sha == $head_sha',
        '.parents | length == 1',
        '.parents[0].sha == $base_sha',
        '.message == "Prove exact-head updater CI dispatch"',
        'compare/${base_sha}...${head_sha}',
        '.files | length == 1',
        '.files[0].filename == "uv.lock"',
        '.files[0].additions == 1',
        '.files[0].deletions == 0',
        "cmp --silent",
        '.head.sha == $head_sha',
        '.merged == false',
        '.merged_at == null',
    ):
        assert ownership_guard in text

    pulls_endpoint = '"repos/${EXPECTED_REPOSITORY}/pulls"'
    pulls_positions = [
        match.start() for match in re.finditer(re.escape(pulls_endpoint), text)
    ]
    assert len(pulls_positions) == 3
    for endpoint_at in pulls_positions:
        command_start = text.rfind("gh api", 0, endpoint_at)
        command_end = text.find(")", endpoint_at)
        command = text[command_start:command_end]
        assert "--paginate" in command
        assert "--slurp" in command
        assert "per_page=100" in command

    assert "matching_count" in text
    assert "Smoke janitor ownership proof succeeded." in text
    proof_end = text.index("Smoke janitor ownership proof succeeded.")
    proof_prefix = text[:proof_end]
    assert "--method PATCH" not in proof_prefix
    assert "--method DELETE" not in proof_prefix
    assert text.index("--method PATCH", proof_end) > proof_end
    assert text.index("--method DELETE", proof_end) > proof_end
    assert "still exists" in text
    assert "actions/checkout" not in text


def test_smoke_has_no_high_risk_side_effects_or_mutable_actions() -> None:
    text = workflow_text(SMOKE) + workflow_text(JANITOR)

    assert not re.search(r"^\s*- uses:\s*[^\s#]+@(?![0-9a-f]{40}(?:\s|$))", text, re.MULTILINE)
    for forbidden in (
        "pull_request_target:",
        "CLAUDE_CODE",
        "ANTHROPIC",
        "--admin",
        "npm publish",
        "git tag",
        "gh release",
    ):
        assert forbidden not in text
