# Structured data inventory

Status: implemented in Phase 1A, 2026-08-20.
Builders: `src/seo/schema.js` — one implementation, used by both the React components
(`src/components/JsonLd.tsx`) and the prerenderer (`scripts/prerender.mjs`), so the rendered DOM
and the raw HTML emit the same graph.

---

## 1. Type → routes → source of values

| Schema type | Routes | Source of values | Notes |
|---|---|---|---|
| `Organization` + `ClothingStore` | all 38 | `src/seo/brand.js` (directive-supplied facts) | `@id` `…/#organization` |
| `Brand` | all 38 | `src/seo/brand.js` | `@id` `…/#brand`; every Product references it |
| `Person` (founder) | all 38 | `src/seo/brand.js` | `@id` `…/#founder`; Terrence Cleveland |
| `WebSite` | all 38 | `src/seo/brand.js` | `@id` `…/#website`; publisher → Organization |
| `WebPage` | `/` | `src/seo/routes.js` | |
| `AboutPage` | `/about` | `src/seo/routes.js` | |
| `ContactPage` | `/contact` | `src/seo/routes.js` | |
| `WebPage` | 9 remaining info routes | `src/seo/routes.js` | shipping, returns, size-guide, privacy, terms, careers, press, sustainability |
| `FAQPage` | `/faq` | `src/seo/routes.js` (the 5 published Q&As) | in addition to the route's `WebPage` |
| `CollectionPage` + `ItemList` | `/mens`, `/womens`, `/accessories`, `/new-arrivals`, `/sale` | Shopify Storefront API, live at build time | list members are `Product` nodes with real offers |
| `Product` + `Offer` / `AggregateOffer` | 21 product routes | Shopify Storefront API, live at build time | |
| `BreadcrumbList` | all 38 | `src/seo/routes.js` + product handle | |

## 2. Organization node — field by field

| Property | Value | Source |
|---|---|---|
| `name` | `Modest` | directive: canonical machine-readable brand |
| `alternateName` | `MOD#$T`, `Be More Modest`, `BeMoreModest` | directive (display styling) + names already in use |
| `legalName` | `Modest Streetwear Apparel Inc.` | directive |
| `url` | `https://bemoremodest.com` | directive |
| `email` | `info@bemoremodest.com` | directive — the only public address |
| `foundingDate` | `2017-09` | directive |
| `founder` | → `Person` `Terrence Cleveland` | directive |
| `address` | `addressLocality: Chicago`, `addressRegion: IL`, `addressCountry: US` | directive. **No `streetAddress`** |
| `foundingLocation` | same locality/region/country | directive |
| `areaServed` | `US` | carried forward from the pre-existing graph |
| `priceRange` | `$$` | carried forward from the pre-existing graph |
| `contactPoint` | customer support, email only | derived from the published email |
| `sameAs` | Instagram, X/Twitter, TikTok `@bemoremodest` | carried forward — **see caveat below** |
| `telephone` | **absent by design** | directive: no public phone number |

Not present anywhere in the graph: any telephone property, `support@bemoremodest.com`, the 773
number found in third-party data, or any reference to Fendi Frost. All four are asserted by
automated test (`src/test/seo-entity.test.ts`) and re-checked on every route by
`scripts/verify-seo.mjs`.

**`sameAs` caveat.** These three URLs were already published in production before this phase and
are carried forward unchanged — Phase 1A asserts nothing new about them. They could not be
independently re-verified from this environment (Instagram returns a login wall to datacenter IPs;
TikTok and X return generic shells). They should be confirmed as officially owned Modest accounts
before the next round.

## 3. Product node — field by field

Every value comes from the Shopify Storefront API at build time. Nothing is inferred.

| Property | Source | Emitted when |
|---|---|---|
| `name` | `product.title` | always |
| `description` | derived — see §4 | always |
| `url`, `@id` | canonical product URL | always |
| `image` | `product.images` (up to 10) | always |
| `sku` | `variant.sku` | only when the merchant has a real SKU. A Shopify variant GID is never substituted |
| `material` | Shopify **tags**, matched against a fixed whitelist (cotton, cashmere, wool, leather, denim, linen, silk) | only when the merchant tagged the material |
| `brand` | → shared `Brand` `@id` | always |
| `offers.price` | first available variant price | single-variant products |
| `offers.lowPrice` / `highPrice` / `offerCount` | across all variants | multi-variant products (`AggregateOffer`) |
| `offers.priceCurrency` | variant currency (`USD`) | always |
| `offers.availability` | `availableForSale` → `InStock` / `OutOfStock` | always |
| `offers.seller` | → `Organization` `@id` | always |
| `hasVariant` | per-variant name, sku, colour, size, image, price, availability | when variants exist |

Deliberately **not** emitted: `aggregateRating`, `review`, `itemCondition`, `countryOfOrigin`,
`manufacturer`, `award`, or any sustainability, scarcity or handmade attribute. None of these are
verifiable from the product source of truth. Their absence is asserted by test.

`material` is taken from tags rather than titles on purpose. The Big Bear Cashmere Sweater is
tagged only `mens`/`womens`, so it publishes **no** material claim despite "Cashmere" appearing in
its name — a guess from a product title is not a verified fact.

## 4. Product description derivation

`src/seo/product-meta.js`, used identically by the app and the prerenderer.

| Order | Rule | Products affected |
|---|---|---|
| 1 | Shopify `seo.description` when set | 0 (none are set) |
| 2 | The merchant description verbatim | 15 |
| 3 | The merchant description with a leading size-chart dump skipped | 5 |
| 4 | A line composed only of real fields — title, product type, price, currency | 1 (held, see §5) |

Rule 3 exists because five descriptions begin `S M L XL 2XL 3XL Width, in 18.25 20.25 …`. Used
verbatim, two of them produced byte-identical meta descriptions. After Phase 1A all 38 routes have
unique descriptions.

## 5. Publication hold

One product's merchant description names an entity under an explicit publication hold. Its
description is kept off machine-readable surfaces — meta description, JSON-LD and prerendered HTML
all use the composed factual line instead. The storefront itself still renders the merchant's
description unchanged; this suppresses a signal, it never adds one.

The hold is declared by product handle in `src/seo/product-meta.js` so the held phrase is never
bundled into the client JavaScript. `scripts/hold-audit.mjs` holds the phrase list, runs on every
build, and fails the build if the declared list and the live catalogue disagree in either
direction. Emptying `HELD_PRODUCT_HANDLES` lifts the hold.

## 6. Validation

| Method | Result |
|---|---|
| JSON parses on every route | 38/38 |
| Organization node present, entity fields correct, on every gate route | 10/10 |
| No `telephone`, no `support@`, no Fendi Frost, on every gate route | 10/10 |
| Referential integrity — every `@id` reference resolves to a defined node | checked in `src/test/seo-entity.test.ts` |
| Exactly one copy of the graph in the rendered DOM | verified by headless render; prerendered blocks carry `data-prerendered-ld` and are retired by `SeoHead` on mount |
| `scripts/verify-seo.mjs` | 148/148 checks passed |

Not yet run: Google Rich Results Test and Schema.org validator against the live URLs. Those
require the deployed site — see the deployment report, section E.
