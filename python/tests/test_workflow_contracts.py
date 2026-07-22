from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[2]
CI = ROOT / ".github/workflows/ci.yml"
SMOKE = ROOT / ".github/workflows/updater-ci-dispatch-smoke.yml"


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


def test_ci_dispatch_is_exact_head_bound_and_fail_closed() -> None:
    text = workflow_text(CI)

    for dispatch_input in ("gate_id:", "pr_number:", "expected_head_sha:", "validation_mode:"):
        assert dispatch_input in text
    assert "run-name:" in text
    assert "name: Updater policy" in text
    assert "EXPECTED_HEAD_SHA" in text
    assert "GITHUB_SHA" in text
    assert "pulls/${PR_NUMBER}" in text
    assert "automation/weekly-curl-cffi" in text
    assert "automation/token-pr-${GATE_ID}" in text

    for allowed_path in (
        "pyproject.toml",
        "uv.lock",
        "upstream/curl_cffi.lock.json",
        "upstream/curl_impersonate.lock.json",
        "THIRD_PARTY_NOTICES.md",
    ):
        assert allowed_path in text


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


def test_smoke_has_no_high_risk_side_effects_or_mutable_actions() -> None:
    text = workflow_text(SMOKE)

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
