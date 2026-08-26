# Deployment report — Phase 1A: technical retrieval foundation

**Property:** bemoremodest.com
**Branch:** `claude/modest-seo-phase-1a-tyvsql`
**Pre-deployment capture:** 2026-08-20T12:54:04Z
**Implementation completed:** 2026-08-20T13:28:00Z
**Live publish:** *pending — see §F*

Phase 1A makes the site's existing pages individually crawlable, indexable, machine-readable and
correctly attributed to Modest. No held material was deployed. The stop condition is respected: no
Phase 1B content, no new category pages, no Fendi Frost integration, no outreach.

---

## Step 0 — pre-deployment verification

Full record: `docs/seo/captures/2026-08-20-pre-deployment/SNAPSHOT.md`, raw bodies in `raw/`.

All nine 2026-08-19 findings were re-tested against live production and **all nine still held,
unchanged**. Production was confirmed to be serving repository HEAD (`b01acd3`), so the repository
was a faithful pre-image of production. **No drift from the 2026-08-19 baseline was found, and
nothing was silently fixed during verification.**

The single hard number that characterises the whole problem: **all 18 HTML responses probed —
homepage, categories, products, info pages, foreign namespaces and a deliberately non-existent URL
— were byte-identical.** md5 `8536abca75f9d374ff3c2009e938c425`, 2661 bytes, zero JSON-LD, empty
`<body>`.

One finding **new** to this capture and not in the 2026-08-19 baseline is recorded in §E-1.

---

## A. What changed

### New — shared source of truth

Everything below reads from one place, so the app, the prerenderer and the sitemap can no longer
drift apart.

| File | Purpose |
|---|---|
| `src/seo/brand.js` | Canonical Modest entity facts. Enforces: `Modest` as the machine-readable name, `info@` as the only address, **no telephone property**, no Fendi Frost in `sameAs`. Also owns canonical-URL normalisation. |
| `src/seo/routes.js` | Route manifest — path, unique title, unique description, on-page copy and schema type for all 17 non-product routes, plus the Shopify collection-handle redirect map. |
| `src/seo/schema.js` | Every JSON-LD builder. One implementation shared by the React components and the prerenderer. |
| `src/seo/product-meta.js` | Derives product descriptions from Shopify. Skips size-chart dumps; applies the publication hold by product handle. |

### New — build pipeline

| File | Purpose |
|---|---|
| `scripts/prerender.mjs` | **The core fix.** Runs as `postbuild`. Writes a real HTML file per route into `dist/` with a self-referencing canonical, unique metadata, the route's JSON-LD and the route's actual text and links. |
| `scripts/shopify-build.mjs` | Build-time Storefront reads, mirroring the client's queries so prerendered and rendered content describe the same products. |
| `scripts/hold-audit.mjs` | Holds the held-phrase list (build-only, never bundled). Fails the build if the declared hold and the live catalogue disagree in either direction. |
| `scripts/verify-seo.mjs` | The verification gate as a re-runnable script. Point it at any base URL. |

### Modified

| File | Change | Why |
|---|---|---|
| `src/components/SeoHead.tsx` | Canonical is normalised and always self-referencing; `og:image` handled absolutely; retires prerendered JSON-LD on mount | the universal metadata shell; and to stop the graph being emitted twice |
| `src/components/JsonLd.tsx` | Reduced to thin wrappers over `src/seo/schema.js` | one schema implementation, not two |
| `src/pages/Collection.tsx` | Reads the route manifest | metadata was inline and partially duplicated |
| `src/pages/InfoPage.tsx` | Reads the route manifest; adds `WebPage`/`AboutPage`/`ContactPage` and breadcrumbs | descriptions were a truncated slice of body copy |
| `src/pages/ProductDetail.tsx` | Shared description derivation; **real SKUs only**; material from merchant tags | it was emitting a Shopify variant GID as `sku` |
| `src/pages/Index.tsx` | Homepage metadata from the manifest; adds `WebPage` + breadcrumb | |
| `src/App.tsx` | Routes generated from the manifest; adds `/products/*` and `/collections/*` redirects | namespace consolidation |
| `src/components/ProductGrid.tsx` | Richer `ItemList` (real price/currency/availability per member); renders category intro copy | collection pages had no prose |
| `src/lib/shopify.ts` | Product query now also returns `tags` and `productType` | needed for verified `material` |
| `src/lib/site.ts` | Now re-exports `src/seo/brand.js` | keeps every existing import working |
| `public/_redirects` | 12 namespace 301s ahead of the SPA fallback | |
| `scripts/generate-sitemap.mjs` | Reads the route manifest; percent-encodes URLs; adds priorities | sitemap could drift from the real routes |
| `package.json` | Adds `postbuild` | |
| `tsconfig.app.json` | `allowJs: true` | the shared modules are `.js` so Node can read them directly |

### New tests

`src/test/seo-entity.test.ts` (27), `src/test/seo-head.test.tsx` (6), `src/test/url-namespace.test.tsx` (6).
Suite total: **83 tests, 10 files, all passing** (was 44). Lint: **21 problems, down from 22 at
baseline** — no new error classes introduced.

---

## B. Before → after evidence

Raw HTTP, no JavaScript executed. Before: `captures/2026-08-20-pre-deployment/raw/`.
After: `captures/2026-08-20-post-build/raw/`.

### `/` (homepage)

| | Before | After |
|---|---|---|
| title | `MOD#$T \| Premium Luxury Streetwear - Be More Modest` | `MOD#$T (Modest) \| Chicago Streetwear — Cashmere, Varsity Jackets & Tees` |
| canonical | `https://bemoremodest.com/` | `https://bemoremodest.com/` |
| raw text | 0 chars | 1,689 chars |
| JSON-LD | 0 blocks | 3 blocks |

### `/about`

| | Before | After |
|---|---|---|
| title | `MOD#$T \| Premium Luxury Streetwear - Be More Modest` | `About Modest \| MOD#$T` |
| canonical | `https://bemoremodest.com/` ❌ | `https://bemoremodest.com/about` ✅ |
| og:url | `https://bemoremodest.com/` ❌ | `https://bemoremodest.com/about` ✅ |
| description | site-wide default | `MOD#$T (Modest) is a streetwear label founded in September 2017 by Terrence Cleveland and based in Chicago, Illinois. Legal entity: Modest Streetwear Apparel Inc.` |
| raw text | 0 chars | 1,112 chars |
| JSON-LD | 0 | `Organization`+`Brand`+`Person`+`WebSite`, `AboutPage`, `BreadcrumbList` |

### `/mens`

| | Before | After |
|---|---|---|
| title | site-wide default | `Men's Streetwear \| MOD#$T` |
| canonical | `https://bemoremodest.com/` ❌ | `https://bemoremodest.com/mens` ✅ |
| raw text | 0 chars | 1,355 chars, including all 16 collection members with prices and stock state |
| internal links | 0 | 37 |
| JSON-LD | 0 | entity graph, `CollectionPage`+`ItemList`, `BreadcrumbList` |

### `/product/big-bear-cashmere-sweater`

| | Before | After |
|---|---|---|
| title | site-wide default | `Big Bear Cashmere Sweater \| MOD#$T` |
| canonical | `https://bemoremodest.com/` ❌ | `https://bemoremodest.com/product/big-bear-cashmere-sweater` ✅ |
| description | site-wide default | `Wrap yourself in luxury with the Big Bear Cashmere Sweater, a timeless unisex piece designed to elevate your…` |
| raw text | 0 chars | 1,405 chars |
| Product schema | none | `Product` + `AggregateOffer`, `$550.00 USD`, `InStock`, SKU `1cashmere1F-1`, 7 images, 10 variants |

Raw HTML now contains, per route, the h1, the route's prose, the product list or product facts,
and 21–42 internal links. Rendered-DOM equivalence was confirmed by headless Chromium on `/about`
and `/mens`: title, canonical, `og:url` and description match the raw HTML exactly, and exactly one
copy of the JSON-LD graph survives after React mounts.

---

## C. URL normalization map

Full document: `docs/seo/URL_NORMALIZATION.md`.

**`bemoremodest.com` is authoritative. The singular `/product/<handle>` is the authoritative
product namespace.** The plural form is Shopify's internal convention and carries no crawl history
for this domain; migrating 21 live URLs to it would discard history to gain nothing.

| From | To | Code |
|---|---|---|
| `/products/<handle>` | `/product/<handle>` | 301 |
| `/products` | `/new-arrivals` | 301 |
| `/collections/frontpage`, `/collections/mens` | `/mens` | 301 |
| `/collections/womens` | `/womens` | 301 |
| `/collections/accessories` | `/accessories` | 301 |
| `/collections/new-arrivals` | `/new-arrivals` | 301 |
| `/collections/sale` | `/sale` | 301 |
| `/collections/all`, `/collections/heart-chakra-collection`, `/collections/*`, `/collections` | `/` | 301 |

Implemented twice on purpose: as edge 301s in `public/_redirects`, and as client-side redirects in
`src/App.tsx` as a safety net if the host does not apply that file.

Canonical form: absolute, no trailing slash except root, query string and fragment stripped,
percent-encoded (one handle contains `™`).

38 indexable URLs; all prerendered, all in the sitemap, none in a foreign namespace.

---

## D. Schema inventory

Full document: `docs/seo/SCHEMA_INVENTORY.md`.

| Schema type | Routes | Source of values | Validation |
|---|---|---|---|
| `Organization` + `ClothingStore` | 38 | `src/seo/brand.js` (directive facts) | fields asserted per route by `verify-seo.mjs`; 10/10 |
| `Brand` | 38 | `src/seo/brand.js` | referenced by every Product |
| `Person` (Terrence Cleveland) | 38 | `src/seo/brand.js` | |
| `WebSite` | 38 | `src/seo/brand.js` | publisher resolves to Organization |
| `WebPage` / `AboutPage` / `ContactPage` | 12 | `src/seo/routes.js` | |
| `FAQPage` | `/faq` | 5 published Q&As | |
| `CollectionPage` + `ItemList` | 5 | Shopify, live at build | members carry real price/currency/availability |
| `Product` + `Offer`/`AggregateOffer` | 21 | Shopify, live at build | |
| `BreadcrumbList` | 38 | route manifest | |

Organization publishes: `name: Modest`, `alternateName: [MOD#$T, …]`,
`legalName: Modest Streetwear Apparel Inc.`, `foundingDate: 2017-09`, founder Terrence Cleveland,
Chicago/IL/US **with no street address**, `email: info@bemoremodest.com`.
**No `telephone` property exists anywhere in the graph.**

Product publishes only: name, description, images, brand, real SKU, price, currency, availability,
canonical URL, and material *only* where the merchant tagged it. Deliberately absent and
test-asserted: `aggregateRating`, `review`, `itemCondition`, `countryOfOrigin`, `manufacturer`,
`award`, and any sustainability, scarcity or handmade attribute.

The Big Bear Cashmere Sweater publishes **no** `material` — it is tagged only `mens`/`womens`, and
inferring "cashmere" from the product title would be a guess, not a verified fact.

Validation performed: JSON parses on 38/38 routes; Organization fields correct on 10/10 gate
routes; no telephone / `support@` / Fendi Frost on 10/10; referential integrity of every `@id`
asserted by test; single graph copy in rendered DOM confirmed by headless render.
Google Rich Results Test and the Schema.org validator have **not** been run — they need live URLs
(§E-5).

---

## E. Errors and unresolved issues

### E-1. A second, competing storefront that this repository cannot close — **highest priority**

Discovered during Step 0; not in the 2026-08-19 baseline.

`modest-streetwear-apparel.myshopify.com` is publicly reachable, **self-canonicalising**, and
server-renders all 21 products with correct titles and structured data:

```
GET .../products/big-bear-cashmere-sweater  → 200, canonical: itself
GET .../collections/all                     → 200, canonical: itself
shop.primaryDomain                          → modest-streetwear-apparel.myshopify.com
```

Until Phase 1A publishes, that copy is objectively the better-optimised of the two — which is a
plausible contributor to Modest's weak entity attribution. Phase 1A fixes bemoremodest.com but
cannot touch the Shopify-hosted duplicate.

**Required action, outside this repository:** in Shopify admin, set `bemoremodest.com` as the
store's primary domain (Shopify then 301s the `.myshopify.com` URLs to it), or disable/password-
protect the Online Store sales channel if the storefront is not meant to be public. This is a
Shopify admin action, not a Lovable or code change. Recommend doing it **before or with** the
Phase 1A publish so the two consolidate together.

### E-2. Host precedence for prerendered files is unverified

The design assumes the host serves a real file (`/about/index.html`) ahead of the
`/*  /index.html  200` SPA rule — standard for Netlify, Cloudflare Pages and Vercel, but Lovable's
hosting behaviour has not been observed. Both `/<route>/index.html` and `/<route>.html` are emitted
to cover either convention.

**The failure mode is benign:** if the host ignores the prerendered files entirely, every route
falls back to `dist/index.html`, which is the prerendered *homepage* — that is exactly the Round 0
behaviour, plus a valid Organization graph. Nothing regresses. But the whole non-JS retrieval fix
would be silently inert.

**This must be checked first thing after publish** by running
`node scripts/verify-seo.mjs --base https://bemoremodest.com`. If `/about` comes back with the
homepage canonical, the prerendered files are not being served and the fix needs a hosting-level
follow-up.

### E-3. A product description is held back, pending your ruling

`nutrition-album-tee`'s Shopify description opens: *"Official T-Shirt of [held entity] NUTRITION
ALBUM."* It is the only product in the catalogue that matches.

Publishing it into Product schema, the meta description and prerendered HTML would create exactly
the kind of new machine-readable Modest-side association the HOLD guards against — so I did not.
That product's machine-readable surfaces use a composed factual line instead:
`Nutrition Album Tee — t-shirt from MOD#$T (Modest). $40.00 USD.` The storefront still renders the
merchant's description unchanged; this suppresses a signal rather than adding one, and it is the
one place where prerendered body text intentionally differs from the rendered app.

Verified: the held phrase appears **nowhere** in `dist/` — not in HTML, not in JSON-LD, not in the
JavaScript bundle (the hold is declared by product handle precisely so the phrase never ships).

**This is your call, not mine.** Three options: leave the hold (current state); lift it by emptying
`HELD_PRODUCT_HANDLES` in `src/seo/product-meta.js`; or change the description in Shopify so the
question disappears. Note the phrase is already public on the `.myshopify.com` storefront and in
the live rendered app, so the hold limits amplification, not first publication.

### E-4. Soft-404s are unresolved

An arbitrary URL still returns HTTP 200. It now serves the prerendered homepage, whose canonical
points at `https://bemoremodest.com/` — so it self-consolidates rather than being indexed as a
duplicate, and the SPA renders a `noindex` 404 page once JavaScript runs. That is an improvement,
but it is not a real 404.

A true fix means changing the SPA fallback's status code or pointing it at a dedicated `noindex`
fallback file. Both depend on the host precedence in E-2 being confirmed first: getting it wrong
would 404 or de-index the entire site. **Deferred deliberately** — recommend fixing in Phase 1B
once E-2 has an empirical answer.

### E-5. Validation not yet possible from this environment

* **Google Rich Results Test / Schema.org validator** — need live URLs. Run after publish.
* **Rendered-DOM check of product and collection pages** — the sandbox's headless Chromium cannot
  reach the Shopify Storefront API through the agent proxy. Confirmed environmental, not a code
  defect: rendering **unchanged live production** in the same browser also returned zero products.
  `/about` and `/mens` head tags were verified by headless render; the product-page rendering path
  is covered by the jsdom suite instead. Re-check a product page in a real browser after publish.
* **`sameAs` social accounts** — Instagram returns a login wall to datacenter IPs; TikTok and X
  return generic shells. The three URLs were already live before this phase and are carried forward
  unchanged, so Phase 1A asserts nothing new — but please confirm they are officially owned Modest
  accounts before Round 2.

### E-6. Two content mismatches found but deliberately not changed

Both are behavioural, and fixing them would change what shoppers see — outside Phase 1A's scope.

* **`/sale`** queries `tag:sale OR tag:Sale` and returns nothing, because no product carries a
  `sale` tag — the discounts live in product *titles* ("30% OFF - …"). Meanwhile a real Shopify
  collection `sale` ("30% OFF SALE") exists and is unused. The page therefore prerenders as a
  legitimate but thin page showing only its explanatory message.
* **`/new-arrivals`** sorts the whole catalogue by creation date rather than reading the existing
  `new-arrivals` Shopify collection.

Recommend binding both routes to their real Shopify collections in Phase 1B.

### E-7. Minor

* `unauthenticated_read_product_inventory` is not granted to the public Storefront token, so
  `totalInventory` is unreadable. Availability uses `availableForSale`, which is correct but
  coarser — no stock counts are published (and none should be invented).
* Five product descriptions begin with a raw size-chart dump; two were byte-identical. The
  prerenderer skips the table and uses the first real prose. Cleaning these up in Shopify would be
  better than working around them in code.
* `package-lock.json` is out of sync with `package.json` (a pre-existing vitest drift, unrelated to
  this work). `npm ci` fails on it; `npm install` works. Left alone deliberately — Lovable builds
  from `bun.lockb` and touching it was outside scope.
* The homepage `<title>` now leads with `MOD#$T (Modest)` so the machine-readable name co-occurs
  with the display styling on the site's most-linked page. Interior titles keep the shorter
  `… | MOD#$T`. If you would rather every title carry both, that is a one-line change in
  `src/seo/brand.js`.

---

## F. Deployment timestamp

| Event | Timestamp (UTC) |
|---|---|
| Pre-deployment capture | **2026-08-20T12:54:04Z** |
| Implementation complete, verification passed | **2026-08-20T13:28:00Z** |
| Pushed to `claude/modest-seo-phase-1a-tyvsql` | see commit |
| **Live on bemoremodest.com** | **NOT YET — requires Lovable Publish** |

**The observation period does not start until Lovable Publish.** Per the repository's chain of
command, code lands on GitHub but the frontend only goes live through Lovable **Publish** — which I
cannot trigger from here. Nothing on bemoremodest.com has changed yet; production is still serving
`b01acd3`, byte-identical to the Round 0 baseline.

To open the observation period:

1. Merge this branch to `main`.
2. **Lovable → Publish.** (No edge-function redeploy is needed; nothing here touches edge functions,
   Supabase or secrets.)
3. Run `node scripts/verify-seo.mjs --base https://bemoremodest.com --json round-1-live.json` —
   this is also the E-2 check.
4. Record the publish timestamp in `docs/seo/MEASUREMENT_TRACKER.md` under Round 1. **That**
   timestamp is the start of Modest's first technical observation period.

---

## G. Measurement tracker

Appended as **Round 1** in `docs/seo/MEASUREMENT_TRACKER.md`. Round 0 is recorded as immutable and
was not rewritten.

Headline movement (built artifact, pending live confirmation):

| Metric | Round 0 | Round 1 |
|---|---|---|
| Distinct raw-HTML responses across all routes | 1 | 38 |
| Self-referencing canonicals | 1 / 38 | 38 / 38 |
| Unique titles / descriptions | 1 / 38 | 38 / 38 |
| Routes with content in raw HTML | 0 / 38 | 38 / 38 |
| Product/Offer schema in raw HTML | 0 / 21 | 21 / 21 |
| Organization entity in raw HTML | absent | 38 / 38 |
| Foreign-namespace URLs | 200 soft-200 | 301 |
| Public phone / `support@` exposed | none | none |

A caveat worth stating plainly: the tracker file did not exist in this repository. Round 0 there is
reconstructed from the 2026-08-20 re-measurement that confirmed the 2026-08-19 findings unchanged —
it is not a copy of the original baseline document. If the canonical M-L tracker lives outside this
repo, reconcile the two before Round 2.

---

## Stop condition

Stopped at the Phase 1A verification gate as instructed. **Not** done, and awaiting your direction:
the four new category pages, the rabbit-fur editorial, hero-product rewrites, notable-wearer
material, external authority and backlink outreach, and every Fendi Frost connection.

Returned to Fendi for review.
