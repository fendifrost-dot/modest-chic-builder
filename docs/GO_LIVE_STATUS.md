# Go-Live Status — bemoremodest.com (confirmed 2026-07-01)

**Source of truth:** Lovable status report + live DNS/HTTP verification.  
**Do not treat older checklists as pending if this doc says ✅.**

---

## Current state (verified)

| Item | Status | Evidence |
|------|--------|----------|
| Live domain serves Lovable app | ✅ | `dig bemoremodest.com` → `185.158.133.1`; `curl -I https://bemoremodest.com` → HTTP 200 + HSTS |
| `www.bemoremodest.com` | ✅ | A → `185.158.133.1` |
| Lovable published URL | ✅ | `https://modest-chic-builder.lovable.app` |
| Custom domain in Lovable | ✅ | `bemoremodest.com` + `www` attached, SSL active |
| Shopify theme cutover | ✅ | DNS no longer points at Shopify; site is this React storefront |
| Commerce backend | ✅ | Shopify Storefront API + hosted checkout (`channel=online_store`) |
| Shopify store domain | ✅ | **`modest-streetwear-apparel.myshopify.com`** (not `bemoremodest.myshopify.com`) |
| Shopify primary domain | ✅ | `modest-streetwear-apparel.myshopify.com` |
| `bemoremodest.com` in Shopify | ⚠️ | Still listed as **redirecting** domain — harmless; optional cleanup |
| Lovable Cloud (Supabase) | ✅ | Enabled; `project-stats` edge function only — **not** commerce |
| GitHub push → live | ❌ | Push syncs code; **Publish** is a separate manual step |

---

## Architecture (no guessing)

```
https://bemoremodest.com  →  Lovable-hosted React app (this repo)
                                    │
                                    ├─► Shopify Storefront API
                                    │     modest-streetwear-apparel.myshopify.com
                                    │     (products, cart, checkout)
                                    │
                                    ├─► Mailchimp (welcome popup email capture)
                                    │
                                    └─► Lovable Cloud / Supabase
                                          (edge functions only — NOT catalog/checkout)
```

---

## Environment variables (confirmed names)

| Name | Purpose | Set? | Notes |
|------|---------|------|-------|
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API (connector) | ✅ | Server/connector secret — **not** auto-exposed to browser |
| `SHOPIFY_ACCESS_TOKEN` | Admin API | ✅ | Server-only — **never** `VITE_*` |
| `VITE_SUPABASE_*` | Lovable Cloud client | ✅ | Auto-managed — do not edit manually |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Client Storefront token | ❌ | **Not set** — see below |
| `VITE_GA_MEASUREMENT_ID` | GA4 | ❌ | On `perf/site-optimization` branch only |
| `VITE_META_PIXEL_ID` | Meta Pixel | ❌ | On `perf/site-optimization` branch only |

### Storefront token — important clarification

- **`VITE_SHOPIFY_STOREFRONT_TOKEN` is Shopify, not Supabase.**
- Storefront tokens are **designed to be public** (client-side). Not setting `VITE_*` is a **maintainability** issue, not a security blocker.
- Today `src/lib/shopify.ts` falls back to a **hardcoded** token string because `VITE_SHOPIFY_STOREFRONT_TOKEN` is unset.
- **Recommended (in Lovable Project Settings):** add `VITE_SHOPIFY_STOREFRONT_TOKEN` with the **same value** as `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, then re-publish. Optionally remove hardcoded fallback in `shopify.ts` (protected file — requires explicit approval).

---

## What's on `main` vs `perf/site-optimization`

Lovable builds from **`main`**. The perf branch is on GitHub only until merged.

| Feature | `main` (live after Publish) | `perf/site-optimization` |
|---------|----------------------------|---------------------------|
| Optimized WebP hero/collection images | ❌ | ✅ |
| JSON-LD (Org, Product, Breadcrumb) | ❌ | ✅ |
| Favicon / apple-touch-icon / manifest | ❌ | ✅ |
| Stable `og-image.jpg` (1200×630) | ❌ | ✅ |
| `robots.txt` + sitemap | ❌ partial | ✅ (see sitemap caveat) |
| Analytics scaffolding (GA4 / Meta) | ❌ | ✅ (inactive until IDs set) |
| Hero `h1` accessibility fix | ❌ | ✅ |
| `prebuild` + `generate-sitemap.mjs` | ❌ | ✅ |
| `vercel.json` | ⚠️ exists, unused | ✅ removed |

**Live symptoms matching `main`:** `/sitemap.xml` 404, no JSON-LD, no GA4/Meta Pixel, ~4 MB home page images.

### Sitemap caveat (Lovable-confirmed)

`SHOPIFY_STOREFRONT_ACCESS_TOKEN` is **not** available to Node at Vite build time on Lovable — only `VITE_*` vars are inlined into the client bundle. The sitemap script will include **static routes only** unless `VITE_SHOPIFY_STOREFRONT_TOKEN` is set at build time. Product URLs in sitemap require that `VITE_*` var.

---

## Remaining actions (owner)

### Already done — skip these
- ~~Point DNS to Lovable (`185.158.133.1`)~~
- ~~SSL / domain active in Lovable~~
- ~~Shopify primary → `modest-streetwear-apparel.myshopify.com`~~
- ~~End-to-end checkout smoke test~~

### Still to do

1. **Review + merge `perf/site-optimization` → `main`** when approved (image/SEO/analytics fixes).
2. **Click Publish in Lovable** after merge — pushes do **not** auto-publish.
3. **Optional but recommended:** set `VITE_SHOPIFY_STOREFRONT_TOKEN` in Lovable (same value as storefront connector token) → re-publish.
4. **Optional:** set `VITE_GA_MEASUREMENT_ID` / `VITE_META_PIXEL_ID` when ready for analytics.
5. **Optional cleanup:** remove `bemoremodest.com` redirect domain from Shopify Admin (not blocking).
6. **Optional:** remove hardcoded fallback from `src/lib/shopify.ts` after `VITE_*` is set (protected — ask before editing).

---

## Do NOT configure

- ❌ Vercel or external hosting (`vercel.json` is dead weight on `main` — safe to delete)
- ❌ Standalone Supabase project
- ❌ Manual edits to `src/integrations/supabase/client.ts`, `types.ts`, `.env` Supabase keys, `supabase/config.toml`
- ❌ `SHOPIFY_ACCESS_TOKEN` as `VITE_*` (Admin token must never reach the browser)
- ❌ Hand-built checkout URLs or direct `/products/` purchase links

---

## DNS reference (Lovable)

| Type | Host | Value |
|------|------|-------|
| A | `@` | `185.158.133.1` |
| A | `www` | `185.158.133.1` |
| TXT | `_lovable` | verification string from Lovable → Domains |

MX records (Outlook + Zoho) — leave untouched for email.

---

## Publish workflow (every future change)

```
Code change → push/merge to main → Lovable syncs → manual Publish → live at bemoremodest.com
```

Regression checklist after publish: see `docs/SHOPIFY_HANDOFF.md` §6.
