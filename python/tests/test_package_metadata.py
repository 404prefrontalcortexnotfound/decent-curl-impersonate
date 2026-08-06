import tomllib
from pathlib import Path

import decent_curl_impersonate


def test_python_version_matches_release_metadata() -> None:
    root = Path(__file__).resolve().parents[2]
    metadata = tomllib.loads((root / "pyproject.toml").read_text())

    assert metadata["project"]["version"] == "0.2.2"
    assert decent_curl_impersonate.__version__ == metadata["project"]["version"]
