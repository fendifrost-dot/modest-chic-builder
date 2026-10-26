# Modest — technical retrieval measurement tracker (M-L)

**Append only.** Round 0 is the immutable pre-intervention baseline and is never rewritten.
Every subsequent round is added below with its own UTC timestamp.

> **Reconciliation note.** The canonical M-L tracker maintained outside this repository is the
> system of record. This file is the in-repo mirror, created 2026-08-20 because no tracker file
> existed in the codebase. Round 0 below is reconstructed *only* from measurements re-taken against
> live production on 2026-08-20 that confirmed the 2026-08-19 findings unchanged — it is not a copy
> of the original baseline document. Reconcile the two before Round 2.

---

## Round 0 — pre-intervention baseline

| | |
|---|---|
| Baseline established | 2026-08-19 |
| Re-confirmed unchanged | 2026-08-20T12:54:04Z |
| Production commit | `b01acd3` |
| Evidence | `docs/seo/captures/2026-08-20-pre-deployment/` |
| Status | **IMMUTABLE — do not edit** |

| Metric | Round 0 value |
|---|---|
| Indexable routes served | 38 (all returning the same shell) |
| Distinct raw-HTML responses across all routes | **1** (md5 `8536abca75f9d374ff3c2009e938c425`, 2661 bytes) |
| Routes with a self-referencing canonical | **1 / 38** (the homepage only, by coincidence) |
| Routes with a unique `<title>` | **1 / 38** |
| Routes with a unique meta description | **1 / 38** |
| Routes with a correct `og:url` | **1 / 38** |
| Routes with route content in raw HTML | **0 / 38** |
| Readable text in raw HTML (any route) | **0 characters** |
| JSON-LD blocks in raw HTML (any route) | **0** |
| Internal links in raw HTML (any route) | **0** |
| Product/Offer structured data in raw HTML | **0 / 21 products** |
| Organization entity in raw HTML | absent |
| Foreign-namespace URLs (`/products/*`, `/collections/*`) | HTTP **200** soft-200, homepage canonical |
| Arbitrary non-existent URL | HTTP **200** soft-404, homepage canonical |
| Public phone number exposed | none |
| `support@bemoremodest.com` exposed | none |
| Competing self-canonicalising storefront | **yes** — `modest-streetwear-apparel.myshopify.com`, 21 products |

---

## Round 1 — Phase 1A: technical retrieval foundation

| | |
|---|---|
| Implementation completed | 2026-08-20T13:28:00Z |
| Branch | `claude/modest-seo-phase-1a-tyvsql` |
| Evidence | `docs/seo/captures/2026-08-20-post-build/` |
| Verification | `scripts/verify-seo.mjs` — 148/148 checks passed against the built artifact |
| Test suite | 83 tests, 10 files, all passing |
| **Live-production status** | **NOT YET PUBLISHED** — requires Lovable Publish. See report §F. |

| Metric | Round 0 | Round 1 (built artifact) |
|---|---|---|
| Distinct raw-HTML responses across all routes | 1 | **38** |
| Routes with a self-referencing canonical | 1 / 38 | **38 / 38** |
| Routes with a unique `<title>` | 1 / 38 | **38 / 38** |
| Routes with a unique meta description | 1 / 38 | **38 / 38** |
| Routes with a correct `og:url` | 1 / 38 | **38 / 38** |
| Routes with route content in raw HTML | 0 / 38 | **38 / 38** |
| Readable text in raw HTML — homepage | 0 chars | **1,689 chars** |
| Readable text in raw HTML — `/about` | 0 chars | **1,112 chars** |
| Readable text in raw HTML — `/mens` | 0 chars | **1,355 chars** |
| Readable text in raw HTML — Big Bear Cashmere | 0 chars | **1,405 chars** |
| Readable text in raw HTML — lowest of any route | 0 chars | **437 chars** (`/sale`, an intentionally near-empty page) |
| JSON-LD blocks in raw HTML | 0 | **3 per route** (4 on `/faq`) |
| Internal links in raw HTML — lowest of any route | 0 | **21** |
| Product/Offer structured data in raw HTML | 0 / 21 | **21 / 21** |
| Organization entity in raw HTML | absent | **present on all 38 routes** |
| `/products/*` → `/product/*` | 200 soft-200 | **301** |
| `/collections/*` → category route | 200 soft-200 | **301** |
| Arbitrary non-existent URL | 200 soft-404 | 200 + homepage canonical (**unresolved**, see report §E-4) |
| Public phone number exposed | none | **none** |
| `support@bemoremodest.com` exposed | none | **none** |
| Fendi Frost reference in any published surface | none | **none** |
| Competing self-canonicalising storefront | yes | **yes — unresolved**, see report §E-1 |

### Observation window

Round 1 opens Modest's first technical observation period. The window starts at the Lovable Publish
timestamp, **not** at the implementation timestamp above. Record the publish time here when it
happens, then re-run:

```
node scripts/verify-seo.mjs --base https://bemoremodest.com --json round-1-live.json
```

| Field | Value |
|---|---|
| Lovable Publish timestamp | _to be recorded_ |
| Live verification result | _to be recorded_ |
| First re-crawl observed | _to be recorded_ |
