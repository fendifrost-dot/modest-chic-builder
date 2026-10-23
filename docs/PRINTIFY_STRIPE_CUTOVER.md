# Printify + Stripe cutover

**Do not merge. Do not publish. Do not deploy.**

An SEO/GEO test baselined August 19, 2026 is still open under a Founder lock. This branch is the replacement storefront only. The live Lovable deployment at https://bemoremodest.com must stay untouched until the Founder closes that test and explicitly asks for a cutover.

Lovable Publish cannot run this server. Catalog, checkout, and the Stripe webhook need `node server/index.mjs` (or `npm run dev`, which mounts the same API). Publishing this branch to Lovable would remove Shopify from the live site and leave no catalog or checkout.

## Decoupling status

Shopify is gone from the storefront runtime.

| Removed | What it did |
|---|---|
| `src/lib/shopify.ts` | Storefront GraphQL client, API version `2025-07`, store domain `modest-streetwear-apparel.myshopify.com`, hardcoded Storefront token, product and collection queries, `cartCreate` / `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove`, checkout URL with `channel=online_store` |
| `src/hooks/useCartSync.ts` | Reloaded the Shopify cart on focus |
| `src/stores/cartStore.ts` Shopify fields | `cartId`, `checkoutUrl`, localStorage key `shopify-cart` |
| `src/components/CartDrawer.tsx` | `window.open` of the Shopify checkout URL |
| `src/components/Header.tsx` | Account link to `modest-streetwear-apparel.myshopify.com/account` |
| `src/components/ProductGrid.tsx`, `ProductDetail.tsx`, `SearchDialog.tsx`, `Collection.tsx` | Storefront queries, including the homepage pin of Shopify product ids `8965877104817`, `8965878087857`, `8965883068593`, `8966533677233` and the mens collection handle `frontpage` |
| `scripts/generate-sitemap.mjs` | Shopify Admin/Storefront token lookup and the hardcoded token fallback |
| `.env.example` | `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_TOKEN` |
| `src/test/inventory-audit.test.ts`, `src/test/collection-discovery.test.ts` | Live Shopify collection probes |
| Footer payment row | Affirm and PayPal marks that belonged to Shopify checkout |
| Marquee | “Affirm Available” |
| `public/llms.txt` and FAQ / privacy / terms | “Commerce runs on Shopify” and “enter the code at Shopify checkout” |

Left in place on purpose: Lovable Cloud (`VITE_SUPABASE_*`) and Mailchimp. Neither is the catalog or the checkout. Historical notes in `docs/SHOPIFY_HANDOFF.md` and `docs/GO_LIVE_STATUS.md` are marked superseded so they are not used to wire Shopify back in.

Legacy jacket SKUs are not migrated. There is no SKU crosswalk. A Printify product whose title or tags say jacket, bomber, or varsity is dropped unless it is tagged `include-jacket`. `PRINTIFY_SKIP_SKUS` drops any other leftover SKU by exact value. These old handles return HTTP 410 from the Node server (not from Lovable static hosting):

- `/product/ketchup-mustard-varsity-jacket`
- `/product/flamingo-fly-varsity-jacket`
- `/product/bzo-bomber-jacket`
- `/product/womens-bzo-bomber-jacket`

## What runs now

```
browser  →  Vite storefront
              ├─ GET /api/catalog          Printify shops/{id}/products (5 min cache) or preview
              ├─ GET /api/products/:handle
              ├─ GET /api/preorders        content/preorders.json only
              ├─ POST /api/checkout        Stripe Checkout Session, or a mock URL if no secret key
              └─ POST /api/webhooks/stripe checkout.session.completed
                    ├─ catalog   → Printify order draft (send_to_production only if PRINTIFY_AUTO_SUBMIT=true)
                    └─ preorder  → recorded as preorder_held, never sent to Printify
```

Prices on both paths are taken from the server. A price sent by the browser is ignored.

Without `PRINTIFY_API_TOKEN` and `PRINTIFY_SHOP_ID`, the shop shows a labeled preview assortment. Those preview handles are not written into the sitemap. Without `STRIPE_SECRET_KEY`, checkout returns `/checkout/success?session_id=cs_test_mock_…` and the page says no payment was captured.

Homepage curation is the Printify tag `featured` or `heart-chakra`, not a list of Shopify ids.

## What's to Come

`content/preorders.json` is the only source. The shop never reads it. The file lists five Founder concepts, all with `enabled: false` and empty `title`, `expectedShip`, and `priceCents`: snakeskin-textured 6-panel caps in grey/white, tan, golden, and brown/black (brass-buckle strap, optional bear enamel pin), plus a six-finish bear mascot pin set. Photos live in `public/images/preorders/`. The page and the home section show those concepts with the placeholders “Name to be set”, “Price to be set”, and “Ship date to be set”. Checkout stays closed. Nothing is offered until the Founder sets `enabled` to true and fills the name, price, and ship fields. An open piece then shows a Pre-order label, the Founder's expected-ship sentence, and the price from `priceCents`. Stripe line items are named `Pre-order: …` and the description repeats the ship sentence. The webhook stores `preorder_held` and does not call Printify. These caps are not the dropship hat line and are not Printify products.

Polos, button-ups, hats, and a later jacket line are still not built. `src/lib/roadmap.ts` only names them.

## Environment

Set these on the host that runs the Node server. Never prefix the secrets with `VITE_`. Never hardcode them.

| Variable | Required for live commerce |
|---|---|
| `PRINTIFY_API_TOKEN` | Yes, catalog + order handoff |
| `PRINTIFY_SHOP_ID` | Yes |
| `STRIPE_SECRET_KEY` | Yes, Checkout Sessions on Modest's Stripe account |
| `STRIPE_WEBHOOK_SECRET` | Yes, `checkout.session.completed` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No for this redirect flow. Reserved for a future Payment Element |
| `PRINTIFY_SKIP_SKUS` | Optional comma-separated legacy SKUs |
| `PRINTIFY_AUTO_SUBMIT` | Optional. Default false keeps Printify orders as drafts |
| `PRINTIFY_API_BASE` | Optional. Default `https://api.printify.com/v1` |
| `PRINTIFY_CACHE_TTL_MS` | Optional. Default 300000 |
| `STRIPE_WEBHOOK` endpoint | `https://bemoremodest.com/api/webhooks/stripe` after cutover |

`WELCOME10` must exist as a Stripe promotion code. The automatic “up to 30% off” Shopify discount is not recreated. Affirm appears only if it is enabled on the Stripe account.

Create the Stripe webhook before taking payment. Point it at the Node host, subscribe to `checkout.session.completed`, and store the signing secret in `STRIPE_WEBHOOK_SECRET`.

## Canonical, URL, and metadata vs the live site

Compared with https://bemoremodest.com on October 23, 2026. Nothing here is live.

### Unchanged on purpose

| Field | Live value, kept |
|---|---|
| Home title | `MOD#$T \| Premium Luxury Streetwear - Be More Modest` |
| Home meta description | The existing cashmere / varsity / hoodie sentence in `index.html` |
| Home canonical | `https://bemoremodest.com/` |
| `og:url`, `og:image`, `og:title`, `og:site_name`, `twitter:site` | Same as the live shell |
| Shop paths | `/`, `/mens`, `/womens`, `/accessories`, `/new-arrivals`, `/sale`, `/product/:handle`, and the info pages |
| Sitemap lastmod on those 17 URLs | `2026-08-31`, matching the live sitemap |
| `sameAs` | Instagram and `https://twitter.com/bemoremodest` only. No TikTok. No phone |

The app is still a Vite SPA. Inner routes still receive their own title, description, and canonical in the browser after load, the same way the live site does. The first HTML document for every route is still the homepage shell.

### Changes to plan before cutover

| Change | Live today | This branch |
|---|---|---|
| `/whats-to-come` | Does not exist | New indexable URL. Canonical `https://bemoremodest.com/whats-to-come`. Sitemap lastmod `2026-10-23`. Page content is five unpublished concepts (four cap colorways and a pin set) with placeholder names, prices, and ship dates |
| `/checkout/success`, `/checkout/cancelled` | Do not exist | New, `noindex`, omitted from the sitemap |
| `robots.txt` | Allow all, sitemap line | Same allows, plus `Disallow: /api/` and `Disallow: /checkout/` on every agent group |
| Sitemap product URLs | Live sitemap is the 17 static URLs only. The repo file on `main` also listed old Shopify handles that the live sitemap does not | Static URLs match live. Shopify product handles are not copied forward. Printify handles are added only when credentials are present at `npm run build` |
| Organization JSON-LD `name` | `MOD#$T` | `Modest`, with `legalName` Modest Streetwear Apparel Inc., `alternateName` including `MOD#$T`, `foundingDate` `2017-09`, founder Terrence Cleveland |
| JSON-LD `priceRange` | `$$` | `$$$` |
| `llms.txt` | Says commerce runs on Shopify and payments are Shopify plus Affirm | Printify + Stripe, founder, legal entity, no phone, no TikTok, pre-order rules |
| About, FAQ, privacy, terms | Shopify / Affirm wording after hydration | Founder facts, Stripe, Printify, pre-order explanation |
| Header | “Up to 30% off” | Chicago · Est. September 2017 |
| Legacy jacket product URLs | Not in the live sitemap. Present in the old repo sitemap | Node server returns 410 and `noindex`. Other old Shopify handles are not redirected |

Old Shopify handles that were in the repo sitemap and are not remapped (jackets are the 410 list above):

`big-bear-cashmere-sweater`, `big-head-bear-mask`, `mod-t-smoke-bear-tee`, `unisex-jersey-short-sleeve-tee`, `unisex-jersey-short-sleeve-tee-1`, `mod-t-overall-bear`, `mod-t-bear-classic-logo-sweatshirt`, `unisex-jersey-short-sleeve-tee-2`, `champion-womens-heritage-cropped-t-shirt`, `mod-t-bear-leather-patch-hat`, `unisex-jersey-short-sleeve-tee-3`, `unisex-heavy-blend™-hooded-sweatshirt`, `nutrition-album-tee`, `heart-chakra-bear-t-shirt-minimalist-black-bear-chest-graphic`, `women-s-chakra-bear-crop-tee-minimal-black-heart-chest-graphic-casual-summer-top`, `heart-chakra-album-tee-nostalgic-teddy-punching-bag-graphic-t-shirt`, `mod-t-care-bear`.

If a Printify product slug happens to match one of those handles, that URL works again. There is no manual map.

## Run

```
npm install
npm test
npm run dev
```

`npm start` serves `dist/` plus the API after `npm run build`.
