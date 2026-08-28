import os
import plistlib
import stat
import subprocess
from pathlib import Path

import pytest

from decent_curl_impersonate.launch_agent import (
    LABEL,
    render_launch_agent,
)

ROOT = Path(__file__).resolve().parents[2]
SERVICE_URL = "http://127.0.0.1:8765/mcp"


def test_launch_agent_renderer_uses_selected_repository(tmp_path: Path) -> None:
    repository = tmp_path / "repo & checkout"
    repository.mkdir()
    rendered = render_launch_agent(
        ROOT / "launchd/tech.decent.decent-curl.plist.template",
        repository,
    )
    plist = plistlib.loads(rendered.encode())

    assert plist["Label"] == LABEL
    assert plist["ProgramArguments"] == [
        str(repository / "scripts/run-decent-curl-service"),
        "--repo",
        str(repository),
    ]
    assert plist["WorkingDirectory"] == str(repository)
    assert plist["RunAtLoad"] is True
    assert plist["KeepAlive"] is True
    assert plist["StandardOutPath"] == "/dev/null"
    assert plist["StandardErrorPath"] == "/dev/null"


@pytest.mark.parametrize(
    "script_name", ["install-launch-agent", "run-decent-curl-service"]
)
def test_service_scripts_record_missing_venv_before_exit(
    tmp_path: Path,
    script_name: str,
) -> None:
    repository = tmp_path / "missing-venv"
    repository.mkdir()
    home = tmp_path / "home"
    result = subprocess.run(
        [str(ROOT / "scripts" / script_name), "--repo", str(repository)],
        text=True,
        capture_output=True,
        env={**os.environ, "HOME": str(home)},
        check=False,
    )

    assert result.returncode == 78
    startup_log = home / "Library/Logs/decent-curl/startup.log"
    assert startup_log.exists()
    assert ".venv/bin/python" in startup_log.read_text()
    assert str(repository) in startup_log.read_text()


def test_registration_check_mode_accepts_all_three_http_entries(
    tmp_path: Path,
) -> None:
    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    outputs = {
        "claude": f"decent-curl:\n  Type: http\n  URL: {SERVICE_URL}\n",
        "codex": (
            "decent-curl\n  enabled: true\n  transport: streamable_http\n"
            f"  url: {SERVICE_URL}\n"
        ),
        "grok": f"  decent-curl: {SERVICE_URL}\n",
    }
    for name, output in outputs.items():
        executable = fake_bin / name
        executable.write_text(f"#!/bin/sh\nprintf '%s' '{output}'\n")
        executable.chmod(executable.stat().st_mode | stat.S_IXUSR)

    result = subprocess.run(
        [str(ROOT / "scripts/register-mcp-service"), "--check"],
        text=True,
        capture_output=True,
        env={
            **os.environ,
            "PATH": f"{fake_bin}:{os.environ['PATH']}",
            "DECENT_CURL_MCP_URL": SERVICE_URL,
        },
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert result.stdout.splitlines() == [
        "Claude Code: configured",
        "Codex: configured",
        "Grok: configured",
    ]


def test_registration_check_mode_reports_a_mismatch(tmp_path: Path) -> None:
    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    for name in ("claude", "codex", "grok"):
        executable = fake_bin / name
        executable.write_text("#!/bin/sh\nprintf '%s\\n' 'not configured'\n")
        executable.chmod(executable.stat().st_mode | stat.S_IXUSR)

    result = subprocess.run(
        [str(ROOT / "scripts/register-mcp-service"), "--check"],
        text=True,
        capture_output=True,
        env={
            **os.environ,
            "PATH": f"{fake_bin}:{os.environ['PATH']}",
            "DECENT_CURL_MCP_URL": SERVICE_URL,
        },
        check=False,
    )

    assert result.returncode == 1
    assert "Claude Code: not configured" in result.stdout
    assert "Codex: not configured" in result.stdout
    assert "Grok: not configured" in result.stdout
