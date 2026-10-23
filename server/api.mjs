import { randomUUID } from "node:crypto";
import { isLegacyJacketPath } from "./catalog-model.mjs";
import { printifyConfigured, productByHandle, queryProducts } from "./catalog.mjs";
import { createPrintifyOrder } from "./printify-orders.mjs";
import { publicPreorders, resolvePreorderItems } from "./preorders.mjs";
import { readRecord, writeRecord } from "./store.mjs";
import {
  createCheckoutSession,
  retrieveCheckoutSession,
  stripeConfigured,
  verifyStripeSignature,
} from "./stripe-client.mjs";

const GONE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <title>Retired | MOD#$T</title>
  <link rel="canonical" href="https://bemoremodest.com/" />
</head>
<body>
  <h1>This jacket is no longer offered.</h1>
  <p>Legacy jacket SKUs were not migrated. <a href="https://bemoremodest.com/">Continue to MOD#$T</a>.</p>
</body>
</html>`;

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.statusCode = status;
  const type = typeof body === "string" ? "text/html; charset=utf-8" : "application/json; charset=utf-8";
  res.setHeader("Content-Type", headers["Content-Type"] || type);
  res.setHeader("Cache-Control", headers["Cache-Control"] || "no-store");
  if (headers["X-Robots-Tag"]) res.setHeader("X-Robots-Tag", headers["X-Robots-Tag"]);
  res.end(payload);
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function originFrom(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return `${proto}://${host}`;
}

async function resolveLineItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    throw Object.assign(new Error("Cart is empty or too large"), { status: 400 });
  }
  const { products } = await queryProducts({});
  const resolved = [];
  for (const item of items) {
    const quantity = Number(item?.quantity);
    if (!item?.variantId || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw Object.assign(new Error("Invalid line item"), { status: 400 });
    }
    const found = products
      .flatMap((product) => product.variants.map((variant) => ({ product, variant })))
      .find(({ variant }) => variant.id === item.variantId);
    if (!found) throw Object.assign(new Error("Unknown variant"), { status: 400 });
    if (!found.variant.availableForSale) throw Object.assign(new Error("Variant is sold out"), { status: 400 });
    resolved.push(lineFrom(found.product, found.variant, quantity));
  }
  return resolved;
}

function lineFrom(product, variant, quantity) {
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

async function publicSession(id) {
  const local = readRecord("sessions", id);
  if (local) return local;
  if (!stripeConfigured()) return null;
  const session = await retrieveCheckoutSession(id);
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

export async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      send(res, 200, {
        ok: true,
        catalog: printifyConfigured() ? "printify" : "preview",
        checkout: stripeConfigured() ? "stripe" : "mock",
        orderHandoff: "scaffold",
        printifyConfigured: printifyConfigured(),
        stripeConfigured: stripeConfigured(),
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/preorders") {
      send(res, 200, publicPreorders(), { "Cache-Control": "no-store" });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/catalog") {
      const { mode, products } = await queryProducts({
        collection: url.searchParams.get("collection") || undefined,
        query: url.searchParams.get("query") || undefined,
        sort: url.searchParams.get("sort") || undefined,
        limit: url.searchParams.get("limit") || undefined,
      });
      send(res, 200, { mode, products }, { "Cache-Control": "public, max-age=60" });
      return;
    }

    const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (req.method === "GET" && productMatch) {
      const handle = decodeURIComponent(productMatch[1]);
      const { mode, product } = await productByHandle(handle);
      if (!product) {
        send(res, 404, { error: "Product not found" });
        return;
      }
      send(res, 200, { mode, product }, { "Cache-Control": "public, max-age=60" });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/checkout") {
      const raw = await readRaw(req);
      const body = raw.length ? JSON.parse(raw.toString("utf8")) : {};
      const source = body.source === "preorder" ? "preorder" : "catalog";
      const items = source === "preorder" ? resolvePreorderItems(body.items) : await resolveLineItems(body.items);
      const handoffId = randomUUID().replace(/-/g, "");
      const handoff = { id: handoffId, source, items, createdAt: new Date().toISOString() };
      writeRecord("handoffs", handoffId, handoff);

      if (!stripeConfigured()) {
        const sessionId = `cs_test_mock_${handoffId.slice(0, 24)}`;
        const session = {
          id: sessionId,
          mode: "mock",
          status: "complete",
          payment_status: "unpaid",
          source,
          handoffId,
          items,
          note: "STRIPE_SECRET_KEY is not set. No payment was captured.",
        };
        writeRecord("sessions", sessionId, session);
        send(res, 200, { mode: "mock", id: sessionId, url: `/checkout/success?session_id=${sessionId}` });
        return;
      }

      const session = await createCheckoutSession({
        origin: originFrom(req),
        handoffId,
        items,
      });
      send(res, 200, { mode: "stripe", id: session.id, url: session.url });
      return;
    }

    const sessionMatch = url.pathname.match(/^\/api\/checkout\/sessions\/([^/]+)$/);
    if (req.method === "GET" && sessionMatch) {
      const session = await publicSession(decodeURIComponent(sessionMatch[1]));
      if (!session) {
        send(res, 404, { error: "Session not found" });
        return;
      }
      send(res, 200, session);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/webhooks/stripe") {
      const raw = await readRaw(req);
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!secret) {
        send(res, 401, { error: "STRIPE_WEBHOOK_SECRET is not set" });
        return;
      }
      const valid = verifyStripeSignature(raw.toString("utf8"), req.headers["stripe-signature"], secret);
      if (!valid) {
        send(res, 400, { error: "Invalid Stripe signature" });
        return;
      }
      const event = JSON.parse(raw.toString("utf8"));
      if (event.type !== "checkout.session.completed") {
        send(res, 200, { received: true, ignored: event.type });
        return;
      }
      let session = event.data?.object;
      if (!session?.id) {
        send(res, 400, { error: "Missing session" });
        return;
      }
      if (readRecord("orders", session.id)) {
        send(res, 200, { received: true, duplicate: true });
        return;
      }
      if (session.payment_status && session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        send(res, 200, { received: true, ignored: session.payment_status });
        return;
      }
      if (!session.shipping_details && stripeConfigured()) {
        session = await retrieveCheckoutSession(session.id);
      }
      const handoffId = session.metadata?.handoff_id;
      const handoff = handoffId ? readRecord("handoffs", handoffId) : null;
      if (!handoff) {
        send(res, 500, { error: "Missing checkout handoff" });
        return;
      }
      const result = handoff.source === "preorder"
        ? { status: "preorder_held", fulfillment: "preorder", printify: false }
        : await createPrintifyOrder({ session, handoff });
      writeRecord("orders", session.id, {
        sessionId: session.id,
        handoffId,
        result,
        recordedAt: new Date().toISOString(),
      });
      send(res, 200, { received: true, result });
      return;
    }

    send(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error.status || (error instanceof SyntaxError ? 400 : 500);
    send(res, status, { error: error.message || "Server error" });
  }
}

export async function handleRequest(req, res) {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "GET" && isLegacyJacketPath(url.pathname)) {
    send(res, 410, GONE_HTML, { "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=3600" });
    return true;
  }
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return true;
  }
  return false;
}
