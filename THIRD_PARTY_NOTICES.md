# Third-party notices

`decent-curl-impersonate` installs the pinned `curl_cffi` Python distribution. Its wheels bundle curl-impersonate/libcurl and cryptographic/networking dependencies. This npm tarball doesn't vendor those binaries; `uv` obtains them from the public Python package index during explicit setup.

## curl_cffi

- Version: 0.15.0
- Source: https://github.com/lexiforest/curl_cffi
- License: MIT
- Copyright: curl_cffi contributors

The MIT license permits use, copying, modification, distribution, sublicensing, and sale provided its copyright and permission notices are retained. The software is provided without warranty. The complete upstream license is at https://github.com/lexiforest/curl_cffi/blob/v0.15.0/LICENSE.

## curl-impersonate

- Version used to build curl_cffi 0.15.0: lexiforest fork 1.5.2
- Source: https://github.com/lexiforest/curl-impersonate
- Original project: https://github.com/lwthiker/curl-impersonate
- License: MIT
- Copyright: curl-impersonate contributors

The MIT license permits use, copying, modification, distribution, sublicensing, and sale provided its copyright and permission notices are retained. The software is provided without warranty. The complete upstream license is at https://github.com/lexiforest/curl-impersonate/blob/v1.5.2/LICENSE.

## curl and libcurl

- Bundled version reported by the pinned wheel: curl/libcurl 8.15.0-IMPERSONATE
- Source: https://curl.se/ and https://github.com/curl/curl
- License: curl license (MIT/X-inspired)
- Copyright: 1996–present, Daniel Stenberg and contributors

Permission is granted to use, copy, modify, and distribute curl for any purpose with or without fee provided the copyright and permission notice appear in all copies. The software is provided without warranty. The complete license is at https://curl.se/docs/copyright.html and https://github.com/curl/curl/blob/curl-8_15_0/COPYING.

## BoringSSL

- Component: TLS library linked by the bundled libcurl-impersonate build
- Source: https://boringssl.googlesource.com/boringssl/
- Licenses: ISC-style and other permissive licenses inherited by individual files, including OpenSSL and SSLeay notices
- Copyright: The BoringSSL Authors and respective upstream authors

BoringSSL's top-level ISC-style terms permit use, copying, modification, and distribution with or without fee provided the copyright and permission notice appear in all copies. The software is provided without warranty. Some source files carry additional compatible notices. The authoritative complete license collection is at https://boringssl.googlesource.com/boringssl/+/HEAD/LICENSE.

## Transitive Python packages

The frozen `uv.lock` records all Python dependencies and their exact artifacts. Those packages remain under their respective licenses. This notice doesn't replace license files included by installed Python distributions.
