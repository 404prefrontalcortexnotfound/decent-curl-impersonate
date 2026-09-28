"""Authenticated, public-page fetch ladder with paced redirects."""
from __future__ import annotations

import asyncio
import base64
import hmac
import ipaddress
import math
import socket
import time
from urllib.parse import urljoin, urlsplit, urlunsplit

from curl_cffi.requests import BrowserType
from starlette.requests import Request
from starlette.responses import JSONResponse

from .article_verifier import assess
from .engine import CurlEngine, EngineError

PROFILES = ['chrome146', 'safari2601', 'firefox147']
NAVIGATION_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-AU,en;q=0.9',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none', 'Sec-Fetch-User': '?1',
}


def public_url(url: str) -> tuple[str, bool]:
    """Validate the URL syntax and upgrade HTTP before any request."""
    if not isinstance(url, str) or len(url) > 8192:
        raise ValueError('url must be a public HTTP or HTTPS URL')
    parsed = urlsplit(url)
    if (parsed.scheme not in {'https', 'http'} or not parsed.hostname
            or parsed.username is not None or parsed.password is not None
            or parsed.port not in {None, 80, 443}):
        raise ValueError('url must be a public HTTP or HTTPS URL on a standard port')
    upgraded = parsed.scheme == 'http'
    netloc = parsed.hostname if parsed.port == 80 else parsed.netloc
    return urlunsplit(('https', netloc, parsed.path or '/', parsed.query, '')), upgraded


async def check_public_host(host: str) -> None:
    addresses = await asyncio.get_running_loop().getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(row[4][0]).is_global for row in addresses):
        raise ValueError('url must resolve only to public addresses')


def classify(result: dict, source_url: str) -> tuple[str, str | None]:
    status = result['status']
    body = result['body']
    headers = result['headers']
    content_type = headers.get('content-type', '').lower()
    if status in {404, 410}:
        return 'not_found', f'http_{status}'
    if status == 401:
        return 'login', 'http_401'
    if status >= 400:
        evidence = assess(body, status, headers, {'url': source_url}, result['url'])
        blocker = evidence['blocker']
        return ('challenge' if blocker in {'cloudflare','akamai','perimeterx','datadome','imperva','aws_waf','captcha'} else 'blocked'), blocker
    if result.get('body_encoding') == 'base64' or (content_type and not any(x in content_type for x in ['text/', 'json', 'xml', 'javascript'])):
        return 'binary', None
    evidence = assess(body, status, headers, {'url': source_url}, result['url'])
    blocker = evidence['blocker']
    if blocker == 'paywall_stop':
        return 'paywall', blocker
    if blocker in {'cloudflare','akamai','perimeterx','datadome','imperva','aws_waf','captcha'}:
        return 'challenge', blocker
    if evidence['article_found']:
        return 'ok', None
    low = body.lower()
    if any(term in low for term in ['accept cookies to continue', 'enable cookies to continue', 'consent required']):
        return 'cookie_wall', 'cookie_wall'
    if any(part in urlsplit(result['url']).path.lower().split('/') for part in ['login', 'signin', 'sign-in']):
        return 'login', 'login_redirect'
    return ('not_found' if blocker == 'not_found' else 'blocked'), blocker


class FetchAPI:
    def __init__(self, engine: CurlEngine, token: str | None, interval: float = 3.0):
        self.engine, self.token, self.interval = engine, token, interval
        self.last: dict[str, float] = {}
        self.locks: dict[str, asyncio.Lock] = {}

    async def request(self, request: Request) -> JSONResponse:
        if not self.token:
            return JSONResponse({'error': 'fetch API is not configured'}, status_code=503)
        if not hmac.compare_digest(request.headers.get('authorization', '').encode(), ('Bearer ' + self.token).encode()):
            return JSONResponse({'error': 'unauthorized'}, status_code=401)
        try:
            raw = await request.body()
            if len(raw) > 16384:
                return JSONResponse({'error': 'request too large'}, status_code=413)
            data = await request.json()
            if not isinstance(data, dict):
                raise ValueError('request must be an object')
            result = await self.fetch(data)
            return JSONResponse(result)
        except (ValueError, TypeError):
            return JSONResponse({'error': 'invalid fetch request or non-public URL'}, status_code=400)

    async def fetch(self, data: dict) -> dict:
        url, upgraded = public_url(data.get('url'))
        profiles = data.get('profiles', PROFILES)
        timeout = data.get('timeout_s', 30)
        if (not isinstance(profiles, list) or not 1 <= len(profiles) <= 6
                or any(not isinstance(p, str) or p not in BrowserType.__members__ for p in profiles)):
            raise ValueError('profiles must contain one to six installed profiles')
        if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or not 1 <= timeout <= 120:
            raise ValueError('timeout_s must be from 1 to 120')
        attempts = []
        upgrades = [data['url']] if upgraded else []
        output = {}
        for profile in profiles:
            current = url
            for redirect in range(11):
                host = urlsplit(current).hostname
                await check_public_host(host)
                lock = self.locks.setdefault(host, asyncio.Lock())
                async with lock:
                    await asyncio.sleep(max(0, self.last.get(host, 0) + self.interval - time.monotonic()))
                    started = time.monotonic()
                    self.last[host] = started
                    try:
                        result = await self.engine.dispatch('request.execute', {
                            'url': current, 'method': 'GET', 'profile': profile,
                            'http_version': '2', 'headers': NAVIGATION_HEADERS,
                            'timeout': timeout, 'allow_redirects': False,
                        })
                        label, blocker = classify(result, url)
                    except EngineError as error:
                        label = 'timeout' if error.code == 'timeout' else 'blocked'
                        blocker = error.code
                        result = {'status': 0, 'url': current, 'body': '', 'headers': {}, 'body_encoding': 'utf-8', 'http_version': None}
                attempt = {'profile': profile, 'status': result['status'], 'blocker': blocker, 'ms': round((time.monotonic() - started) * 1000), 'url': current}
                attempts.append(attempt)
                location = result['headers'].get('location')
                if result['status'] in {301,302,303,307,308} and location and redirect < 10:
                    target = urljoin(current, location)
                    current, changed = public_url(target)
                    if changed:
                        upgrades.append(target)
                    attempt['blocker'] = 'redirect'
                    continue
                body, encoding = result['body'], result['body_encoding']
                raw = base64.b64decode(body) if encoding == 'base64' else body.encode(encoding)
                if label == 'binary':
                    body, encoding = base64.b64encode(raw).decode('ascii'), 'base64'
                output = {
                    'status': result['status'], 'final_url': result['url'], 'profile': profile,
                    'http_version': result['http_version'], 'content_type': result['headers'].get('content-type', ''),
                    'body': body, 'body_encoding': encoding, 'bytes': result.get('bytes', len(raw)),
                    'attempts': attempts, 'label': label, 'https_upgrades': upgrades,
                }
                break
            if label not in {'challenge', 'blocked', 'timeout'}:
                break
        return output
