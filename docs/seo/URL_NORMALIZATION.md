# URL normalization map

Status: implemented in Phase 1A, 2026-08-20.

---

## 1. Which namespace is authoritative

There are two live namespaces describing the same 21 products.

| Namespace | Where it is served | Behaviour before Phase 1A |
|---|---|---|
| `bemoremodest.com/product/<handle>` (singular) | this repository's React app | HTTP 200, homepage canonical, no content in raw HTML |
| `modest-streetwear-apparel.myshopify.com/products/<handle>` (plural) | Shopify's own storefront | HTTP 200, **self-canonicalising**, fully server-rendered |

The Shopify Storefront API reports:

```
shop.primaryDomain = { url: "https://modest-streetwear-apparel.myshopify.com",
                       host: "modest-streetwear-apparel.myshopify.com" }
```

**Decision: `bemoremodest.com` is authoritative, and the singular `/product/<handle>` is the
authoritative product namespace.**

Reasoning:

* `bemoremodest.com` is the brand's stated website and the entity's `url` in structured data.
  Consolidating onto Shopify's machine domain would attribute the catalogue to
  `modest-streetwear-apparel.myshopify.com`, which is the opposite of the Phase 1A objective.
* The singular form is already the live URL shape: it is what the app links to, what the sitemap
  lists, and what any existing external link or crawl history points at. Migrating 21 product URLs
  to the plural form would discard that history to gain nothing — the plural form has no advantage
  beyond matching Shopify's internal convention.
* One namespace had to win outright. Serving content at both would have produced exactly the
  competing canonicals the directive forbids.

## 2. Redirect map

Implemented twice, deliberately:

* `public/_redirects` — 301 at the edge. This is the real fix.
* `src/App.tsx` — client-side `<Navigate replace>` for the same paths. A safety net in case the
  host does not apply `_redirects`; it keeps the URL correct in the browser even if the edge rule
  never fires.

| From | To | Code |
|---|---|---|
| `/products/<handle>` | `/product/<handle>` | 301 |
| `/products` | `/new-arrivals` | 301 |
| `/collections/frontpage` | `/mens` | 301 |
| `/collections/mens` | `/mens` | 301 |
| `/collections/womens` | `/womens` | 301 |
| `/collections/accessories` | `/accessories` | 301 |
| `/collections/new-arrivals` | `/new-arrivals` | 301 |
| `/collections/sale` | `/sale` | 301 |
| `/collections/all` | `/` | 301 |
| `/collections/heart-chakra-collection` | `/` | 301 |
| `/collections/*` (anything else) | `/` | 301 |
| `/collections` | `/` | 301 |

`/collections/frontpage` maps to `/mens` because `frontpage` is the Shopify handle the `/mens`
route already reads its products from — the two are the same collection under different names.

## 3. Canonical URL form

Every indexable route carries a self-referencing canonical. The canonical form is:

* absolute, on `https://bemoremodest.com`
* no trailing slash, except the root, which is `https://bemoremodest.com/`
* no query string and no fragment — `canonicalPath()` in `src/seo/brand.js` strips both, so
  `/mens?utm_source=ig` and `/mens#shop` both canonicalise to `https://bemoremodest.com/mens`
* percent-encoded — one Shopify handle contains a `™`, so
  `/product/unisex-heavy-blend™-hooded-sweatshirt` is published as
  `https://bemoremodest.com/product/unisex-heavy-blend%E2%84%A2-hooded-sweatshirt`

## 4. Route inventory

| Route pattern | Count | Canonical | In sitemap |
|---|---|---|---|
| `/` | 1 | self | yes |
| `/mens`, `/womens`, `/accessories`, `/new-arrivals`, `/sale` | 5 | self | yes |
| `/about`, `/contact`, `/shipping`, `/returns`, `/size-guide`, `/faq`, `/privacy`, `/terms`, `/careers`, `/press`, `/sustainability` | 11 | self | yes |
| `/product/<handle>` | 21 | self | yes |
| `/products/*`, `/collections/*` | — | n/a (301) | no |
| anything else | — | homepage (SPA fallback) | no |

38 indexable URLs in total, all prerendered and all listed in `sitemap.xml`.

## 5. Duplicate that this repository cannot close

`modest-streetwear-apparel.myshopify.com` remains publicly reachable and self-canonicalising. It
is a complete second copy of the catalogue and it is not addressable from this codebase. Closing it
is a Shopify admin action — see the deployment report, section E.
