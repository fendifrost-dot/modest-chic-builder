# Pre-Deployment Snapshot — bemoremodest.com

**Capture timestamp (UTC):** 2026-08-20T12:54:04Z
**Purpose:** Step 0 of Deployment Phase 1A. Verification only — nothing was changed on production
before or during this capture.
**Relationship to baseline:** This is an *append-only* record taken immediately before the Phase 1A
intervention. It does not replace, edit or supersede the 2026-08-19 research baseline.

Raw HTTP bodies for every probed URL are stored verbatim in `./raw/`.

---

## 1. Method

* Plain `curl` — **no JavaScript execution**. This is what a non-rendering crawler/retriever sees.
* User-agent: `Mozilla/5.0 (compatible; Modest-SEO-Baseline/1.0)`
* 20 URLs probed: 10 real app routes, 3 product routes, 3 foreign-namespace probes,
  3 static text assets, 1 deliberately non-existent route.

---

## 2. Confirmation of 2026-08-19 findings

Every finding from the 2026-08-19 baseline is **still present and unchanged**.

| # | 2026-08-19 finding | 2026-08-20 status | Evidence |
|---|---|---|---|
| 1 | Interior canonicals point to the homepage | **CONFIRMED — unchanged** | Every route's raw HTML carries `<link rel="canonical" href="https://bemoremodest.com/">` |
| 2 | Interior `og:url` points to the homepage | **CONFIRMED — unchanged** | Every route's raw HTML carries `<meta property="og:url" content="https://bemoremodest.com/">` |
| 3 | Identical metadata on all routes | **CONFIRMED — unchanged** | All 18 HTML responses are byte-identical: md5 `8536abca75f9d374ff3c2009e938c425`, 2661 bytes each |
| 4 | Raw HTML retrieval returns an empty shell | **CONFIRMED — unchanged** | `<body>` contains only `<div id="root"></div>` + script tags. Zero route content. |
| 5 | No structured data in raw HTML | **CONFIRMED — unchanged** | `grep -c "ld+json"` = **0** on every raw response, including the homepage and product pages |
| 6 | `/product/` vs `/products/` ambiguity | **CONFIRMED — and characterised further, see §4** | `/products/<handle>` returns HTTP 200 (soft-200) instead of 404 |
| 7 | Custom collections vs Shopify `/collections/` | **CONFIRMED — and characterised further, see §4** | `/collections/mens` and `/collections/all` return HTTP 200 (soft-200) |
| 8 | robots.txt | **CONFIRMED — unchanged** | Byte-identical to `public/robots.txt` at repo HEAD. Allows all major search + AI crawlers. Declares sitemap. |
| 9 | sitemap.xml | **CONFIRMED — unchanged** | Byte-identical to `public/sitemap.xml` at repo HEAD. 38 URLs (17 static + 21 product). |

**Differences from the 2026-08-19 baseline: NONE.** No drift detected in metadata, retrieval
behaviour, schema, robots.txt or sitemap.xml.

Nothing was "silently fixed" during this verification pass. All defects listed above were left
exactly as found and are addressed only in the Phase 1A implementation that follows this capture.

---

## 3. Production ↔ repository sync check

Production is serving repository `main` HEAD (`b01acd3`).

* `index.html` at HEAD is byte-identical to the live shell, except for the build-injected
  `<script type="module" crossorigin src="/assets/index-B_Uou10U.js">`, the built stylesheet
  `/assets/index-BxCxmtas.css`, and a Lovable analytics tag `/~flock.js`.
* `public/sitemap.xml` — identical to live.
* `public/robots.txt` — identical to live.
* `public/llms.txt` — identical to live.

This means the repository is a faithful pre-image of production, and changes committed here are the
correct and only lever for the Phase 1A intervention.

---

## 4. HTTP status matrix (raw, no JS)

| URL | Status | Bytes | Canonical served | Notes |
|---|---|---|---|---|
| `/` | 200 | 2661 | `https://bemoremodest.com/` | correct by accident (it is the homepage) |
| `/about` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/mens` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/womens` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/accessories` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/new-arrivals` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/sale` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/contact` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/faq` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/size-guide` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/product/big-bear-cashmere-sweater` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/product/ketchup-mustard-varsity-jacket` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/product/unisex-jersey-short-sleeve-tee` | 200 | 2661 | `https://bemoremodest.com/` | wrong canonical |
| `/products/big-bear-cashmere-sweater` | 200 | 2661 | `https://bemoremodest.com/` | **route does not exist** — soft-200 |
| `/collections/mens` | 200 | 2661 | `https://bemoremodest.com/` | **route does not exist** — soft-200 |
| `/collections/all` | 200 | 2661 | `https://bemoremodest.com/` | **route does not exist** — soft-200 |
| `/this-route-does-not-exist-xyz` | 200 | 2661 | `https://bemoremodest.com/` | **soft-404** — any URL returns 200 |
| `/robots.txt` | 200 | 444 | n/a | |
| `/sitemap.xml` | 200 | 4577 | n/a | |
| `/llms.txt` | 200 | 1520 | n/a | |

Cause: `public/_redirects` contains a single rule, `/*  /index.html  200`. Every path — real,
foreign-namespace or entirely invented — is answered with the same 200 + shell.

---

## 5. NEW finding — duplicate public storefront on the myshopify domain

Not recorded in the 2026-08-19 baseline; discovered during this capture and reported without
remediation (remediation is outside this repository).

Shopify Storefront API `shop.primaryDomain` reports:

```
{"name":"Modest Streetwear Apparel",
 "primaryDomain":{"url":"https://modest-streetwear-apparel.myshopify.com",
                  "host":"modest-streetwear-apparel.myshopify.com"}}
```

The `.myshopify.com` storefront is **publicly reachable and self-canonicalising**:

| URL | Status | Canonical it declares |
|---|---|---|
| `https://modest-streetwear-apparel.myshopify.com/products/big-bear-cashmere-sweater` | 200 | *itself* |
| `https://modest-streetwear-apparel.myshopify.com/collections/all` | 200 | *itself* |

This creates a complete second, fully-rendered, server-side copy of all 21 products competing with
bemoremodest.com — with the advantage that the Shopify copy currently *does* serve correct
per-product canonicals, titles and structured data while bemoremodest.com does not.

**This cannot be fixed from this repository.** See the deployment report, section E.

---

## 6. Commerce source of truth (read-only probe)

Shopify Storefront API, 2025-07, public token.

* 21 products, all `availableForSale: true`, all with real SKUs and USD prices.
* 7 collections: `frontpage` (MENS), `womens`, `sale` (30% OFF SALE), `all` (ALL),
  `accessories`, `new-arrivals`, `heart-chakra-collection` (Essentials).
* `unauthenticated_read_product_inventory` scope is **not** granted to the public token —
  `totalInventory` is inaccessible. Availability is therefore taken from `availableForSale`.

---

## 7. Contact-surface check (pre-deployment)

* Public phone number anywhere in raw HTML, repo source, `llms.txt` or schema: **none found.**
* `support@bemoremodest.com` anywhere in raw HTML, repo source, `llms.txt` or schema: **none found.**
* Only published address is `info@bemoremodest.com`.

The 773 number present in third-party data does not appear anywhere in this property and was not
introduced.
