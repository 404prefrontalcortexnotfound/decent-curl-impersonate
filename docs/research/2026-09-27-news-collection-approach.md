# News collection at scale

Research date: 2026-09-27. Brief: [issue #34](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/34). Parent: [issue #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31). Problem baseline: [PR #30](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30).

## Decision

Poll known feeds with Miniflux. Read new entries from its API. Keep PubMed on the NCBI E-utilities API. Keep Exa as an optional paid search, off the critical path. Extract full text with Trafilatura only when the feed summary is too short for review. Call browser-shaped HTTP only for URLs that plain HTTP blocks, and stop if the body is still a JavaScript challenge. Watch listing pages that have no feed with changedetection.io and its plain HTTP fetcher.

This fits both use cases. Use case 1 is the weekly WHIMH review. Use case 4 is homelessness and tenancy news for Mobilise Australia. The same poller takes a different feed list.

Miniflux is the poller because the consumer is a workflow. It is a single program, it stores entries in PostgreSQL, and it exposes a REST API ([Docker](https://miniflux.app/docs/docker.html), [API](https://miniflux.app/docs/api.html)). FreshRSS is the maintained alternative when a person must read inside the same program. FreshRSS has more stars and a newer release. WHIMH review already lands in Notion, so that reader interface is unused weight.

## What runs today

The curated list is Phosphor `config/whimh/feeds.toml`: 44 RSS feeds, 4 PubMed queries (`max_results` 25), and 6 Exa queries (`max_results` 10). A local count on 2026-09-27 returned those three numbers. Hemingway reads that file and does not copy it (`/Users/bo/code/hemingway-ops/whimh-v1/collectors/README.md:13`).

The Go pipeline collects RSS, PubMed, and Exa, then enriches, then syncs to Notion (`/Users/bo/code/Phosphor/workflow/whimh.go:54`). The schedule is `0 6 * * *` UTC with a 7-day lookback and overlap skip (`/Users/bo/code/Phosphor/workflow/whimh_schedule.go:16`). The RSS client is `gofeed` with a Chrome 120 user agent (`/Users/bo/code/Phosphor/adapter/rss/collector.go:37`). It stores the feed title, summary, and link. It does not fetch the article (`collector.go:120`). PubMed uses `esearch.fcgi` and `efetch.fcgi` (`/Users/bo/code/Phosphor/adapter/pubmed/collector.go:19`). Exa posts to `https://api.exa.ai/search` (`/Users/bo/code/Phosphor/adapter/exa/collector.go:18`). Inserts skip an existing `(url_hash, mode)` (`/Users/bo/code/Phosphor/adapter/postgres/source_store.go:46`). One collector failure does not stop the others (`/Users/bo/code/Phosphor/app/collect.go:73`).

The PhoApp path seeds the same inventory (`collectors/README.md:41`, `sql/080_daily_collection.sql:25`). Two feed URLs are replaced because the toml path returned 403 or 404 (`collectors/inventory.py:52`). Document identity is a set of keys, including a canonical URL (`sql/020_identity.sql:4`). Runbook 15 names the collect step as RSS, PubMed, and Exa, with raw capture before relevance filtering (`docs/phoapp-workload-trial/workflows/15-whimh-daily.md:22`).

`SOURCE-REGISTRY.md` is a tier list for domains that already appeared. It is not the fetch list (`flows/enrich/SOURCE-REGISTRY.md:5`).

The epic says hundreds of sites. The configured fetch list is 44 feeds plus 10 queries. Live insert counts were not measured. This run did not query a database and did not start a flow.

## How the samples were chosen

WHIMH sample: 20 of the 44 toml feeds, at least one from each comment group, with extra rows from health journalism and journals. Those two groups are the largest. URLs are the toml URLs, not the PhoApp overrides, except for one follow-up on TGA.

| Id | Group in feeds.toml | Feed |
| --- | --- | --- |
| w01 | MH trade press | `https://bhbusiness.com/feed/` |
| w02 | Health journalism | `https://www.statnews.com/feed/` |
| w03 | Health journalism | `https://kffhealthnews.org/feed/` |
| w04 | Health journalism | `https://rss.politico.com/healthcare.xml` |
| w05 | Health journalism | `https://endpts.com/feed/` |
| w06 | Tech / VC | `https://techcrunch.com/tag/mental-health/feed/` |
| w07 | Tech / VC | `https://www.wired.com/feed/category/science/latest/rss` |
| w08 | Health journalism | `https://www.fiercehealthcare.com/rss/xml` |
| w09 | Academic, MH | `https://www.thelancet.com/action/showFeed?jc=lanpsy&type=etoc&feed=rss` |
| w10 | Academic, MH | `https://jamanetwork.com/rss/site_3/67.xml` |
| w11 | Academic, broader | `https://www.nature.com/nm.rss` |
| w12 | Academic, MH | `https://mentalhealth.bmj.com/rss/current.xml` |
| w13 | Government | FDA press-release RSS in the toml |
| w14 | Government | `https://www.who.int/rss-feeds/news-english.xml` |
| w15 | Government | UK MHRA `.atom` in the toml |
| w16 | Government | `https://www.tga.gov.au/rss.xml` |
| w17 | Wire | PR Newswire health RSS in the toml |
| w18 | Psychedelics | `https://psychedelicalpha.com/feed` |
| w19 | Academic, MH | `https://www.frontiersin.org/journals/psychiatry/rss` |
| w20 | Health tech | `https://www.healthcareitnews.com/feed` |

Left out on purpose: Becker's, Psychiatric Times, Lucid News, the second STAT feed, Health Affairs, MobiHealthNews, Ars, Crunchbase, CB Insights, GlobeNewswire, Business Wire, World Psychiatry, npj Digital Medicine, Frontiers in Digital Health, ARPA-H, UK DHSC, and the other health-tech blogs. Same groups are already in the 20.

Use case 4, ten sources, chosen to cover a national peak, two state peaks, two news sections, two tenancy bodies, one state regulator, one research institute, and Parliament:

| Id | Why this source | First URL tried |
| --- | --- | --- |
| h01 | Homelessness Australia, national peak | `https://homelessnessaustralia.org.au/feed/` |
| h02 | Council to Homeless Persons, Victoria | `https://chp.org.au/feed/` |
| h03 | Homelessness NSW | `https://homelessnessnsw.org.au/feed/` |
| h04 | ABC topic page. Feed tried was the public just-in RSS | `https://www.abc.net.au/news/topic/homelessness` |
| h05 | Guardian Australia housing section | `https://www.theguardian.com/australia-news/housing/rss` |
| h06 | Tenants' Union of NSW | `https://www.tenants.org.au/feed/` |
| h07 | Consumer Affairs Victoria renting | `https://www.consumer.vic.gov.au/rss.xml` |
| h08 | Residential Tenancies Authority, Queensland | `https://www.rta.qld.gov.au/feed` |
| h09 | AHURI news | `https://www.ahuri.edu.au/feed` |
| h10 | Parliament RSS help page, plus the Senate committee home | `https://www.aph.gov.au/Help/RSS_feeds` |

## Measurements

Plain `/usr/bin/curl` on Blackfin, 2026-09-27. At most one request per second to each host. Order: w01, then w02–w06, then w07–w20, then h01–h10, then a second pass that took the first real `<item>` link. Scripts were `/tmp/r3a-probe.py`, `/tmp/r3a-real-articles.py`, `/tmp/r3a-fixlinks.py`, and `/tmp/r3a-three.py`.

Feed result for the 20 toml URLs: 16 returned HTTP 200 with an RSS or Atom body. Four did not. Endpoints followed to `https://endpoints.news/feed/` and returned CloudFront 403. JAMA returned `403 Forbidden` and the text "Request forbidden by administrative rules." Healthcare IT News returned Cloudflare `Just a moment...` with `cf-mitigated`. TGA `/rss.xml` returned 404. The PhoApp override `https://www.tga.gov.au/feeds/article.xml` returned 200 `application/rss+xml`.

Homepage autodiscovery (`link rel=alternate` for RSS or Atom) matched the known feed for STAT, KFF, TechCrunch (site feed), Wired, Nature Medicine, MHRA, Psychedelic Alpha, and Frontiers. POLITICO, Fierce, FDA, WHO, PR Newswire, and TGA homepages did not advertise the known feed. WordPress `/wp-json/wp/v2/posts?per_page=1` returned JSON for Behavioral Health Business, STAT, KFF, TechCrunch, and Psychedelic Alpha. Other WHIMH hosts were not probed for a public API.

Article HTML, one item URL each, plain curl:

| Result | Sources |
| --- | --- |
| HTTP 200 HTML, story title present | w01, w02, w03, w04, w06, w07, w11, w13, w14, w15, w16 override, w17, w18, w19 |
| Cloudflare challenge, HTTP 403 | Fierce article, Lancet article `PIIS2215-0366(26)00278-6`, BMJ article `e301683` |
| No item, because the feed was blocked | Endpoints, JAMA, Healthcare IT News |

Nature Medicine's feed URL gains `error=cookies_not_supported`, and the body is still `application/rss+xml`. The article `s41591-026-04684-0` returned HTTP 200 HTML. POLITICO's article returned HTTP 200 HTML. The page contains the words "captcha" and "subscribe". The title is the story title, so this row is HTML, not a wall.

Use case 4:

| Source | Feed | Page | Article |
| --- | --- | --- | --- |
| Homelessness Australia | `/feed/` 200, 10 items | 200 | item HTML 200. WordPress JSON 200 |
| Council to Homeless Persons | `/feed/` 200, 3 items | 200 | First item is `https://chp.org.au/search/`, dated 2 Mar 2022 |
| Homelessness NSW | `/feed/` 200, 10 items | 200 | item HTML 200. WordPress JSON 200 |
| ABC topic | Just-in RSS 200, 25 items. Topic page advertised no feed | 200 | just-in item HTML 200 |
| Guardian housing | section RSS 200, 20 items. Homepage advertised that RSS | 200 | item HTML 200 |
| Tenants' Union of NSW | `/feed/` 404 | 200, no RSS href | not measured |
| Consumer Affairs Victoria | guessed `/rss.xml` 403. `/rss-feeds` is HTML and lists `RSS.aspx` | renting page 200 | `RssType=newsalerts` returned 200 XML and 164 items |
| RTA Queensland | `/feed` 404 | 200, no RSS href. Sitemap 200 | not measured |
| AHURI news | `/feed` 404 | 200, no RSS href. Sitemap 200 | not measured |
| Parliament | Help page is HTML 200. Committee home 403. Sitemap 403 | help page lists feeds | `https://www.aph.gov.au/senate/rss/new_inquiries` returned 200 XML and 36 items |

Sitemap XML or a sitemap index returned HTTP 200 for most WHIMH hosts. Fierce, Endpoints, JAMA, Lancet, and Healthcare IT News sitemaps returned 403. PR Newswire's first `Sitemap:` line was `llms.txt`. Entry freshness inside sitemaps was not measured.

Share, from these requests only. Three of 20 WHIMH feeds are blocked (15 percent). One of 20 is a dead path with a working public replacement. Three further WHIMH sources serve a feed and then block the article with a JavaScript challenge. A collector that stores feed summaries, which is what the Go code does, needs a special fetch for 3 of 20 feeds. A collector that also needs the article body needs a special fetch for 6 of 20. The measured Australian article pages returned HTML. The Parliament committee home returned 403. Tenants' Union of NSW, RTA Queensland, and AHURI still showed no feed after the page read.

Browser-shaped HTTP does not run JavaScript ([PR #30](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30), need "Execute JavaScript"). Cloudflare `Just a moment` can remain after a browser-shaped request. This run did not send an impersonated request. Success on Fierce, Lancet, BMJ, Healthcare IT News, JAMA, and Endpoints is not measured.

## Maintained tools

GitHub reads on 2026-09-27, one request at a time. Commit counts are `per_page=100` since `2026-06-29T13:47:10Z`. A count of 100 means at least 100. `open_issues_count` includes pull requests.

| Tool | Stars | Pushed | Open | License | Latest release | Commits / 90d | On Kubernetes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [miniflux/v2](https://github.com/miniflux/v2) | 9744 | 2026-09-23 | 285 | Apache-2.0 | 2026-07-24 | 67 | Official image `miniflux/miniflux` plus Postgres. Helm chart not measured. |
| [FreshRSS/FreshRSS](https://github.com/FreshRSS/FreshRSS) | 16156 | 2026-09-27 | 682 | AGPL-3.0 | 2026-09-09 | at least 100 | Third-party Helm `christianhuth/freshrss` chart 2.17.3, app 1.30.0, updated 2026-09-14. |
| [DIYgod/RSSHub](https://github.com/DIYgod/RSSHub) | 46338 | 2026-09-27 | 196 | AGPL-3.0 | no GitHub release | at least 100 | Helm not measured. |
| [RSS-Bridge/rss-bridge](https://github.com/RSS-Bridge/rss-bridge) | 9255 | 2026-08-28 | 284 | Unlicense | 2025-08-05 | 54 | Helm not measured. |
| [adbar/trafilatura](https://github.com/adbar/trafilatura) | 6871 | 2026-09-25 | 58 | Apache-2.0 | 2026-07-31 | 38 | Library. No product chart. |
| [fhamborg/news-please](https://github.com/fhamborg/news-please) | 2493 | 2026-04-14 | 9 | Apache-2.0 | none | 0 | Last push is outside the 90-day window. |
| [AndyTheFactory/newspaper4k](https://github.com/AndyTheFactory/newspaper4k) | 1143 | 2026-08-24 | 135 | MIT | 2026-07-19 | 26 | Library. Trafilatura is the stronger extractor. |
| [apify/crawlee](https://github.com/apify/crawlee) | 25916 | 2026-09-26 | 135 | Apache-2.0 | 2026-08-12 | at least 100 | Library, JavaScript. |
| [apify/crawlee-python](https://github.com/apify/crawlee-python) | 9554 | 2026-09-26 | 97 | Apache-2.0 | 2026-09-22 | at least 100 | Library, Python. |
| [scrapy/scrapy](https://github.com/scrapy/scrapy) | 64498 | 2026-09-27 | 331 | BSD-3-Clause | 2026-09-10 | at least 100 | Library. |
| [jxlil/scrapy-impersonate](https://github.com/jxlil/scrapy-impersonate) | 241 | 2026-08-27 | 0 | MIT | 2026-08-27 | 4 | Small download handler for Scrapy. `scrapy-plugins/scrapy-impersonate` is 404. |
| [spider-rs/spider](https://github.com/spider-rs/spider) | 2744 | 2026-09-16 | 1 | MIT | 2026-03-31 | 51 | Library. |
| [gocolly/colly](https://github.com/gocolly/colly) | 25535 | 2026-09-16 | 194 | Apache-2.0 | 2025-03-27 | 9 | Library. Slow release pace. |
| [dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io) | 34589 | 2026-09-25 | 392 | Apache-2.0 | 2026-09-17 | at least 100 | Image `ghcr.io/dgtlmoon/changedetection.io`. Compose file in the repo. Helm not measured. |

Crawlee, Scrapy, Colly, and spider are active crawlers. These two use cases already have feeds for the majority of rows. A crawler would add requests without a measured gain. `scrapy-impersonate` is the maintained Scrapy hook for browser TLS if a later crawl needs it. It is not the news system.

RSSHub and RSS-Bridge build feeds for sites that lack one. No route was tested for these 30 sources. RSSHub is the more active of the two. Use a route only when it exists and the upstream page has no own feed.

news-please has no commits in 90 days. Leave it.

## Architecture

1. One feed list per use case, stored as data. WHIMH starts from `feeds.toml`, with the TGA URL taken from `inventory.py:54`. Use case 4 starts from the feeds that returned XML above.
2. Miniflux polls the feeds that returned 200 to plain curl. A worker reads new entries from the API. WHIMH keyword filtering stays in the worker. Miniflux does not know the mental-health word list.
3. The three blocked WHIMH feeds (Endpoints, JAMA, Healthcare IT News) are not given to Miniflux. A worker fetches each URL through the browser-shaped HTTP service, parses RSS if the body is RSS, and records an error if the body is still a challenge or a 403. The epic forbids JavaScript for this phase, so there is no browser fallback.
4. Full text is a second step. Call Trafilatura on the item URL when the summary is short. Use plain HTTP first. Use browser-shaped HTTP when the status is 403 or the body is a challenge page. Fierce, Lancet, and BMJ are the measured members of that set. If the second body is still `Just a moment`, keep the feed summary and mark the article unfetched.
5. Pages with no feed go to changedetection.io in plain HTTP mode. Measured members: Tenants' Union of NSW, RTA Queensland, AHURI news, and the ABC homelessness topic page. The ABC just-in feed is healthy and is the wrong set for this topic. Council to Homeless Persons has a feed whose first item is a search page from 2022, so watch its news listing the same way. Read a site's own feed index before this step. Consumer Affairs Victoria and Parliament looked feedless until the HTML index was read.
6. PubMed stays on E-utilities. Exa stays optional. Both already return structured results. Neither needs browser-shaped HTTP.
7. The downstream store ignores an article URL it already has. Miniflux deduplicates inside one feed. Two feeds can still emit the same story. The key set in `sql/020_identity.sql:4` is the rule to keep.

Browser-shaped HTTP is the fetch function in steps 3 and 4. Tatu remains a separate network-exit layer ([issue #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31)).

## Not measured

Live WHIMH insert volume. Impersonated requests to the six hard URLs. RSSHub routes for these sites. Sitemap item dates. A public API on hosts that are not WordPress. Official Helm charts other than the FreshRSS chart named above. Whether Miniflux's own client can fetch any feed that plain curl already fetched. That last point is likely, and it was not tested.
