from __future__ import annotations

import importlib.util
import io
import json
from pathlib import Path
import shutil
import subprocess
import tarfile

import pytest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("updater_metadata", ROOT / "scripts/updater_metadata.py")
assert SPEC and SPEC.loader
metadata = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(metadata)


def archive_with_makefile(text: str) -> bytes:
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w:gz") as tar:
        data = text.encode()
        info = tarfile.TarInfo("curl_cffi-test/Makefile")
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
    return output.getvalue()


def copy_baseline(tmp_path: Path) -> Path:
    candidate = tmp_path / "candidate"
    candidate.mkdir()
    for path in (*metadata.INITIAL_PATHS, *metadata.ENRICHMENT_PATHS):
        target = candidate / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, target)
    return candidate


def bump(candidate: Path, old: str = "0.15.0", new: str = "0.15.1") -> None:
    for path in (candidate / "pyproject.toml", candidate / "uv.lock"):
        path.write_text(path.read_text().replace(old, new), encoding="utf-8")


def test_current_dependency_metadata_is_consistent() -> None:
    result = metadata.verify_consistency(ROOT)
    assert result == {
        "schema_version": 1,
        "candidate_version": "0.15.0",
        "curl_impersonate_version": "1.5.2",
        "bundled_curl_version": "8.15.0",
        "result": "pass",
    }


def test_exact_pin_and_lock_must_change_and_match(tmp_path: Path) -> None:
    candidate = copy_baseline(tmp_path)
    with pytest.raises(metadata.UpdaterError, match="did not change"):
        metadata.verify_initial(ROOT, candidate)
    bump(candidate)
    assert metadata.verify_initial(ROOT, candidate) == "0.15.1"
    candidate.joinpath("uv.lock").write_text(candidate.joinpath("uv.lock").read_text().replace("0.15.1", "0.15.2", 1))
    with pytest.raises(metadata.UpdaterError, match="disagree"):
        metadata.verify_initial(ROOT, candidate)


@pytest.mark.parametrize(
    "text",
    [
        "VERSION := 1.2.3\nVERSION := 1.2.4\nCURL_VERSION := curl-8_15_0\n",
        "export VERSION := 1.2.3\nCURL_VERSION := curl-8_15_0\n",
        "VERSION := 1.2.3\nCURL_VERSION= curl-8_15_0\n",
        "VERSION := x\nCURL_VERSION := curl-main\n",
    ],
)
def test_makefile_assignments_are_exact_unique_and_unmoved(text: str) -> None:
    with pytest.raises(metadata.UpdaterError, match="assignments"):
        metadata.parse_makefile(text)


def test_makefile_and_annotated_or_lightweight_tag_parsing(monkeypatch: pytest.MonkeyPatch) -> None:
    valid = (ROOT / "python/tests/fixtures/updater/metadata/Makefile.valid").read_text()
    assert metadata.parse_makefile(valid) == ("1.5.2", "8.15.0", "8.15.0-IMPERSONATE")
    commit = "a" * 40
    monkeypatch.setattr(metadata, "fetch_json", lambda url: ({"object": {"type": "tag", "sha": "b" * 40}} if "/ref/" in url else {"object": {"type": "commit", "sha": commit}}))
    assert metadata.resolve_tag("owner/repo", "v1") == commit
    monkeypatch.setattr(metadata, "fetch_json", lambda _url: {"object": {"type": "commit", "sha": commit}})
    assert metadata.resolve_tag("owner/repo", "v1") == commit


@pytest.mark.parametrize("payload", [{}, {"info": {"version": "1"}, "urls": []}, {"info": {"version": "1"}, "urls": [{"yanked": True}]}])
def test_missing_or_yanked_exact_pypi_release_blocks(monkeypatch: pytest.MonkeyPatch, payload: dict) -> None:
    monkeypatch.setattr(metadata, "fetch_json", lambda _url: payload)
    with pytest.raises(metadata.UpdaterError):
        metadata.require_pypi_release("1")


def test_sync_is_canonical_idempotent_and_preserves_notice_prose(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    candidate = copy_baseline(tmp_path)
    bump(candidate)
    cffi_archive = archive_with_makefile("VERSION := 1.6.0\nCURL_VERSION := curl-8_16_0\n")
    monkeypatch.setattr(metadata, "require_pypi_release", lambda _version: None)
    monkeypatch.setattr(metadata, "resolve_tag", lambda repo, _tag: ("a" if repo.endswith("curl_cffi") else "b") * 40)
    monkeypatch.setattr(metadata, "archive", lambda repo, tag: (f"https://github.com/{repo}/archive/refs/tags/{tag}.tar.gz", cffi_archive if repo.endswith("curl_cffi") else b"imp", "c" * 64 if repo.endswith("curl_cffi") else "d" * 64))
    before = (candidate / "THIRD_PARTY_NOTICES.md").read_text()
    result = metadata.sync(candidate, "0.15.1", "1" * 40, "2" * 40)
    first = {path: (candidate / path).read_bytes() for path in metadata.ENRICHMENT_PATHS}
    metadata.sync(candidate, "0.15.1", "1" * 40, "2" * 40)
    second = {path: (candidate / path).read_bytes() for path in metadata.ENRICHMENT_PATHS}
    assert first == second
    assert all(value.endswith(b"\n") for value in second.values())
    assert result["candidate_version"] == "0.15.1"
    after = (candidate / "THIRD_PARTY_NOTICES.md").read_text()
    assert before.replace("0.15.0", "0.15.1").split("The MIT license", 1)[1].split("## curl-impersonate", 1)[0] == after.split("The MIT license", 1)[1].split("## curl-impersonate", 1)[0]
    assert metadata.verify_consistency(candidate, ROOT)["result"] == "pass"


def init_git(candidate: Path) -> str:
    subprocess.run(["git", "init", "-q", candidate], check=True)
    subprocess.run(["git", "-C", candidate, "config", "user.email", "test@example.invalid"], check=True)
    subprocess.run(["git", "-C", candidate, "config", "user.name", "test"], check=True)
    subprocess.run(["git", "-C", candidate, "add", "."], check=True)
    subprocess.run(["git", "-C", candidate, "commit", "-qm", "base"], check=True)
    return subprocess.check_output(["git", "-C", candidate, "rev-parse", "HEAD"], text=True).strip()


def test_git_scope_rejects_untracked_mode_binary_delete_and_out_of_scope(tmp_path: Path) -> None:
    candidate = copy_baseline(tmp_path)
    base = init_git(candidate)
    bump(candidate)
    metadata.verify_git_scope(candidate, base, metadata.INITIAL_PATHS)
    candidate.joinpath("escape.txt").write_text("x")
    with pytest.raises(metadata.UpdaterError): metadata.verify_git_scope(candidate, base, metadata.INITIAL_PATHS)
    candidate.joinpath("escape.txt").unlink()
    candidate.joinpath("pyproject.toml").chmod(0o755)
    with pytest.raises(metadata.UpdaterError): metadata.verify_git_scope(candidate, base, metadata.INITIAL_PATHS)
    candidate.joinpath("pyproject.toml").chmod(0o644)
    candidate.joinpath("pyproject.toml").unlink()
    with pytest.raises(metadata.UpdaterError): metadata.verify_git_scope(candidate, base, metadata.INITIAL_PATHS)


def test_notice_prose_edit_is_rejected(tmp_path: Path) -> None:
    candidate = copy_baseline(tmp_path)
    candidate.joinpath("THIRD_PARTY_NOTICES.md").write_text(candidate.joinpath("THIRD_PARTY_NOTICES.md").read_text().replace("provided without warranty", "provided with warranty", 1))
    with pytest.raises(metadata.UpdaterError, match="legal prose"):
        metadata.verify_consistency(candidate, ROOT)
