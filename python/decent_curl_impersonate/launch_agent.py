"""Render and install the decent-curl user LaunchAgent."""

from __future__ import annotations

import argparse
from html import escape
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

LABEL = "tech.decent.decent-curl"
PLIST_NAME = f"{LABEL}.plist"


def render_launch_agent(template_path: Path, repository: Path) -> str:
    """Render a LaunchAgent template for one resolved repository path."""
    resolved_repository = repository.resolve()
    template = template_path.read_text(encoding="utf-8")
    placeholder = "__REPOSITORY_ROOT__"
    if template.count(placeholder) < 2:
        raise ValueError(f"LaunchAgent template must contain {placeholder}")
    return template.replace(placeholder, escape(str(resolved_repository), quote=True))


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


def install_launch_agent(repository: Path, *, check_only: bool = False) -> int:
    """Install or check the user LaunchAgent for a resolved repository."""
    repository = repository.resolve()
    template = repository / "launchd" / f"{PLIST_NAME}.template"
    rendered = render_launch_agent(template, repository)
    launch_agents = Path.home() / "Library" / "LaunchAgents"
    target = launch_agents / PLIST_NAME
    launchctl = _launchctl()
    domain = f"gui/{os.getuid()}"
    service = f"{domain}/{LABEL}"

    current = target.read_text(encoding="utf-8") if target.exists() else None
    loaded = _is_loaded(launchctl, service)
    if check_only:
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
    raise SystemExit(
        install_launch_agent(arguments.repo, check_only=arguments.check)
    )


if __name__ == "__main__":
    main()
