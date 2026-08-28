import os
import plistlib
import shlex
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


def _write_registration_cli(
    path: Path,
    *,
    config_path: str,
    check_output: str,
    fail_on_add: bool = False,
) -> None:
    failure = "exit 42" if fail_on_add else ":"
    path.write_text(
        "#!/bin/sh\n"
        f'config="$HOME/{config_path}"\n'
        'mkdir -p "$(dirname -- "$config")"\n'
        "case ${2:-} in\n"
        "  remove) printf '%s\\n' 'removed decent-curl' >> \"$config\" ;;\n"
        "  add)\n"
        "    printf '%s\\n' 'updated decent-curl' >> \"$config\"\n"
        f"    {failure}\n"
        "    ;;\n"
        "  get|list)\n"
        f"    printf '%s\\n' '{check_output}'\n"
        "    ;;\n"
        "esac\n"
    )
    path.chmod(path.stat().st_mode | stat.S_IXUSR)


def _registration_environment(
    tmp_path: Path, *, fail_agent: str | None = None
) -> tuple[dict[str, str], dict[Path, bytes]]:
    home = tmp_path / "home"
    originals = {
        home / ".claude.json": b'{"unrelated":"claude"}\n',
        home / ".codex/config.toml": b'[unrelated]\nvalue = "codex"\n',
        home / ".grok/config.toml": b'[unrelated]\nvalue = "grok"\n',
    }
    for path, content in originals.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    _write_registration_cli(
        fake_bin / "claude",
        config_path=".claude.json",
        check_output=f"decent-curl: {SERVICE_URL}",
        fail_on_add=fail_agent == "claude",
    )
    _write_registration_cli(
        fake_bin / "codex",
        config_path=".codex/config.toml",
        check_output=f"decent-curl: {SERVICE_URL}",
        fail_on_add=fail_agent == "codex",
    )
    _write_registration_cli(
        fake_bin / "grok",
        config_path=".grok/config.toml",
        check_output=f"decent-curl: {SERVICE_URL}",
        fail_on_add=fail_agent == "grok",
    )
    return (
        {
            **os.environ,
            "HOME": str(home),
            "PATH": f"{fake_bin}:{os.environ['PATH']}",
            "DECENT_CURL_MCP_URL": SERVICE_URL,
        },
        originals,
    )


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
    assert plist["EnvironmentVariables"]["DECENT_CURL_HTTP_PORT"] == "8765"
    assert plist["RunAtLoad"] is True
    assert plist["KeepAlive"] is True
    assert plist["StandardOutPath"] == "/dev/null"
    assert plist["StandardErrorPath"] == "/dev/null"


def test_installer_renders_selected_port_and_check_reports_urls(
    tmp_path: Path,
) -> None:
    home = tmp_path / "home"
    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    launchctl = fake_bin / "launchctl"
    launchctl.write_text(
        "#!/bin/sh\n"
        "state=$HOME/launchctl-loaded\n"
        "case $1 in\n"
        "  print) test -f \"$state\" ;;\n"
        "  bootstrap|kickstart) : > \"$state\" ;;\n"
        "  bootout) rm -f \"$state\" ;;\n"
        "esac\n"
    )
    launchctl.chmod(launchctl.stat().st_mode | stat.S_IXUSR)
    environment = {
        **os.environ,
        "HOME": str(home),
        "PATH": f"{fake_bin}:{os.environ['PATH']}",
        "DECENT_CURL_HTTP_PORT": "9123",
    }

    installed = subprocess.run(
        [str(ROOT / "scripts/install-launch-agent")],
        text=True,
        capture_output=True,
        env=environment,
        check=False,
    )
    checked = subprocess.run(
        [str(ROOT / "scripts/install-launch-agent"), "--check"],
        text=True,
        capture_output=True,
        env=environment,
        check=False,
    )

    assert installed.returncode == 0, installed.stderr
    assert checked.returncode == 0, checked.stderr
    plist_path = home / "Library/LaunchAgents/tech.decent.decent-curl.plist"
    plist = plistlib.loads(plist_path.read_bytes())
    assert plist["EnvironmentVariables"]["DECENT_CURL_HTTP_PORT"] == "9123"
    assert "Effective MCP URL: http://127.0.0.1:9123/mcp" in checked.stdout
    assert "Effective health URL: http://127.0.0.1:9123/healthz" in checked.stdout


def test_installer_rejects_an_invalid_selected_port(tmp_path: Path) -> None:
    result = subprocess.run(
        [str(ROOT / "scripts/install-launch-agent"), "--check"],
        text=True,
        capture_output=True,
        env={
            **os.environ,
            "HOME": str(tmp_path / "home"),
            "DECENT_CURL_HTTP_PORT": "not-a-port",
        },
        check=False,
    )

    assert result.returncode == 64
    assert "DECENT_CURL_HTTP_PORT must be an integer from 1 to 65535" in result.stderr


@pytest.mark.parametrize(
    "script_name", ["install-launch-agent", "run-decent-curl-service"]
)
def test_service_scripts_record_missing_venv_before_exit(
    tmp_path: Path,
    script_name: str,
) -> None:
    repository = tmp_path / "missing venv"
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
    assert startup_log.read_text().splitlines() == [
        f"{script_name}: missing {repository / '.venv/bin/python'}.",
        f"Change directory to: {repository}",
        "Run: uv sync --frozen --python 3.13",
    ]


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
        f"Effective MCP URL: {SERVICE_URL}",
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


def test_registration_derives_default_url_from_selected_port(tmp_path: Path) -> None:
    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    service_url = "http://127.0.0.1:9123/mcp"
    outputs = {
        "claude": f"decent-curl:\n  Type: http\n  URL: {service_url}\n",
        "codex": (
            "decent-curl\n  enabled: true\n  transport: streamable_http\n"
            f"  url: {service_url}\n"
        ),
        "grok": f"  decent-curl: {service_url}\n",
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
            "DECENT_CURL_HTTP_PORT": "9123",
        },
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert result.stdout.splitlines()[0] == f"Effective MCP URL: {service_url}"


def test_registration_rolls_back_all_configs_when_second_agent_fails(
    tmp_path: Path,
) -> None:
    environment, originals = _registration_environment(
        tmp_path, fail_agent="codex"
    )

    result = subprocess.run(
        [str(ROOT / "scripts/register-mcp-service")],
        text=True,
        capture_output=True,
        env=environment,
        check=False,
    )

    assert result.returncode != 0
    for path, content in originals.items():
        assert path.read_bytes() == content


def test_successful_registration_preserves_unrelated_config(tmp_path: Path) -> None:
    environment, originals = _registration_environment(tmp_path)

    result = subprocess.run(
        [str(ROOT / "scripts/register-mcp-service")],
        text=True,
        capture_output=True,
        env=environment,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    for path, content in originals.items():
        updated = path.read_bytes()
        assert updated.startswith(content)
        assert b"updated decent-curl" in updated


def test_registration_dry_run_shell_quotes_the_full_service_url(
    tmp_path: Path,
) -> None:
    environment, _ = _registration_environment(tmp_path)
    service_url = "http://127.0.0.1:8765/mcp?token=one&scope=two"
    environment["DECENT_CURL_MCP_URL"] = service_url

    result = subprocess.run(
        [str(ROOT / "scripts/register-mcp-service"), "--dry-run"],
        text=True,
        capture_output=True,
        env=environment,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    expected = [
        [
            "claude",
            "mcp",
            "add",
            "--transport",
            "http",
            "--scope",
            "user",
            "decent-curl",
            service_url,
        ],
        ["codex", "mcp", "add", "decent-curl", "--url", service_url],
        [
            "grok",
            "mcp",
            "add",
            "--transport",
            "http",
            "--scope",
            "user",
            "decent-curl",
            service_url,
        ],
    ]
    assert result.stdout.splitlines() == [
        f"Effective MCP URL: {service_url}",
        *(shlex.join(command) for command in expected),
    ]
