import { createHmac, timingSafeEqual } from "node:crypto";

export const STRIPE_API_VERSION = "2024-11-20.acacia";
const FREE_SHIPPING_OVER = 20000;
const STANDARD_SHIPPING_CENTS = 800;

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function formEncode(value, parent = "") {
  const parts = [];
  const append = (key, item) => {
    if (item == null) return;
    if (Array.isArray(item)) {
      item.forEach((entry, index) => append(`${key}[${index}]`, entry));
      return;
    }
    if (typeof item === "object") {
      for (const [child, entry] of Object.entries(item)) append(`${key}[${child}]`, entry);
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
  };
  if (parent) {
    append(parent, value);
  } else {
    for (const [key, item] of Object.entries(value)) append(key, item);
  }
  return parts.join("&");
}

export function buildCheckoutBody({ origin, handoffId, items, fulfillment = "catalog" }) {
  const subtotal = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : STANDARD_SHIPPING_CENTS;
  return {
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
    metadata: { handoff_id: handoffId, brand: "MODST", fulfillment },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: shipping, currency: "usd" },
          display_name: shipping === 0 ? "Free shipping over $200" : "Standard shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 12 },
          },
        },
      },
    ],
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.unitAmount,
        product_data: {
          name: item.title,
          description: item.description || undefined,
          metadata: {
            printify_product_id: item.printifyProductId || undefined,
            printify_variant_id: item.printifyVariantId != null ? String(item.printifyVariantId) : undefined,
            fulfillment: item.fulfillment || undefined,
          },
        },
      },
    })),
  };
}

export async function createCheckoutSession({ origin, handoffId, items, fetchImpl = fetch }) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  const response = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
      "Idempotency-Key": handoffId,
    },
    body: formEncode(buildCheckoutBody({
      origin,
      handoffId,
      items,
      fulfillment: items[0]?.fulfillment || "catalog",
    })),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || `Stripe checkout failed (${response.status})`);
  }
  return body;
}

export async function retrieveCheckoutSession(id, fetchImpl = fetch) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  const response = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      "Stripe-Version": STRIPE_API_VERSION,
    },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || `Stripe session lookup failed (${response.status})`);
  }
  return body;
}

export function verifyStripeSignature(rawBody, header, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!rawBody || !header || !secret) return false;
  const parts = String(header).split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const age = nowSeconds - Number(timestamp);
  if (!Number.isFinite(age) || age > 300 || age < -300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuf = Buffer.from(expected);
  return signatures.some((signature) => {
    const actual = Buffer.from(signature);
    if (actual.length !== expectedBuf.length) return false;
    return timingSafeEqual(actual, expectedBuf);
  });
}
