// POST /checkout                      create a Stripe Checkout Session
// GET  /checkout/sessions/:id         read back a session for the result page
//
// Mirrors the same two routes in server/api.mjs. Line-item prices are always
// resolved from the server's own catalog; any amount the browser sends is ignored.

import { badRequest, guard, json, preflight, subPath } from "../_shared/http.ts";
import { publicOrigin } from "../_shared/env.ts";
import { listProducts } from "../_shared/catalog.ts";
import { resolvePreorderItems } from "../_shared/preorders.ts";
import {
  type HandoffItem,
  readSession,
  writeHandoff,
  writeSession,
} from "../_shared/store.ts";
import {
  createCheckoutSession,
  retrieveCheckoutSession,
  stripeConfigured,
} from "../_shared/stripe.ts";
import type { CatalogProduct, CatalogVariant } from "../_shared/catalog-model.ts";

const MAX_LINES = 20;
const MAX_QUANTITY = 10;

function lineFrom(product: CatalogProduct, variant: CatalogVariant, quantity: number): HandoffItem {
  const optionLabel = (variant.selectedOptions || []).map((option) => option.value).join(" / ");
  return {
    productId: product.id,
    handle: product.handle,
    title: optionLabel ? `${product.title} — ${optionLabel}` : product.title,
    printifyProductId: product.printifyProductId,
    printifyVariantId: variant.printifyVariantId,
    variantId: variant.id,
    quantity,
    unitAmount: variant.unitAmount,
    currency: variant.price.currencyCode,
  };
}

async function resolveLineItems(items: unknown): Promise<HandoffItem[]> {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
    throw badRequest("Cart is empty or too large");
  }
  const { products } = await listProducts();
  const pairs = products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant }))
  );

  return items.map((item) => {
    const quantity = Number(item?.quantity);
    if (
      !item?.variantId ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      throw badRequest("Invalid line item");
    }
    const found = pairs.find(({ variant }) => variant.id === item.variantId);
    if (!found) throw badRequest("Unknown variant");
    if (!found.variant.availableForSale) throw badRequest("Variant is sold out");
    return lineFrom(found.product, found.variant, quantity);
  });
}

async function publicSession(id: string): Promise<Record<string, unknown> | null> {
  const local = await readSession(id);
  if (local) return local;
  if (!stripeConfigured()) return null;

  // deno-lint-ignore no-explicit-any
  const session = await retrieveCheckoutSession(id) as any;
  if (!session) return null;
  return {
    id: session.id,
    mode: "stripe",
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_details?.email || null,
    source: session.metadata?.fulfillment === "preorder" ? "preorder" : "catalog",
  };
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") return preflight();

  const segments = subPath(req, "checkout");

  if (req.method === "GET" && segments[0] === "sessions" && segments[1]) {
    return guard(async () => {
      const session = await publicSession(decodeURIComponent(segments[1]));
      if (!session) return json({ error: "Session not found" }, 404);
      return json(session);
    });
  }

  if (req.method !== "POST" || segments.length > 0) {
    return Promise.resolve(json({ error: "Method not allowed" }, 405));
  }

  return guard(async () => {
    const raw = await req.text();
    let body: { source?: unknown; items?: unknown } = {};
    if (raw.length) {
      try {
        body = JSON.parse(raw);
      } catch {
        throw badRequest("Invalid JSON body");
      }
    }

    const source: "catalog" | "preorder" = body.source === "preorder" ? "preorder" : "catalog";
    const items = source === "preorder"
      ? await resolvePreorderItems(body.items)
      : await resolveLineItems(body.items);

    const handoffId = crypto.randomUUID().replace(/-/g, "");
    await writeHandoff({ id: handoffId, source, items, createdAt: new Date().toISOString() });

    // Preview mode for the Founder: no keys, no charge, and the result page says so.
    if (!stripeConfigured()) {
      const sessionId = `cs_test_mock_${handoffId.slice(0, 24)}`;
      await writeSession(
        sessionId,
        {
          id: sessionId,
          mode: "mock",
          status: "complete",
          payment_status: "unpaid",
          source,
          handoffId,
          items,
          note: "STRIPE_SECRET_KEY is not set. No payment was captured.",
        },
        handoffId,
      );
      return json({ mode: "mock", id: sessionId, url: `/checkout/success?session_id=${sessionId}` });
    }

    const session = await createCheckoutSession({
      origin: publicOrigin(),
      handoffId,
      items,
    });
    return json({ mode: "stripe", id: session.id, url: session.url });
  });
});
