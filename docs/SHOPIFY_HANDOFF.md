# Shopify Handoff — BeMoreModest

Handoff document for an AI agent (Claude) or engineer picking up Shopify work on this project. Read this **before** touching commerce code or Shopify data.

---

## 1. Project Context

- **Brand:** BeMoreModest — luxury streetwear (aesthetic target: KITH / Fear of God).
- **Live site:** https://bemoremodest.com — Lovable-hosted React storefront (DNS → `185.158.133.1`). Domain cutover completed 2026-06-30. See `docs/GO_LIVE_STATUS.md` for confirmed state.
- **Shopify store:** `modest-streetwear-apparel.myshopify.com` (primary domain; checkout host). **Not** `bemoremodest.myshopify.com`.
- **Repo/preview:** Lovable project — preview at `https://id-preview--cefe4b7a-fc5f-4e5d-8d7c-ae311fa00064.lovable.app`, published at `https://modest-chic-builder.lovable.app`.
- **Backend:** Lovable Cloud (Supabase) is enabled. One public edge function: `project-stats`.
- **Shopify plan:** Paid (user confirmed). Checkout + Affirm + Printify remain on Shopify.

---

## 2. Shopify Integration — What's Wired

### Auth model
- Store owner email: `bemoremodest@gmail.com` (added as project Admin so the integration works without a second Shopify subscription).
- Session-based Shopify auth — if any `shopify--*` tool returns `shopify_reauth_required`, call `shopify--connect_shopify_account` **and only that**, then continue.

### Secrets (already set — do NOT re-request)
- `SHOPIFY_ACCESS_TOKEN` (Admin API — server-side only)
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (Storefront API — client-side)

### API versions
- **Frontend Storefront API:** `2025-07` — hardcoded in `src/lib/shopify.ts`.
- **Admin API:** managed by the Lovable Shopify integration/tools.

### Storefront client
- File: `src/lib/shopify.ts`
  - `storefrontApiRequest(query, variables)` — the single fetch helper. All queries go through it.
  - GraphQL queries in-file:
    - `PRODUCTS_QUERY` — supports `first`, `query`, `sortKey`, `reverse`.
    - `PRODUCT_BY_HANDLE_QUERY` — includes `variants.image` (variant-level image swap for PDP).
    - `COLLECTION_BY_HANDLE_QUERY` — pulls products from a Shopify collection handle.
    - Cart mutations: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, `cart` query.
- Checkout URLs are formatted with `channel=online_store` and opened via `window.open(url, '_blank')`. **Never** hand-build checkout permalinks.

### Cart
- Zustand store: `src/stores/cartStore.ts` (persisted to `localStorage` under key `shopify-cart`).
- Sync hook: `src/hooks/useCartSync.ts` — mounted in `App.tsx`. Runs on load and on tab visibility change.
- UI: `src/components/CartDrawer.tsx`.

### Routing
- `/` — Home (`src/pages/Index.tsx`): hero + curated Heart Chakra collection (product IDs pinned — see §4).
- `/product/:handle` — PDP (`src/pages/ProductDetail.tsx`), variant image sync via `useEffect` on `selectedVariant`.
- `/mens` — collection handle `frontpage` (16 products).
- `/womens` — collection handle `womens` (7 products).
- `/accessories` — collection handle `accessories` (2 products).
- `/new-arrivals` — all products sorted by `CREATED_AT` reverse.
- Fallback for `/mens` if `frontpage` breaks: `tag:mens` search query.

### Products currently pinned on the homepage (Heart Chakra Collection)
Do NOT change these without user approval — this is curated:
- `8965877104817`
- `8965878087857`
- `8965883068593`
- `8966533677233`

---

## 3. Change Control Policy (STRICT — set by store owner)

**This is a live, revenue-generating storefront.** Follow this on every change:

1. **Plan first.** Post a concise implementation plan and list every file you will touch.
2. **Flag protected areas.** State whether the change touches any of:
   - Shopify API logic (`src/lib/shopify.ts`, queries, mutations)
   - Cart state/store (`src/stores/cartStore.ts`, `useCartSync`)
   - Checkout redirect (any `checkoutUrl` handling)
   - Routing (`src/App.tsx`, page components)
   - Dependencies (`package.json`)
   - Build configuration (`vite.config.ts`, `tsconfig*.json`, `tailwind.config.ts`, `postcss`)
3. **Wait for explicit approval** if any protected area is touched. No "silent" refactors.
4. **Verify-First for data claims.** Never guess product counts, collection handles, or tags — query the live Shopify API (via `shopify--list_products`, `shopify--count_products`, `shopify--search_products`, or a Storefront API call) and quote the result.
5. **After approved changes:**
   - Run vitest regression suite (`bunx vitest run`).
   - Run tsgo typecheck.
   - Manually smoke test via Playwright: homepage → collection → PDP → add-to-cart → cart drawer → checkout redirect.
   - Report results back before publishing.
6. **Never auto-publish.** Publishing requires explicit "publish" / "deploy" / "go live" instruction from the user.

---

## 4. Anti-Patterns — DO NOT DO

- ❌ Direct product URLs for purchase (`.../products/handle`) or manual `?variant=` checkout links.
- ❌ Mock/fake products, fake reviews, fake ratings, fake testimonials.
- ❌ Hardcoded colors (`text-white`, `bg-[#...]`). Use semantic tokens from `src/index.css` + `tailwind.config.ts`. Accent is muted champagne gold `HSL 43 35% 49%`.
- ❌ Re-adding orange/purple/indigo accents — rejected by user, do not reintroduce.
- ❌ Bouncy animations, "SCROLL" indicators, hero scroll-hint text — removed intentionally.
- ❌ New collection routes without confirming the Shopify collection handle exists.
- ❌ Editing Lovable auto-generated files: `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`, `supabase/config.toml` project-level settings.

---

## 5. Common Shopify Task Playbooks

### A. Change what shows on a collection page
1. Verify the Shopify collection handle: `shopify--list_products` filtered by that collection, or Storefront `COLLECTION_BY_HANDLE_QUERY`.
2. Update `src/pages/Collection.tsx` config map (do NOT branch logic — just update the config entry).
3. Update `src/test/*` regression tests to match new expected counts/labels.
4. `bunx vitest run` → report pass/fail.

### B. Add a new product to homepage curation
1. Get the product's numeric ID from Shopify Admin or `shopify--search_products`.
2. Add the `gid://shopify/Product/<ID>` to the pinned list in `src/pages/Index.tsx`.
3. Ask user for approval before merging — homepage curation is user-owned.

### C. Change hero / imagery
- Visual-only. Not a protected area. Update `src/components/HeroSection.tsx`.
- Keep `object-cover object-top` + mobile `pt-32` (prevents header overlap — see `mem://style/hero-design`).

### D. Modify a live Shopify product (title, price, images, variants)
- ⚠️ These changes hit the **live production store immediately**. Always confirm with user first.
- Use: `shopify--update_product`, `shopify--update_product_variant`.
- Do NOT delete products/variants unless explicitly told.

### E. Add a discount code
- Two-step: `shopify--create_price_rule` first, then `shopify--create_discount_code` referencing the rule ID.

---

## 6. Regression / Smoke Test Checklist

Run after any commerce-touching change:

- [ ] `bunx vitest run` — all green
- [ ] tsgo typecheck — no errors
- [ ] Homepage renders 4 Heart Chakra products, no console errors
- [ ] `/mens` renders 16 products, `/womens` renders 7, `/accessories` renders 2
- [ ] PDP: variant selector updates price + primary image
- [ ] Add-to-cart from grid works; cart badge increments
- [ ] Cart drawer: quantity +/- works, remove works, totals update
- [ ] Checkout button opens Shopify checkout in new tab with `channel=online_store`
- [ ] Mobile: hamburger menu opens/closes cleanly, no z-index conflicts with welcome modal

---

## 7. Design Tokens (must respect)

- Base: dark theme (near-black backgrounds, warm cream text).
- Accent: **muted champagne gold** — `HSL 43 35% 49%`. Do not swap for pure gold, orange, or purple.
- Type: Bebas Neue (display), Inter (body). No serifs. No Poppins.
- Motion: subtle fades / slide-ups only. No bounce, no parallax, no scroll hijack.
- Product cards: editorial (edge-to-edge image, 1.02× hover scale, no card background/border).

Full details in project memory:
- `mem://style/aesthetic-direction`
- `mem://style/hero-design`
- `mem://style/product-presentation`
- `mem://governance/change-control-policy`

---

## 8. Future Roadmap (informational — not active work)

User has mentioned wanting to eventually migrate off Shopify to Lovable Cloud + Stripe (for Affirm) + direct Printify API. **This is not active** — Shopify stays for now. Do not start this migration without explicit go-ahead.

---

## 9. Escalation

If a request would violate the Change Control Policy, break a pinned curation, hit protected areas without approval, or contradict a memory entry — **stop and ask the user first**. Never "just try it" on a live commerce site.
