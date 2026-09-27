# R3b: regulatory monitoring approach

Research snapshot 2026-09-27. Brief: [issue #35](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/35), parent [epic #31](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/issues/31) use case 2. Baseline: [PR #30](https://github.com/404prefrontalcortexnotfound/decent-curl-impersonate/pull/30).

All live requests used plain `/usr/bin/curl` from Blackfin, one GET per host, at least 1.3 s apart, staged 1, 5, then batches. No loader was run. The regulatory-analytics loader freeze holds.

## 1. What our existing code does

| Finding | Evidence |
| --- | --- |
| Every loader is a plain `requests` client with an honest project User-Agent. | `loaders/common.py:35`, `requirements.txt:6` |
| Browser impersonation is opt-in per run through `REGDB_IMPERSONATE` and `curl_cffi`, which is **not** in `requirements.txt`; asking for it without the library raises rather than silently falling back. | `loaders/common.py:83`, `:86`, `:97`, `requirements.txt:1-7` |
| It exists for one publisher. The comment records the TGA dropping us while `curl --http1.1` timed out and HTTP/2 died with `INTERNAL_ERROR`. | `loaders/common.py:66-79` |
| A CA-bundle repair function exists for one publisher's incomplete chain. | `loaders/common.py:119-132` |
| One loader bypasses the shared fetch function entirely to send DataTables headers. | `loaders/nafdac.py:75-78` |
| The UK products API is dead; 503 on every endpoint including `/healthz`. The XLSX lists replaced it. | `loaders/sources/mhra.md:77`, `loaders/mhra.py:66` |
| Inventory already states the rule the rest of this report follows. | `docs/sources.md:115-117`: "Where a published bulk file exists, use it rather than the search interface; that avoids the problem instead of fighting it." |

The custom identity code is per-publisher patching of a symptom. Of the four `curl_cffi` and CA-repair call sites, three target publishers that no longer fail, and none is needed for any source that has an API or feed.

## 2. Our own records, checked again

| Prior record | Measured today, plain `/usr/bin/curl` | Reading |
| --- | --- | --- |
| ANVISA CSV: `curl 60` local issuer failure, `gap_tls_certificate_chain` (`loaders/global_inventory.json:51,58,61`) | `200`, 8,336,355 bytes. Chain is now complete: leaf + Sectigo R36 + Root R46, `Verify return code: 0 (ok)` | Publisher fixed it. The CA-repair path is dead weight. |
| TGA refused plain `requests` (`loaders/common.py:66-70`) | `https://www.tga.gov.au/resources/artg` returned `200`, 198,311 bytes to plain curl | Intermittent or region-dependent. Do not build on either answer. |
| Swissmedic listing URL at `loaders/sm.py:40` | `200`, 146,087 bytes | Our record is correct. No change. |

Two more measured facts that change the design:

- **Soft 404s return HTTP 200.** `https://www.medsafe.govt.nz/regulatory/Databases/` returns `200` and 9,278 bytes of "Page not found". A monitor that trusts status codes will record this as a healthy read. Content assertions are mandatory.
- **`canada.ca` fails HTTP/2 with plain curl.** `https://www.canada.ca/en.html` gave `curl: (92) HTTP/2 stream 1 was not closed cleanly: INTERNAL_ERROR`, while `recalls-rappels.canada.ca` and `health-products.canada.ca` were both fine. The identity problem is per-host, not per-site.

## 3. Regulator access table

Browser-shaped HTTP column: "no" means plain curl returned real content today. "yes" means plain curl was refused.

| Regulator | Scope | Best method | URL | Browser-shaped HTTP | Licence |
| --- | --- | --- | --- | --- | --- |
| FDA (openFDA) | drugs, biologics, devices | REST API | `https://api.fda.gov/drug/label.json`, `/drug/drugsfda.json`, `/drug/enforcement.json`, `/device/udi.json`, `/device/510k.json`, `/device/pma.json`, `/device/classification.json`, `/device/recall.json`, `/device/enforcement.json` | no, all `200` JSON | Public domain, CC0 1.0, **except GMDN® device content** (`https://open.fda.gov/terms/`) |
| FDA | recalls, alerts | RSS | `https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml` | no, `200` `application/rss+xml` | as above |
| FDA | bulk manifests | JSON manifest | `https://api.fda.gov/download.json` | no, `200` | as above |
| EMA (EU) | centrally authorised medicines | XLSX | `https://www.ema.europa.eu/en/documents/report/medicines-output-medicines-report_en.xlsx` | no, `200`, 901,852 bytes | reuse policy published, not measured |
| EMA (EU) | news, CHMP/PRAC outcomes, per-medicine updates | RSS, ~20 feeds plus one per medicine | `https://www.ema.europa.eu/en/news.xml` | no, `200` `application/rss+xml` | as above |
| Health Canada | medicines register | JSON API, 3 resources | `https://health-products.canada.ca/api/drug/drugproduct/?lang=en&type=json` | no, `200`, 15,060,931 bytes | Open Government Licence - Canada |
| Health Canada | recalls, safety alerts, devices | daily JSON and CSV | `https://recalls-rappels.canada.ca/sites/default/files/opendata-donneesouvertes/HCRSAMOpenData.json` | no, `200`, 15,719,914 bytes | Open Government Licence - Canada |
| Health Canada | feed discovery | CKAN API | `https://open.canada.ca/data/en/api/3/action/package_search` | no, `200` | Open Government Licence - Canada |
| MHRA (UK) | medicines register | XLSX, Windsor Category 1 and 2 | `https://www.gov.uk/government/publications/...` (`docs/sources.md:60-68`) | no, page `200` | Open Government Licence v3.0 (`docs/sources.md:63`) |
| MHRA (UK) | publications, alerts | Atom | `https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency.atom` | no, `200` `application/atom+xml` | OGL v3.0 |
| TGA (AU) | medicines, biologicals, devices, listed goods | XLSX operator export | `https://compliance.health.gov.au/artg/` (`docs/sources.md:8-18`) | not measured; the tool is a GUI | unverified |
| Swissmedic (CH) | medicines, extended list | XLSX | `https://www.swissmedic.ch/swissmedic/en/home/services/listen_neu.html` | no, `200` | unverified |
| PMDA (JP) | approved drugs, per fiscal year | XLSX per year | `https://www.pmda.go.jp/review-services/drug-reviews/review-information/p-drugs/0010.html` | no, `200` | unverified |
| PMDA (JP) | approved devices | HTML index | `https://www.pmda.go.jp/english/review-services/reviews/approved-information/devices/0001.html` | no, `200` | unverified |
| ANVISA (BR) | registered medicines, daily | CSV | `https://dados.anvisa.gov.br/dados/DADOS_ABERTOS_MEDICAMENTOS.csv` | no, `200` today, see §2 | open data programme, unverified |
| WHO PQ | prequalified FPP and biotherapeutics | CSV snapshot | `https://extranet.who.int/prequal/medicines/prequalified/finished-pharmaceutical-products/export?page&_format=csv` | no, `200`, 131,092 bytes | WHO copyright policy |
| WHO INN | recommended and proposed names | PDF series only | `https://www.who.int/activities/health-product-standardization/international-nonproprietary-names` | not applicable | CD-ROM only (`docs/sources.md:20-25`) |
| MFDS (KR) | permitted products | OpenAPI, key required | `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService07/getDrugPrdtPrmsnInq07` | no; the `data.go.kr` catalogue page's `captcha` is a **search form field**, not a blocking challenge | 이용허락범위 제한 없음 (`global_inventory.json:85`) |
| NAFDAC (NG) | registered drugs, DataTables JSON | server-side JSON | `https://greenbook.nafdac.gov.ng/` | no, `200` | unverified |
| NMPA (CN) | approvals, data search | browser query only | `https://www.nmpa.gov.cn/datasearch/home-index.html` | **yes**: `412 Precondition Failed` to plain curl. The service page returns `200` (`global_inventory.json:23`) | unverified |
| CDSCO (IN) | dated new-drug approval PDFs | HTML index of PDFs | `https://www.cdsco.gov.in/opencms/opencms/en/Approval_new/Approved-New-Drugs/` | no, `200` | unverified |
| HSA (SG) | medical devices | HTML register, CloudFront 301 to trailing slash | `https://www.hsa.gov.sg/medical-devices/` | no after redirect | unverified |
| Medsafe (NZ) | approvals, recalls | page monitoring only | `https://www.medsafe.govt.nz/hot/recalls/recallsearch.asp` | no, `200` | unverified |
| SAHPRA (ZA) | registered health products | HTML tables | `https://www.sahpra.org.za/databases-registers/` | **blocked**: `curl: (28)` timeout at 30 s. `global_inventory.json:111` recorded `curl 60` (SSL) for this URL and `curl 28` for `registered-health-products` | unverified |
| COFEPRIS (MX) | registro sanitario | visor | `https://registros.cofepris.gob.mx/` | **blocked**: `curl: (28)` timeout at 30 s. `global_inventory.json:180` records a timeout only for the legacy BRSDM; the inventory did not finish the visor GET | unverified |
| EUDAMED | EU devices and vigilance | none public | `https://ec.europa.eu/tools/eudamed` returns `302` to a registration wall | not reachable | not measured |

**Added beyond `global_inventory.json`:** Medsafe and HSA (both reachable, neither in the inventory), the Health Canada recalls open dataset, the EMA and MHRA feeds, the Health Canada and Australian CKAN discovery APIs, and the openFDA device and recall endpoints. **Licence finding that changes scope:** openFDA device data embeds GMDN® content under a separate GMDN Agency licence, and `open.fda.gov/terms/` states that extracting GMDN Content to build commercial services, alternate categorisation, or for AI training needs that licence first. Device analytics from openFDA are therefore not free to use as I assumed. Confirm per-field before anything derived is published.

## 4. How many regulators actually need browser-shaped HTTP

Of 24 measured endpoints, three refused plain curl: NMPA data search (412), SAHPRA (timeout), COFEPRIS (timeout). Two are unreachable by any client and need a network answer, not an identity answer. **One, NMPA, is an identity problem.** Two more are unmeasured and should be treated as unknown.

This is the load-bearing result for the epic. For this use case, browser identity is a rounding error: 1 of 24 endpoints, about 4 %. The remaining 23 are API keys, CSV files, feeds, or blocked networks. Layer order is therefore feed first, browser last.

## 5. Recommended architecture

Every component below is maintained third-party work. Ours is confined to the warehouse it already has.

```
 publisher ──▶ tier 1: ingest ──────────────▶ Postgres (regulatory-analytics) ──▶ existing views
   API/CSV/     |  Airbyte or Meltano             existing schema/ and loaders/
   Atom         |  (schedule + schema drift)
                |  loader-free for the file-shaped sources
                |
                |  tier 2: collect ──▶ Miniflux (read REST API, one category per regulator)
                |     feeds + RSSHub/RSS-Bridge for publishers with a page but no feed
                |
                |  tier 3: watch ──▶ changedetection.io (per-watch Playwright, per-watch proxy)
                |     only for NMPA, TGA, and any page that breaks
                |
                └──▶ tier 4: notify ──▶ Apprise (one call, every channel)
```

| Component | Why this one | Measured 2026-09-27 |
| --- | --- | --- |
| **changedetection.io** | Page monitoring with a real Chrome via Playwright, per-watch proxy, custom headers, XPath/CSS/JSON selectors, browser steps, full REST API. It already supplies browser-shaped HTTP without us building any. | 34,589 stars, Apache-2.0, pushed 2026-09-25, release 2026-09-17, 100+ commits/90 d (page cap) |
| **Miniflux** | Smallest maintained feed reader with a clean read API. Fits the "data as an interface" rule. | 9,744 stars, Apache-2.0, pushed 2026-09-23, release 2026-07-24, 67 commits/90 d |
| **RSS-Bridge** | Turns a page into a feed so tier 3 shrinks. 18 language bridges plus HTML/XML filters. | 9,255 stars, Unlicense, pushed 2026-08-28, release 2025-08-05, 54 commits/90 d |
| **RSSHub** | More coverage where a national regulator has a route. AGPL, so isolate it. | 46,338 stars, AGPL-3.0, pushed 2026-09-27, no GitHub release, 100+ commits/90 d |
| **Apprise** | One notification interface across Slack, email and webhooks. | 17,400 stars, BSD-2, pushed 2026-09-27, release 2026-09-26, 74 commits/90 d |
| **Airbyte or Meltano** | Maintained EL for the file and API sources, so new regulators arrive as config, not loader code. | not measured |
| **Temporal** | Already in the estate from the WHIMH pipeline. Use it for tier 2 and 3 orchestration rather than adding n8n (206,095 stars but `NOASSERTION` licence), Windmill (same), or Kestra (28,373 stars, Apache-2.0, 100+ commits/90 d). | 23,315 stars, MIT, pushed 2026-09-27, release 2026-09-11, 100+ commits/90 d |

Architecture rules:

1. **No bespoke fetch code per regulator.** A new regulator is a source row, not a Python file. The current per-regulator loader count is the cost this rule removes.
2. **Assert on content, never on status.** Two measured 200s were "Page not found" and a health-check JSON. Each source needs a must-contain string checked on every read.
3. **Keep the layers separate, as the epic requires.** changedetection.io's per-watch proxy and RSS-Bridge's proxy setting take an exit from the network layer. Browser identity stays in the fetch, exit stays in the network, and no component holds both. This is exactly the fix for the Tatu mixing recorded in the epic.
4. **Egress stays a configuration value.** `loaders/common.py:45-64` already treats the proxy as configuration. Keep that.
5. **Keep the licence field live.** The GMDN boundary shows one register can be open and one field inside it closed.

## 6. What I would stop doing

- Stop adding `curl_cffi` and CA-bundle repair paths per publisher. Two of the three live ones are fixed; the third is a network block. §2 lists the measurements.
- Stop paginating HTML listings. `docs/sources.md:8-18` already rules it out for TGA, and the same rule applies to CDSCO, HSA, Medsafe and Swissmedic.
- Stop treating "the site is up" as a source finding. Query `provenance.source.verified` (`docs/sources.md:1-4`).

## 7. Gaps and not measured

- TGA, MFDS and WHO PQ licences unverified; the EMA reuse policy URL 404s.
- TGA ARTG XLSX export is an operator action, not measurable from a shell.
- No regulator was tested through the cluster, Tatu or Silverfin, per the brief.
- NMPA is the only measured identity-blocked endpoint. Whether a Playwright fetch succeeds there is not measured.
- Airbyte and Meltano maintenance was not measured; both are candidates only.
- Commit counts are capped at 100 by `per_page`; 100 means "100 or more".

No action is pending.
