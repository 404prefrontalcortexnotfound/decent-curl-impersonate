import asyncio
import base64
from unittest.mock import AsyncMock

import pytest
from starlette.testclient import TestClient

from decent_curl_impersonate.fetch_api import FetchAPI, classify, public_url
from decent_curl_impersonate.http_server import create_app
from decent_curl_impersonate.service_settings import settings_from_environment

URL = 'https://example.com/science-improves-mental-health'
ARTICLE = '<html><title>Science improves mental health</title><article>' + ''.join('<p>Science improves mental health because researchers test their ideas carefully. New research explains the methods and results for readers. ' * 4 + '</p>' for _ in range(4)) + '</article></html>'


def response(body=ARTICLE, status=200, content_type='text/html', url=URL):
    return dict(status=status, body=body, body_encoding='utf-8', headers={'content-type': content_type}, url=url, http_version='2')


def test_labels_require_article_evidence():
    assert classify(response(), URL) == ('ok', None)
    assert classify(response('<title>Science improves mental health</title><nav>Home</nav>'), URL)[0] == 'blocked'
    assert classify(response('<title>Just a moment</title>cf-chl-'), URL)[0] == 'challenge'
    assert classify(response(ARTICLE + 'subscribe to continue reading'), URL)[0] == 'paywall'
    assert classify(response('accept cookies to continue'), URL)[0] == 'cookie_wall'
    assert classify(response('sign in', url='https://example.com/login'), URL)[0] == 'login'
    assert classify(response(status=404), URL)[0] == 'not_found'
    assert classify(response('%PDF', content_type='application/pdf'), URL)[0] == 'binary'


def test_url_upgrade_and_credentials_rejected():
    assert public_url('http://example.com:80/article') == ('https://example.com/article', True)
    for url in ['file:///etc/passwd', 'https://user:pass@example.com', 'https://example.com:123']:
        with pytest.raises(ValueError):
            public_url(url)


def test_container_auth_and_no_mcp():
    with pytest.raises(ValueError):
        settings_from_environment({'DECENT_CURL_CONTAINER': '1'})
    assert settings_from_environment({'DECENT_CURL_CONTAINER': '1', 'DECENT_CURL_FETCH_TOKEN': 'test'})[0] == '0.0.0.0'
    with TestClient(create_app(container_mode=True, fetch_token='test')) as client:
        assert client.get('/healthz').status_code == 200
        assert client.post('/mcp').status_code == 404
        assert client.post('/v1/fetch', json={'url': URL}).status_code == 401
        assert client.post('/v1/fetch', headers={'Authorization': 'Bearer test'}, json={'url': 'https://127.0.0.1/'}).status_code == 400
        assert client.post('/v1/fetch', headers={'Authorization': 'Bearer test'}, json={'url': URL, 'profiles': ['invalid']}).status_code == 400


def test_ladder_redirect_upgrade_and_stop(monkeypatch):
    monkeypatch.setattr('decent_curl_impersonate.fetch_api.check_public_host', AsyncMock())
    redirect = response(status=301)
    redirect['headers']['location'] = 'http://example.com/science-improves-mental-health'
    engine = AsyncMock()
    engine.dispatch.side_effect = [redirect, response('<title>Just a moment</title>cf-chl-'), response()]
    result = asyncio.run(FetchAPI(engine, 'test', interval=0).fetch({'url': URL}))
    assert result['label'] == 'ok'
    assert result['profile'] == 'safari2601'
    assert [a['profile'] for a in result['attempts']] == ['chrome146', 'chrome146', 'safari2601']
    assert result['https_upgrades'] == ['http://example.com/science-improves-mental-health']
    assert all(call.args[1]['http_version'] == '2' and not call.args[1]['allow_redirects'] for call in engine.dispatch.call_args_list)


def test_binary_has_base64_body(monkeypatch):
    monkeypatch.setattr('decent_curl_impersonate.fetch_api.check_public_host', AsyncMock())
    engine = AsyncMock()
    engine.dispatch.return_value = response('%PDF', content_type='application/pdf')
    result = asyncio.run(FetchAPI(engine, 'test', interval=0).fetch({'url': URL}))
    assert result['body_encoding'] == 'base64'
    assert base64.b64decode(result['body']) == b'%PDF'
    assert len(result['attempts']) == 1
