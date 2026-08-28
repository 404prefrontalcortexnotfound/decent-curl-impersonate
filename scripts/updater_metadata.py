#!/usr/bin/env python3
"""Trusted curl-cffi updater metadata synchronizer and verifier.

This module intentionally uses only the Python standard library.  It accepts an
exact version selected by Dependabot; it never searches for a newer release.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tarfile
import time
import tomllib
from typing import Any
import urllib.error
import urllib.request

SCHEMA_VERSION = 1
INITIAL_PATHS = ("pyproject.toml", "uv.lock")
ENRICHMENT_PATHS = (
    "upstream/curl_cffi.lock.json",
    "upstream/curl_impersonate.lock.json",
    "THIRD_PARTY_NOTICES.md",
)
FINAL_PATHS = tuple(sorted(INITIAL_PATHS + ENRICHMENT_PATHS))
REPOSITORY = "404prefrontalcortexnotfound/decent-curl-impersonate"
MAX_JSON_BYTES = 4 * 1024 * 1024
MAX_ARCHIVE_BYTES = 64 * 1024 * 1024
HEX40 = re.compile(r"^[0-9a-f]{40}$")
VERSION = re.compile(r"^[0-9]+(?:\.[0-9]+)+(?:[A-Za-z0-9.+-]*)?$")


class UpdaterError(RuntimeError):
    """A public, categorized fail-closed updater error."""

    def __init__(self, category: str, message: str):
        super().__init__(message)
        self.category = category


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=False) + "\n").encode()


def load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise UpdaterError("metadata", f"invalid JSON: {path.name}") from exc
    if not isinstance(value, dict):
        raise UpdaterError("metadata", f"expected object: {path.name}")
    return value


def exact_pin(pyproject: Path) -> str:
    try:
        doc = tomllib.loads(pyproject.read_text(encoding="utf-8"))
        deps = doc["project"]["dependencies"]
    except (OSError, UnicodeError, tomllib.TOMLDecodeError, KeyError, TypeError) as exc:
        raise UpdaterError("pin", "invalid pyproject.toml") from exc
    matches = []
    for dep in deps:
        match = re.fullmatch(r"curl-cffi==([^\s;]+)", dep)
        if match:
            matches.append(match.group(1))
        elif re.match(r"curl[-_]cffi\b", dep, re.IGNORECASE):
            raise UpdaterError("pin", "curl-cffi requirement is not one exact pin")
    if len(matches) != 1 or not VERSION.fullmatch(matches[0]):
        raise UpdaterError("pin", "expected exactly one normalized curl-cffi pin")
    return matches[0]


def lock_version(lock_path: Path) -> str:
    try:
        doc = tomllib.loads(lock_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, tomllib.TOMLDecodeError) as exc:
        raise UpdaterError("lock", "invalid uv.lock") from exc
    packages = doc.get("package")
    if not isinstance(packages, list):
        raise UpdaterError("lock", "uv.lock packages missing")
    curl = [p for p in packages if isinstance(p, dict) and p.get("name") == "curl-cffi"]
    root = [p for p in packages if isinstance(p, dict) and p.get("name") == "decent-curl-impersonate"]
    if len(curl) != 1 or len(root) != 1 or not isinstance(curl[0].get("version"), str):
        raise UpdaterError("lock", "uv.lock curl-cffi/root package mismatch")
    requires = root[0].get("metadata", {}).get("requires-dist", [])
    exact = [r for r in requires if isinstance(r, dict) and r.get("name") == "curl-cffi"]
    if len(exact) != 1 or exact[0].get("specifier") != f"=={curl[0]['version']}":
        raise UpdaterError("lock", "uv.lock package and direct requirement disagree")
    return curl[0]["version"]


def _run_git(candidate: Path, *args: str) -> str:
    proc = subprocess.run(
        ["git", "-c", "core.hooksPath=/dev/null", "-C", str(candidate), *args],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=30,
        check=False,
        env={**os.environ, "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_NOSYSTEM": "1"},
    )
    if proc.returncode:
        raise UpdaterError("git", "git evidence command failed")
    return proc.stdout


def verify_git_scope(candidate: Path, base_sha: str, allowed: tuple[str, ...]) -> None:
    if not HEX40.fullmatch(base_sha):
        raise UpdaterError("git", "invalid base SHA")
    status = _run_git(candidate, "status", "--porcelain=v1", "--untracked-files=all")
    for line in status.splitlines():
        code, path = line[:2], line[3:]
        if code == "??" or path not in allowed:
            raise UpdaterError("scope", "untracked, staged, or out-of-scope path")
    names = _run_git(candidate, "diff", "--name-status", "--no-renames", base_sha, "--")
    observed: list[str] = []
    for line in names.splitlines():
        fields = line.split("\t")
        if len(fields) != 2 or fields[0] != "M" or fields[1] not in allowed:
            raise UpdaterError("scope", "only regular modified allowlisted files are permitted")
        observed.append(fields[1])
    if sorted(observed) != sorted(allowed):
        raise UpdaterError("scope", "changed path set is not exact")
    raw = _run_git(candidate, "diff", "--raw", "--no-renames", base_sha, "--")
    for line in raw.splitlines():
        match = re.match(r"^:100644 100644 [0-9a-f]+ [0-9a-f]+ M\t(.+)$", line)
        if not match or match.group(1) not in allowed:
            raise UpdaterError("scope", "mode, type, rename, copy, or symlink change rejected")
    numstat = _run_git(candidate, "diff", "--numstat", base_sha, "--")
    if any(line.startswith("-\t-\t") for line in numstat.splitlines()):
        raise UpdaterError("scope", "binary patch rejected")


def verify_initial(base_dir: Path, candidate_dir: Path, base_sha: str | None = None) -> str:
    old = exact_pin(base_dir / "pyproject.toml")
    new = exact_pin(candidate_dir / "pyproject.toml")
    locked = lock_version(candidate_dir / "uv.lock")
    if old == new:
        raise UpdaterError("pin", "candidate pin did not change")
    if new != locked:
        raise UpdaterError("lock", "candidate pin and uv.lock disagree")
    if base_sha:
        verify_git_scope(candidate_dir, base_sha, INITIAL_PATHS)
        # Dependabot may update transitive artifacts, but not unrelated direct requirements.
        base_lock = tomllib.loads((base_dir / "uv.lock").read_text(encoding="utf-8"))
        new_lock = tomllib.loads((candidate_dir / "uv.lock").read_text(encoding="utf-8"))
        base_root = next(p for p in base_lock["package"] if p.get("name") == "decent-curl-impersonate")
        new_root = next(p for p in new_lock["package"] if p.get("name") == "decent-curl-impersonate")
        if base_root.get("metadata", {}).get("requires-dev") != new_root.get("metadata", {}).get("requires-dev"):
            raise UpdaterError("lock", "unrelated direct lock requirements changed")
    return new


def fetch(url: str, max_bytes: int, accept: str = "application/json") -> bytes:
    last: Exception | None = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(
                url,
                headers={"Accept": accept, "User-Agent": f"{REPOSITORY} updater/1"},
            )
            with urllib.request.urlopen(request, timeout=20) as response:
                length = response.headers.get("Content-Length")
                if length and int(length) > max_bytes:
                    raise UpdaterError("provider", "provider response too large")
                data = response.read(max_bytes + 1)
                if len(data) > max_bytes:
                    raise UpdaterError("provider", "provider response too large")
                return data
        except UpdaterError:
            raise
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            last = exc
            if attempt < 2:
                time.sleep(1 << attempt)
    raise UpdaterError("provider", "provider transport failure") from last


def fetch_json(url: str) -> dict[str, Any]:
    try:
        value = json.loads(fetch(url, MAX_JSON_BYTES))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise UpdaterError("provider", "provider returned malformed JSON") from exc
    if not isinstance(value, dict):
        raise UpdaterError("provider", "provider JSON is not an object")
    return value


def resolve_tag(repo: str, tag: str) -> str:
    ref = fetch_json(f"https://api.github.com/repos/{repo}/git/ref/tags/{tag}")
    obj = ref.get("object")
    if not isinstance(obj, dict) or obj.get("type") not in {"commit", "tag"}:
        raise UpdaterError("tag", "tag ref malformed or absent")
    if obj["type"] == "tag":
        tag_obj = fetch_json(f"https://api.github.com/repos/{repo}/git/tags/{obj.get('sha', '')}")
        obj = tag_obj.get("object")
    if not isinstance(obj, dict) or obj.get("type") != "commit" or not HEX40.fullmatch(str(obj.get("sha", ""))):
        raise UpdaterError("tag", "tag does not resolve to one immutable commit")
    return str(obj["sha"])


def archive(repo: str, tag: str) -> tuple[str, bytes, str]:
    url = f"https://github.com/{repo}/archive/refs/tags/{tag}.tar.gz"
    body = fetch(url, MAX_ARCHIVE_BYTES, "application/octet-stream")
    return url, body, hashlib.sha256(body).hexdigest()


def makefile_from_archive(body: bytes) -> str:
    try:
        with tarfile.open(fileobj=io.BytesIO(body), mode="r:gz") as tar:
            members = [m for m in tar.getmembers() if m.isfile() and m.name.count("/") == 1 and m.name.endswith("/Makefile")]
            if len(members) != 1:
                raise UpdaterError("makefile", "expected exactly one root Makefile")
            handle = tar.extractfile(members[0])
            if handle is None:
                raise UpdaterError("makefile", "Makefile unavailable")
            data = handle.read(256 * 1024 + 1)
            if len(data) > 256 * 1024:
                raise UpdaterError("makefile", "Makefile too large")
            return data.decode("utf-8")
    except (tarfile.TarError, UnicodeError) as exc:
        raise UpdaterError("makefile", "invalid source archive") from exc


def parse_makefile(text: str) -> tuple[str, str, str]:
    impersonate = re.findall(r"(?m)^VERSION := ([0-9]+(?:\.[0-9]+)+)$", text)
    curl_tokens = re.findall(r"(?m)^CURL_VERSION := curl-([0-9]+(?:_[0-9]+)+)$", text)
    if len(impersonate) != 1 or len(curl_tokens) != 1:
        raise UpdaterError("makefile", "supported version assignments missing, duplicated, or moved")
    curl = curl_tokens[0].replace("_", ".")
    return impersonate[0], curl, f"{curl}-IMPERSONATE"


def require_pypi_release(version: str) -> None:
    data = fetch_json(f"https://pypi.org/pypi/curl-cffi/{version}/json")
    if data.get("info", {}).get("version") != version:
        raise UpdaterError("pypi", "exact PyPI release missing")
    urls = data.get("urls")
    if not isinstance(urls, list) or not urls:
        raise UpdaterError("pypi", "exact PyPI release has no artifacts")
    if not any(isinstance(item, dict) and item.get("yanked") is False for item in urls):
        raise UpdaterError("pypi", "exact PyPI release has no non-yanked artifact")


def substitute_notice(base: str, old_cffi: str, old_imp: str, old_curl: str, new_cffi: str, new_imp: str, new_curl: str) -> str:
    replacements = (
        (f"- Version: {old_cffi}", f"- Version: {new_cffi}"),
        (f"curl_cffi/blob/v{old_cffi}/LICENSE", f"curl_cffi/blob/v{new_cffi}/LICENSE"),
        (f"- Version used to build curl_cffi {old_cffi}: lexiforest fork {old_imp}", f"- Version used to build curl_cffi {new_cffi}: lexiforest fork {new_imp}"),
        (f"curl-impersonate/blob/v{old_imp}/LICENSE", f"curl-impersonate/blob/v{new_imp}/LICENSE"),
        (f"- Bundled version reported by the pinned wheel: curl/libcurl {old_curl}-IMPERSONATE", f"- Bundled version reported by the pinned wheel: curl/libcurl {new_curl}-IMPERSONATE"),
        (f"curl/blob/curl-{old_curl.replace('.', '_')}/COPYING", f"curl/blob/curl-{new_curl.replace('.', '_')}/COPYING"),
    )
    result = base
    for old, new in replacements:
        if result.count(old) != 1:
            raise UpdaterError("notice", "notice version-coupled line missing or duplicated")
        result = result.replace(old, new)
    return result.rstrip("\n") + "\n"


def sync(candidate: Path, version: str, base_sha: str, expected_head: str) -> dict[str, Any]:
    if not VERSION.fullmatch(version) or not HEX40.fullmatch(base_sha) or not HEX40.fullmatch(expected_head):
        raise UpdaterError("input", "invalid exact version or SHA")
    if exact_pin(candidate / "pyproject.toml") != version or lock_version(candidate / "uv.lock") != version:
        raise UpdaterError("lock", "requested exact version does not match candidate")
    require_pypi_release(version)
    cffi_tag = f"v{version}"
    cffi_commit = resolve_tag("lexiforest/curl_cffi", cffi_tag)
    cffi_url, cffi_bytes, cffi_hash = archive("lexiforest/curl_cffi", cffi_tag)
    imp_version, curl_version, bundled = parse_makefile(makefile_from_archive(cffi_bytes))
    imp_tag = f"v{imp_version}"
    imp_commit = resolve_tag("lexiforest/curl-impersonate", imp_tag)
    imp_url, _imp_bytes, imp_hash = archive("lexiforest/curl-impersonate", imp_tag)

    old_cffi = load_json(candidate / "upstream/curl_cffi.lock.json")
    old_imp = load_json(candidate / "upstream/curl_impersonate.lock.json")
    notice_path = candidate / "THIRD_PARTY_NOTICES.md"
    notice = substitute_notice(
        notice_path.read_text(encoding="utf-8"),
        str(old_cffi["version"]), str(old_imp["version"]), str(old_imp["curl_version"]),
        version, imp_version, curl_version,
    )
    cffi_lock = {
        "schema_version": 1,
        "name": "curl_cffi",
        "version": version,
        "repository": "https://github.com/lexiforest/curl_cffi",
        "tag": cffi_tag,
        "commit": cffi_commit,
        "archive": cffi_url,
        "archive_sha256": cffi_hash,
        "python_requirement": f"curl-cffi=={version}",
        "bundled_libcurl_version": bundled,
        "locked_by": "Dependabot uv exact pin; trusted scripts/updater_metadata.py",
    }
    imp_lock = {
        "schema_version": 1,
        "name": "curl-impersonate",
        "version": imp_version,
        "repository": "https://github.com/lexiforest/curl-impersonate",
        "tag": imp_tag,
        "commit": imp_commit,
        "archive": imp_url,
        "archive_sha256": imp_hash,
        "locked_by": f"curl_cffi v{version} Makefile",
        "curl_version": curl_version,
    }
    (candidate / "upstream/curl_cffi.lock.json").write_bytes(canonical_json(cffi_lock))
    (candidate / "upstream/curl_impersonate.lock.json").write_bytes(canonical_json(imp_lock))
    notice_path.write_text(notice, encoding="utf-8", newline="\n")
    return {
        "schema_version": SCHEMA_VERSION,
        "candidate_version": version,
        "curl_cffi_commit": cffi_commit,
        "curl_cffi_archive_sha256": cffi_hash,
        "curl_impersonate_version": imp_version,
        "curl_impersonate_commit": imp_commit,
        "curl_impersonate_archive_sha256": imp_hash,
        "bundled_curl_version": curl_version,
        "base_sha": base_sha,
        "head_sha": expected_head,
        "result": "pass",
    }


def verify_consistency(candidate: Path, base_dir: Path | None = None) -> dict[str, Any]:
    version = exact_pin(candidate / "pyproject.toml")
    if lock_version(candidate / "uv.lock") != version:
        raise UpdaterError("lock", "pin/lock mismatch")
    cffi = load_json(candidate / "upstream/curl_cffi.lock.json")
    imp = load_json(candidate / "upstream/curl_impersonate.lock.json")
    required_cffi = {
        "schema_version": 1, "name": "curl_cffi", "version": version,
        "repository": "https://github.com/lexiforest/curl_cffi", "tag": f"v{version}",
        "archive": f"https://github.com/lexiforest/curl_cffi/archive/refs/tags/v{version}.tar.gz",
        "python_requirement": f"curl-cffi=={version}",
    }
    for key, expected in required_cffi.items():
        if cffi.get(key) != expected:
            raise UpdaterError("metadata", f"curl_cffi lock mismatch: {key}")
    for obj in (cffi, imp):
        if not HEX40.fullmatch(str(obj.get("commit", ""))) or not re.fullmatch(r"[0-9a-f]{64}", str(obj.get("archive_sha256", ""))):
            raise UpdaterError("metadata", "lock commit/hash malformed")
    if imp.get("schema_version") != 1 or imp.get("name") != "curl-impersonate" or imp.get("tag") != f"v{imp.get('version')}":
        raise UpdaterError("metadata", "curl-impersonate lock mismatch")
    if imp.get("archive") != f"https://github.com/lexiforest/curl-impersonate/archive/refs/tags/v{imp.get('version')}.tar.gz":
        raise UpdaterError("metadata", "curl-impersonate archive mismatch")
    if imp.get("locked_by") != f"curl_cffi v{version} Makefile":
        raise UpdaterError("metadata", "provenance mismatch")
    if cffi.get("bundled_libcurl_version") != f"{imp.get('curl_version')}-IMPERSONATE":
        raise UpdaterError("metadata", "bundled curl mismatch")
    notice = (candidate / "THIRD_PARTY_NOTICES.md").read_text(encoding="utf-8")
    expected_fragments = (
        f"- Version: {version}", f"curl_cffi/blob/v{version}/LICENSE",
        f"curl_cffi {version}: lexiforest fork {imp['version']}",
        f"curl-impersonate/blob/v{imp['version']}/LICENSE",
        f"curl/libcurl {imp['curl_version']}-IMPERSONATE",
        f"curl/blob/curl-{str(imp['curl_version']).replace('.', '_')}/COPYING",
    )
    if not notice.endswith("\n") or any(notice.count(fragment) != 1 for fragment in expected_fragments):
        raise UpdaterError("notice", "notice invariant mismatch")
    if base_dir and base_dir.resolve() != candidate.resolve():
        base_cffi = load_json(base_dir / "upstream/curl_cffi.lock.json")
        base_imp = load_json(base_dir / "upstream/curl_impersonate.lock.json")
        expected_notice = substitute_notice(
            (base_dir / "THIRD_PARTY_NOTICES.md").read_text(encoding="utf-8"),
            str(base_cffi["version"]), str(base_imp["version"]), str(base_imp["curl_version"]),
            version, str(imp["version"]), str(imp["curl_version"]),
        )
        if notice != expected_notice:
            raise UpdaterError("notice", "non-mechanical legal prose drift")
    for path in ENRICHMENT_PATHS[:2]:
        if not (candidate / path).read_bytes().endswith(b"\n"):
            raise UpdaterError("metadata", "non-canonical file ending")
    return {
        "schema_version": 1,
        "candidate_version": version,
        "curl_impersonate_version": imp["version"],
        "bundled_curl_version": imp["curl_version"],
        "result": "pass",
    }


def runtime_report(candidate: Path, python_executable: str) -> dict[str, Any]:
    expected = verify_consistency(candidate)
    code = "import json,curl_cffi; from curl_cffi import requests; print(json.dumps({'version':curl_cffi.__version__,'curl':requests.Session().curl.version().decode(errors='replace'),'profiles':[str(x) for x in requests.impersonate.BrowserType]}))"
    proc = subprocess.run([python_executable, "-c", code], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30, check=False)
    if proc.returncode:
        raise UpdaterError("runtime", "runtime probe failed")
    try:
        observed = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise UpdaterError("runtime", "runtime probe returned malformed JSON") from exc
    cffi = load_json(candidate / "upstream/curl_cffi.lock.json")
    if observed.get("version") != cffi["version"] or cffi["bundled_libcurl_version"] not in observed.get("curl", "") or not observed.get("profiles"):
        raise UpdaterError("runtime", "runtime does not match trusted locks")
    return {**expected, "runtime_version": observed["version"], "profiles_count": len(observed["profiles"])}


def emit(value: dict[str, Any], path: str | None) -> None:
    data = canonical_json(value)
    if path:
        Path(path).write_bytes(data)
    else:
        sys.stdout.buffer.write(data)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    initial = sub.add_parser("verify-initial")
    initial.add_argument("--base-dir", type=Path, required=True)
    initial.add_argument("--candidate-dir", type=Path, required=True)
    initial.add_argument("--base-sha")
    initial.add_argument("--output")
    sync_p = sub.add_parser("sync")
    sync_p.add_argument("--candidate-dir", type=Path, required=True)
    sync_p.add_argument("--version", required=True)
    sync_p.add_argument("--base-sha", required=True)
    sync_p.add_argument("--expected-head-sha", required=True)
    sync_p.add_argument("--output")
    final = sub.add_parser("verify-final")
    final.add_argument("--base-dir", type=Path)
    final.add_argument("--candidate-dir", type=Path, required=True)
    final.add_argument("--base-sha")
    final.add_argument("--output")
    runtime = sub.add_parser("runtime-report")
    runtime.add_argument("--candidate-dir", type=Path, required=True)
    runtime.add_argument("--python-executable", required=True)
    runtime.add_argument("--output")
    args = parser.parse_args(argv)
    try:
        if args.command == "verify-initial":
            version = verify_initial(args.base_dir, args.candidate_dir, args.base_sha)
            emit({"schema_version": 1, "candidate_version": version, "result": "pass"}, args.output)
        elif args.command == "sync":
            emit(sync(args.candidate_dir, args.version, args.base_sha, args.expected_head_sha), args.output)
        elif args.command == "verify-final":
            result = verify_consistency(args.candidate_dir, args.base_dir)
            if args.base_sha:
                verify_git_scope(args.candidate_dir, args.base_sha, FINAL_PATHS)
            emit(result, args.output)
        else:
            emit(runtime_report(args.candidate_dir, args.python_executable), args.output)
        return 0
    except UpdaterError as exc:
        emit({"schema_version": 1, "result": "fail", "failure_category": exc.category}, getattr(args, "output", None))
        print(f"updater metadata blocked: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
