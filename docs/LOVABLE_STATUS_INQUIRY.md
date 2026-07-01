# Lovable Status Inquiry — copy/paste this into Lovable chat

Use this prompt in the **Lovable project chat** for `modest-chic-builder`. Do not merge to `main` based on assumptions — we need facts from Lovable first.

---

## Prompt (start copy here)

```
I need a factual status report on this project's current configuration. Do not guess or assume — only state what you can verify from this Lovable project, its connected integrations, secrets, and deployment settings.

Please answer each section with ✅ confirmed / ⚠️ partial / ❌ not set / ❓ unknown, plus specifics.

---

### 1. Deployment & domains
- What is the current published URL for this project?
- What is the preview URL?
- Is `bemoremodest.com` connected to this Lovable project yet, or still pointing elsewhere (e.g. Shopify Online Store)?
- If the custom domain is connected, what DNS records did Lovable require, and are they active?
- Does merging/pushing to `main` on GitHub automatically trigger a publish, or is publish a separate manual step?

### 2. Shopify integration
- Is the Shopify integration connected? Which store (myshopify.com domain)?
- List every Shopify-related secret/env var name that exists in this project (e.g. SHOPIFY_STOREFRONT_ACCESS_TOKEN, SHOPIFY_ACCESS_TOKEN, etc.) — names only, never print values.
- Which env var name(s) does the **frontend** (`src/lib/shopify.ts`) actually receive at build/runtime for the Storefront API token?
- Is `SHOPIFY_STOREFRONT_ACCESS_TOKEN` the same token exposed to the client as `VITE_SHOPIFY_STOREFRONT_TOKEN`, or are they separate/mapped?
- Confirm: products, cart, and checkout are all served via Shopify Storefront API + Shopify checkout (not Supabase).

### 3. Lovable Cloud / Supabase
- Is Lovable Cloud (Supabase) enabled for this project?
- What is Supabase used for in **this** project specifically? (edge functions, tables, auth, etc.)
- Are `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID` auto-injected, or do I need to set them manually?
- Confirm: Supabase is NOT the product catalog or checkout backend — Shopify is.

### 4. Environment variables (full inventory)
Provide a table of **all** env vars / secrets configured in this project:
| Name | Purpose | Auto-managed by Lovable? | Exposed to browser (VITE_)? | Required for live storefront? |

Include at minimum: Shopify tokens, Supabase vars, any analytics vars (GA4, Meta Pixel), and anything referenced in `src/` or `scripts/generate-sitemap.mjs`.

### 5. GitHub sync
- Which GitHub repo is linked? (`fendifrost-dot/modest-chic-builder`?)
- Which branch does Lovable deploy from?
- Is branch `perf/site-optimization` visible to Lovable, and what happens if it is merged to `main`?

### 6. Build & prebuild
- Does Lovable run `npm run prebuild` (which runs `scripts/generate-sitemap.mjs`) before `vite build`?
- At build time, is `SHOPIFY_STOREFRONT_ACCESS_TOKEN` available to Node scripts, or only at runtime in the browser?
- Where will `sitemap.xml` be served from after publish (`/sitemap.xml`)?

### 7. Branch `perf/site-optimization` (if you can see it)
Summarize what that branch changes vs `main` that affects Lovable deployment (images, SEO, analytics scaffolding, removed vercel.json, sitemap script). Flag anything that will break if merged without action.

### 8. Go-live checklist for replacing Shopify theme with this app
Given the **current** state of this project, give me an ordered checklist to:
1. Publish this Lovable app
2. Move `bemoremodest.com` from the Shopify theme store to this Lovable-hosted front end
3. Keep Shopify as the commerce backend (products, cart, checkout)

Do not include steps for Vercel or standalone Supabase setup unless this project actually uses them.

---

After the report, tell me explicitly:
- What is already done and requires no action
- What I (the owner) must do manually in Lovable, Shopify Admin, or DNS
- What should NOT be configured (to avoid duplicating or conflicting with existing setup)
```

---

## After Lovable responds

Paste Lovable's reply back into Cursor so we can:
- Update `docs/SHOPIFY_HANDOFF.md` with confirmed env var names
- Fix any code/docs that assumed wrong variable names
- Give a definitive go-live directive (no guessing)
