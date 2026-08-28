"""Register the decent-curl HTTP service with supported agent CLIs."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile

from .service_settings import effective_mcp_url


@dataclass(frozen=True)
class _ConfigSnapshot:
    path: Path
    existed: bool
    content: bytes
    mode: int | None

    @classmethod
    def capture(cls, path: Path) -> _ConfigSnapshot:
        if not path.exists():
            return cls(path=path, existed=False, content=b"", mode=None)
        return cls(
            path=path,
            existed=True,
            content=path.read_bytes(),
            mode=path.stat().st_mode & 0o777,
        )

    def restore(self) -> None:
        if not self.existed:
            self.path.unlink(missing_ok=True)
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temporary_name = tempfile.mkstemp(
            dir=self.path.parent,
            prefix=f".{self.path.name}.rollback.",
        )
        temporary_path = Path(temporary_name)
        try:
            with os.fdopen(descriptor, "wb") as output:
                output.write(self.content)
                output.flush()
                os.fsync(output.fileno())
            if self.mode is not None:
                temporary_path.chmod(self.mode)
            os.replace(temporary_path, self.path)
        finally:
            temporary_path.unlink(missing_ok=True)


def _config_snapshots() -> tuple[_ConfigSnapshot, ...]:
    home = Path.home()
    return tuple(
        _ConfigSnapshot.capture(path)
        for path in (
            home / ".claude.json",
            home / ".codex/config.toml",
            home / ".grok/config.toml",
        )
    )


def _restore_all(snapshots: tuple[_ConfigSnapshot, ...]) -> None:
    errors: list[OSError] = []
    for snapshot in snapshots:
        try:
            snapshot.restore()
        except OSError as error:
            errors.append(error)
    if errors:
        raise RuntimeError(
            "failed to restore one or more agent configuration files"
        ) from errors[0]


def _check_agent(label: str, command: list[str], service_url: str) -> bool:
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.returncode == 0 and service_url in result.stdout:
        print(f"{label}: configured")
        return True
    print(f"{label}: not configured")
    return False


def _check_all(service_url: str) -> int:
    states = (
        _check_agent(
            "Claude Code",
            ["claude", "mcp", "get", "decent-curl"],
            service_url,
        ),
        _check_agent("Codex", ["codex", "mcp", "get", "decent-curl"], service_url),
        _check_agent("Grok", ["grok", "mcp", "list"], service_url),
    )
    return 0 if all(states) else 1


def main() -> None:
    parser = argparse.ArgumentParser(description="Register the decent-curl MCP service.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--dry-run", action="store_true")
    arguments = parser.parse_args()

    try:
        service_url = effective_mcp_url(os.environ)
    except ValueError as error:
        print(f"register-mcp-service: {error}", file=sys.stderr)
        raise SystemExit(64) from None
    print(f"Effective MCP URL: {service_url}")

    if arguments.check:
        raise SystemExit(_check_all(service_url))

    for command_name in ("claude", "codex", "grok"):
        if shutil.which(command_name) is None:
            print(f"register-mcp-service: missing {command_name}", file=sys.stderr)
            raise SystemExit(69)

    commands = [
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
    if arguments.dry_run:
        for command in commands:
            print(shlex.join(command))
        return

    snapshots = _config_snapshots()
    try:
        subprocess.run(
            ["claude", "mcp", "remove", "--scope", "user", "decent-curl"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        for command in commands:
            subprocess.run(command, check=True)
        if _check_all(service_url) != 0:
            raise RuntimeError("registration check failed")
    except BaseException as error:
        try:
            _restore_all(snapshots)
        except RuntimeError as rollback_error:
            print(f"register-mcp-service: {rollback_error}", file=sys.stderr)
            raise SystemExit(74) from None
        if isinstance(error, KeyboardInterrupt | SystemExit):
            raise
        print(
            "register-mcp-service: update failed; restored all agent configs",
            file=sys.stderr,
        )
        if (
            isinstance(error, subprocess.CalledProcessError)
            and 1 <= error.returncode <= 125
        ):
            raise SystemExit(error.returncode) from None
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
