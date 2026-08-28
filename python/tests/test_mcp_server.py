import asyncio
import base64
import json

from decent_curl_impersonate.engine import CurlEngine
from decent_curl_impersonate.mcp_server import (
    _TOOLS_BY_NAME,
    _call_tool,
    _public_tools,
)


def test_request_schema_advertises_content_base64() -> None:
    schema = _TOOLS_BY_NAME["decent_curl_request"]["inputSchema"]
    assert "content_base64" in schema["properties"]
    description = next(
        tool["description"]
        for tool in _public_tools()
        if tool["name"] == "decent_curl_request"
    )
    assert "content_base64" in description


def test_mcp_request_sends_binary_body_and_custom_headers(http_server: str) -> None:
    payload = b"PK\x03\x04pptx-bytes"
    result = asyncio.run(
        _call_tool(
            CurlEngine(),
            {
                "name": "decent_curl_request",
                "arguments": {
                    "url": f"{http_server}/echo",
                    "method": "POST",
                    "headers": {
                        "Authorization": "Bearer test-token",
                        "Content-Type": "application/octet-stream",
                        "Import-Metadata": (
                            '{"title_base64":"dGl0bGU=","mime_type":'
                            '"application/vnd.openxmlformats-officedocument.'
                            'presentationml.presentation"}'
                        ),
                    },
                    "content_base64": base64.b64encode(payload).decode("ascii"),
                },
            },
        )
    )

    assert result["isError"] is False
    engine_result = json.loads(result["content"][0]["text"])
    echoed = json.loads(engine_result["body"])
    assert echoed["method"] == "POST"
    assert echoed["headers"]["authorization"] == "Bearer test-token"
    assert echoed["headers"]["content-type"].startswith("application/octet-stream")
    assert echoed["headers"]["import-metadata"].startswith('{"title_base64"')
    assert echoed["body"] == payload.decode("utf-8")
