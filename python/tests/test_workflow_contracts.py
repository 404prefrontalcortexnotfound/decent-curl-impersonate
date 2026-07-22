from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[2]
CI = ROOT / ".github/workflows/ci.yml"
SMOKE = ROOT / ".github/workflows/updater-ci-dispatch-smoke.yml"
JANITOR = ROOT / ".github/workflows/updater-ci-dispatch-smoke-cleanup.yml"
README = ROOT / "README.md"


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


def test_ci_dispatch_is_smoke_only_exact_head_bound_and_fail_closed() -> None:
    text = workflow_text(CI)

    for dispatch_input in ("gate_id:", "pr_number:", "expected_head_sha:", "validation_mode:"):
        assert dispatch_input in text
    assert "run-name:" in text
    assert "name: Updater policy" in text
    assert "EXPECTED_HEAD_SHA" in text
    assert "GITHUB_SHA" in text
    assert "pulls/${PR_NUMBER}" in text
    assert "automation/token-pr-${GATE_ID}" in text
    assert "options:\n          - smoke" in text
    assert '[[ "${VALIDATION_MODE}" == "smoke" ]]' in text

    for future_stage_value in (
        "- updater",
        "automation/weekly-curl-cffi",
        "pyproject.toml",
        "upstream/curl_cffi.lock.json",
        "upstream/curl_impersonate.lock.json",
        "THIRD_PARTY_NOTICES.md",
        "ALLOWED_PATHS",
    ):
        assert future_stage_value not in text

    assert '[[ "${changed_count}" -eq 1 ]]' in text
    assert '.[0].filename' in text and '== "uv.lock"' in text
    assert '.[0].status' in text and '== "modified"' in text
    assert '.[0].additions' in text and '-eq 1' in text
    assert '.[0].deletions' in text and '-eq 0' in text
    assert "cmp --silent" in text


def test_touched_ci_actions_are_immutable() -> None:
    text = workflow_text(CI)
    uses = re.findall(r"^\s*- uses:\s*([^\s#]+)", text, flags=re.MULTILINE)

    assert uses
    for action in uses:
        assert re.search(r"@[0-9a-f]{40}$", action), action


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
