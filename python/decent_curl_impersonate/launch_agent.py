"""Render and install the decent-curl user LaunchAgent."""

from __future__ import annotations

import argparse
from html import escape
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from .service_settings import DEFAULT_PORT, service_urls, validate_port

LABEL = "tech.decent.decent-curl"
PLIST_NAME = f"{LABEL}.plist"


def render_launch_agent(
    template_path: Path, repository: Path, port: int = DEFAULT_PORT
) -> str:
    """Render a LaunchAgent template for one resolved repository path."""
    resolved_repository = repository.resolve()
    template = template_path.read_text(encoding="utf-8")
    placeholder = "__REPOSITORY_ROOT__"
    if template.count(placeholder) < 2:
        raise ValueError(f"LaunchAgent template must contain {placeholder}")
    rendered = template.replace(
        placeholder, escape(str(resolved_repository), quote=True)
    )
    port_placeholder = "__HTTP_PORT__"
    if rendered.count(port_placeholder) != 1:
        raise ValueError(f"LaunchAgent template must contain one {port_placeholder}")
    return rendered.replace(port_placeholder, str(validate_port(port)))


def _launchctl() -> str:
    executable = shutil.which("launchctl")
    if executable is None:
        raise RuntimeError("launchctl is required on macOS")
    return executable


def _is_loaded(launchctl: str, service: str) -> bool:
    result = subprocess.run(
        [launchctl, "print", service],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.returncode == 0


def install_launch_agent(
    repository: Path,
    *,
    port: int = DEFAULT_PORT,
    check_only: bool = False,
) -> int:
    """Install or check the user LaunchAgent for a resolved repository."""
    repository = repository.resolve()
    template = repository / "launchd" / f"{PLIST_NAME}.template"
    port = validate_port(port)
    rendered = render_launch_agent(template, repository, port)
    launch_agents = Path.home() / "Library" / "LaunchAgents"
    target = launch_agents / PLIST_NAME
    launchctl = _launchctl()
    domain = f"gui/{os.getuid()}"
    service = f"{domain}/{LABEL}"

    current = target.read_text(encoding="utf-8") if target.exists() else None
    loaded = _is_loaded(launchctl, service)
    if check_only:
        mcp_url, health_url = service_urls(port)
        print(f"Effective MCP URL: {mcp_url}")
        print(f"Effective health URL: {health_url}")
        if current == rendered and loaded:
            print(f"{LABEL}: installed and loaded")
            return 0
        print(f"{LABEL}: installation differs or is not loaded")
        return 1

    launch_agents.mkdir(parents=True, exist_ok=True)
    changed = current != rendered
    if changed:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            dir=launch_agents,
            prefix=f".{PLIST_NAME}.",
            delete=False,
        ) as temporary:
            temporary.write(rendered)
            temporary_path = Path(temporary.name)
        temporary_path.chmod(0o600)
        os.replace(temporary_path, target)

    if loaded and changed:
        subprocess.run([launchctl, "bootout", service], check=True)
        loaded = False
    if loaded:
        subprocess.run([launchctl, "kickstart", "-k", service], check=True)
    else:
        subprocess.run([launchctl, "bootstrap", domain, str(target)], check=True)
    print(f"{LABEL}: installed from {repository}")
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Install the decent-curl LaunchAgent.")
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    arguments = parser.parse_args()
    try:
        port = validate_port(os.environ.get("DECENT_CURL_HTTP_PORT"))
    except ValueError as error:
        print(f"install-launch-agent: {error}", file=sys.stderr)
        raise SystemExit(64) from None
    raise SystemExit(
        install_launch_agent(arguments.repo, port=port, check_only=arguments.check)
    )


if __name__ == "__main__":
    main()
