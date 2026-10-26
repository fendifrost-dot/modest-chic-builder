# Printify + Stripe cutover

**Do not merge. Do not publish. Do not deploy the storefront.**

An SEO/GEO test baselined August 19, 2026 is still open under a Founder lock. https://bemoremodest.com stays on the current Lovable publish until the Founder closes that test and explicitly asks for a cutover.

The commerce backend is already on Lovable Cloud. Commit `dda12a3` on `main` deployed Supabase edge functions for project `lkbapymfjcfrnskcdrmv`: `catalog`, `products`, `preorders`, `checkout`, and `stripe-webhook`, plus the shared modules and two migrations (`20261024120000_stripe_order_storage`, `20261024120100_preorders`). Those migrations are already applied. This branch keeps that code as the backend and points the storefront at it. There is no Node server and no `/api/*` route in the storefront.

A later Lovable Publish of this storefront, after the Founder lock lifts, is a complete site: the static app calls the edge functions that are already running. Publishing before that lock lifts is still forbidden.

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
| `server/` | Node catalog, checkout, and webhook. Lovable cannot host it. Replaced by `supabase/functions/` |
| Footer payment row | Affirm and PayPal marks that belonged to Shopify checkout |
| Marquee | “Affirm Available” |
| `public/llms.txt` and FAQ / privacy / terms | “Commerce runs on Shopify” and “enter the code at Shopify checkout” |

Left in place on purpose: Lovable Cloud (`VITE_SUPABASE_*`) and Mailchimp. Lovable Cloud is now also the catalog and checkout host. Historical notes in `docs/SHOPIFY_HANDOFF.md` and `docs/GO_LIVE_STATUS.md` are marked superseded so they are not used to wire Shopify back in.

Legacy jacket SKUs are not migrated. There is no SKU crosswalk. A Printify product whose title or tags say jacket, bomber, or varsity is dropped unless it is tagged `include-jacket`. `PRINTIFY_SKIP_SKUS` drops any other leftover SKU by exact value. The `products` function returns HTTP 410 JSON for these handles:

- `ketchup-mustard-varsity-jacket`
- `flamingo-fly-varsity-jacket`
- `bzo-bomber-jacket`
- `womens-bzo-bomber-jacket`

The product page then shows “No longer offered” and `noindex`. Lovable’s static host still serves the SPA shell for `/product/...`, so the document status is 200. The 410 is the function response.

## What runs now

```
browser  →  Vite storefront
              VITE_SUPABASE_URL/functions/v1/catalog
              VITE_SUPABASE_URL/functions/v1/products/:handle
              VITE_SUPABASE_URL/functions/v1/preorders
              VITE_SUPABASE_URL/functions/v1/checkout
              VITE_SUPABASE_URL/functions/v1/checkout/sessions/:id
Stripe   →  https://lkbapymfjcfrnskcdrmv.supabase.co/functions/v1/stripe-webhook
              checkout.session.completed
                    ├─ catalog   → Printify order draft (send_to_production only if PRINTIFY_AUTO_SUBMIT=true)
                    └─ preorder  → recorded as preorder_held, never sent to Printify
```

Prices on both paths are taken from the edge function. A price sent by the browser is ignored. Catalog checkout sends `{ source: "catalog", items: [{ variantId, quantity }] }`. `variantId` is `<printifyProductId>:<variantId>`. The browser then redirects to the Stripe URL in the response.

A product is kept only when Printify sets `visible` to `true`. `visible: false`, a missing flag, and any other value are dropped. Shop `8464572` is the catalog. Shop `8464467` is empty and is refused. The token stays in Lovable Cloud and is not stored in the repo.

Without `PRINTIFY_API_TOKEN`, the function returns a labeled preview of the six visible titles. Those preview handles are not written into the sitemap. Live catalog mode is `printify`.

Homepage curation is the Printify tag `featured` or `heart-chakra`, not a list of Shopify ids. Product links use the `handle` field from the catalog function. The live handle for the classic logo sweatshirt is `mod-t-bear-classic-logo-sweatshirt`, not `modest-bear-classic-logo-sweatshirt`.

## What's to Come

`public.preorders` is the live source, filled by migration `20261024120100_preorders.sql`. `content/preorders.json` remains the original seed and is not read at runtime. The five concepts ship with `enabled=false` and empty title, expected ship, and price: snakeskin-textured 6-panel caps in grey/white, tan, golden, and brown/black (brass-buckle strap, optional bear enamel pin), plus a six-finish bear mascot pin set. Photos live in `public/images/preorders/`. The page and the home section show “Name to be set”, “Price to be set”, and “Ship date to be set”. The Pre-order button stays disabled while the title, price, or ship date is blank. Checkout stays closed until the Founder sets `enabled` to true and fills those fields in the table. An open piece then shows a Pre-order label, the Founder's expected-ship sentence, and the price from `price_cents`. Stripe line items are named `Pre-order: …`. The webhook stores `preorder_held` and does not call Printify. These caps are not the dropship hat line and are not Printify products.

Polos, button-ups, hats, and a later jacket line are still not built. `src/lib/roadmap.ts` only names them.

## Lovable Cloud secrets

Set these on the edge functions in Lovable Cloud. Never prefix them with `VITE_`. Never commit them. Never paste them into chat.

| Secret | Required |
|---|---|
| `PRINTIFY_API_TOKEN` | Yes. Catalog and paid-order handoff |
| `PRINTIFY_SHOP_ID` | Yes. Set `8464572`. Do not set `8464467` |
| `STRIPE_SECRET_KEY` | Yes. Modest's Stripe account. The key in Cloud today is a **test** key. Launch needs the **live** key |
| `STRIPE_WEBHOOK_SECRET` | Yes. Currently unset. `stripe-webhook` returns `Webhook is not configured` until this exists |
| `PUBLIC_ORIGIN` | Yes. `https://bemoremodest.com`. Checkout builds success and cancel URLs from this value only |
| `STRIPE_AUTOMATIC_TAX` | No. Defaults to on. Set `false` only as an explicit decision. Do not set it to hide the tax error below |
| `STRIPE_TAX_CODE` | No. Apparel tax code. Unset uses the Stripe account default |
| `PRINTIFY_AUTO_SUBMIT` | No. Leave unset or `false` so paid orders stay Printify drafts |
| `PRINTIFY_SKIP_SKUS` | No. Comma-separated legacy SKUs |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Injected by Lovable Cloud for the functions. Do not copy them into the repo |

`WELCOME10` must exist as a Stripe promotion code. The automatic “up to 30% off” Shopify discount is not recreated. Affirm appears only if it is enabled on the Stripe account.

### Stripe webhook

Create the endpoint in the Stripe Dashboard for the same mode as `STRIPE_SECRET_KEY` (test now, live before launch):

- URL: `https://lkbapymfjcfrnskcdrmv.supabase.co/functions/v1/stripe-webhook`
- Event: `checkout.session.completed`
- Also subscribe to `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed` if Affirm or another delayed method should fulfill. The function already handles those events.

Put the signing secret in `STRIPE_WEBHOOK_SECRET`. The function verifies `Stripe-Signature` and has `verify_jwt = false`, because Stripe cannot send a Supabase JWT.

### Stripe Tax (not fixed in code)

Checkout sends `automatic_tax.enabled: true`. The current test key fails with:

`You must have a valid head office address to enable automatic tax calculation`

The Founder sets the head office address in Stripe Dashboard → Tax settings, on the same mode as the key. This branch adds `STRIPE_AUTOMATIC_TAX`, which stays on unless the secret is exactly `false`, `0`, `off`, or `no`. That flag is in the repo only. It takes effect the next time the `checkout` function is redeployed. The function deployed from `dda12a3` always enables automatic tax. Do not turn tax off to make a test charge succeed.

## Canonical, URL, and metadata vs the live site

Compared with https://bemoremodest.com on October 23, 2026. The storefront in this branch is not published.

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

The app is still a Vite SPA. Inner routes still receive their own title, description, and canonical in the browser after load, the same way the live site does. The first HTML document for every route is still the homepage shell. The hero image and wordmark are in that first HTML and are preloaded.

### Changes to plan before cutover

| Change | Live today | This branch |
|---|---|---|
| `/whats-to-come` | Does not exist | New indexable URL. Canonical `https://bemoremodest.com/whats-to-come`. Sitemap lastmod `2026-10-23`. Page content is five unpublished concepts (four cap colorways and a pin set) with placeholder names, prices, and ship dates |
| `/checkout/success`, `/checkout/cancelled` | Do not exist | New, `noindex`, omitted from the sitemap |
| `robots.txt` | Allow all, sitemap line | Same allows, plus `Disallow: /api/` and `Disallow: /checkout/` on every agent group |
| Sitemap product URLs | Live sitemap is the 17 static URLs only | Static URLs match live, plus `/whats-to-come`. Printify handles are added only when the catalog function returns `mode: "printify"` at `npm run build` |
| Organization JSON-LD `name` | `MOD#$T` | `Modest`, with `legalName` Modest Streetwear Apparel Inc., `alternateName` including `MOD#$T`, `foundingDate` `2017-09`, founder Terrence Cleveland |
| JSON-LD `priceRange` | `$$` | `$$$` |
| `llms.txt` | Says commerce runs on Shopify and payments are Shopify plus Affirm | Printify + Stripe, founder, legal entity, no phone, no TikTok, pre-order rules |
| About, FAQ, privacy, terms | Shopify / Affirm wording after hydration | Founder facts, Stripe, Printify, pre-order explanation |
| Header | “Up to 30% off” | Chicago · Est. September 2017 |
| First paint | React header wordmark after JavaScript | Static wordmark and hero image in `index.html`, preloaded |
| Legacy jacket product URLs | Not in the live sitemap | `products` function returns 410 JSON. The page is `noindex`. Other old Shopify handles are not redirected |

Old Shopify handles that were in the repo sitemap and are not remapped (jackets are the 410 list above):

`big-bear-cashmere-sweater`, `big-head-bear-mask`, `mod-t-smoke-bear-tee`, `unisex-jersey-short-sleeve-tee`, `unisex-jersey-short-sleeve-tee-1`, `mod-t-overall-bear`, `mod-t-bear-classic-logo-sweatshirt`, `unisex-jersey-short-sleeve-tee-2`, `champion-womens-heritage-cropped-t-shirt`, `mod-t-bear-leather-patch-hat`, `unisex-jersey-short-sleeve-tee-3`, `unisex-heavy-blend™-hooded-sweatshirt`, `nutrition-album-tee`, `heart-chakra-bear-t-shirt-minimalist-black-bear-chest-graphic`, `women-s-chakra-bear-crop-tee-minimal-black-heart-chest-graphic-casual-summer-top`, `heart-chakra-album-tee-nostalgic-teddy-punching-bag-graphic-t-shirt`, `mod-t-care-bear`.

If a Printify product slug happens to match one of those handles, that URL works again. There is no manual map. `mod-t-bear-classic-logo-sweatshirt` is the live catalog handle for the classic logo sweatshirt.

## Run

```
npm install
npm test
npm run dev
```

`npm run build` writes the sitemap, then the static app. `npm start` serves that build with Vite preview. Commerce calls go to the edge functions, not to this process.

## Founder launch steps still open

1. Leave this pull request unmerged and do not publish until the August 19, 2026 SEO/GEO test is closed.
2. In Stripe Tax settings, set a valid head office address for the mode of the current key. The test key currently fails checkout on automatic tax.
3. Create the webhook above and set `STRIPE_WEBHOOK_SECRET` in Lovable Cloud.
4. Confirm `PUBLIC_ORIGIN=https://bemoremodest.com` and `PRINTIFY_SHOP_ID=8464572` are set beside `PRINTIFY_API_TOKEN` and `STRIPE_SECRET_KEY`.
5. Replace the test `STRIPE_SECRET_KEY` with the live key, and create the live-mode webhook, before taking real payment.
6. Fill `public.preorders` (title, expected ship, price, `enabled=true`) only for pieces that should actually be sold. Leave the others blank.
7. After the lock lifts, publish this storefront from Lovable. Redeploy the `checkout` function only if `STRIPE_AUTOMATIC_TAX` needs to be readable; tax is already on in the deployed function.
