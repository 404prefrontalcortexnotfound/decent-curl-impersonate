"""Article evidence checks from the WHIMH fingerprint probe (2026-09-27).

Visible paragraphs and URL identity are required; subscriber JSON is not extracted.
"""
import hashlib
import html
import re
from urllib.parse import unquote, urlsplit

def plain(s):
    s=re.sub(r'(?is)<(script|style|noscript|svg)\b[^>]*>.*?</\1>', ' ',s)
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()

def assess(body, status, headers, source, url):
    low=body.lower(); title=re.search(r'(?is)<title[^>]*>(.*?)</title>',body)
    title=plain(title.group(1)) if title else ''
    blocker=None
    markers=[('cloudflare', ['cf-chl-','just a moment','cf-mitigated','verify you are human']),('akamai',['reference #','errors.edgesuite.net','akamai bot']),('perimeterx',['px-captcha','perimeterx','human challenge']),('datadome',['geo.captcha-delivery.com','datadome captcha']),('imperva',['incapsula incident','_incapsula_resource','powered by imperva']),('aws_waf',['awswaf','aws-waf-token']),('captcha',['<title>captcha','g-recaptcha'])]
    if headers.get('cf-mitigated')=='challenge': blocker='cloudflare'
    for name, terms in markers:
        if any(t in low for t in terms) and (status>=400 or len(body)<40000 or 'just a moment' in title.lower()): blocker=blocker or name
    paras=[plain(p) for p in re.findall(r'(?is)<p\b[^>]*>(.*?)</p>',body)]
    paras=[p for p in paras if len(p)>100]
    text=' '.join(paras)
    slug=unquote(urlsplit(source['url']).path).lower()
    expected=source.get('title') or slug
    words={w for w in re.findall(r'[a-z]{4,}',expected.lower()) if w not in {'https','www','com','article','fullarticle','content','news','view','with','from','that','this','have','html','default'}}
    matches=sorted(w for w in words if w in (title+' '+text).lower())
    slugwords={w for w in re.findall(r'[a-z]{4,}',slug) if w not in {'index','news','view','article','content','fullarticle','full','html','default','journals','science'}}
    slugmatches=sorted(w for w in slugwords if w in (title+' '+text).lower())
    canonical=re.search(r'(?is)<link\b(?=[^>]*rel=[\"\']canonical[\"\'])[^>]*href=[\"\']([^\"\']+)',body)
    canonical_match=bool(canonical and urlsplit(html.unescape(canonical.group(1))).path.rstrip('/')==urlsplit(url).path.rstrip('/'))
    identity=(len(matches)>=min(3,len(words)) and len(words)>0) or (len(slugmatches)>=min(3,len(slugwords)) and len(slugwords)>0) or canonical_match
    article_tag=bool(re.search(r'(?i)<article\b|"@type"\s*:\s*"(?:NewsArticle|Article|ScholarlyArticle)"',body))
    # Do not extract subscriber-only JSON or treat navigation / app shells as articles.
    paywall=any(s in low for s in ['subscribe to continue reading','subscribe to read the full','purchase this article','sign in to read the full','this article is available to subscribers'])
    missing=bool(re.search(r'(?i)page not found|404 not found|page unavailable|access denied|403 forbidden',title))
    found=status==200 and not blocker and not missing and not paywall and identity and len(text)>=700 and (article_tag or len(text)>=1300)
    # Supplied URLs include home/index pages. Do not call their boilerplate an article.
    landing=urlsplit(source['url']).path in ['/', '/investors/presentations/', '/2025-annual-report/']
    if landing: found=False
    if paywall: blocker='paywall_stop'
    elif missing and not blocker: blocker='not_found' if '404' in title or 'not found' in title.lower() else 'access_denied'
    elif status>=400 and not blocker: blocker=f'http_{status}'
    elif not found and not blocker: blocker='non_article_landing' if landing and status==200 else 'no_verified_article'
    return dict(blocker=blocker,article_found=found,title=title[:240],paragraph_chars=len(text),matched_terms=matches[:12],slug_matches=slugmatches[:12],canonical_match=canonical_match,evidence_excerpt=text[:900],body_sha256=hashlib.sha256(body.encode()).hexdigest())
