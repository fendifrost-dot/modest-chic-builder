/**
 * Stripe Checkout + webhook verification, ported from server/stripe-client.mjs.
 *
 * Changes from the Node original, each deliberate:
 *  - automatic_tax is enabled. The Node version collected no sales tax at all.
 *  - Line items and shipping carry tax_behavior, required for automatic_tax with
 *    inline price_data.
 *  - customer_creation: "always", so every order leaves a Stripe Customer behind.
 *  - The return-URL origin is passed in from PUBLIC_ORIGIN, never from a header.
 *  - HMAC verification uses Web Crypto. crypto.subtle.verify is constant-time,
 *    so it replaces the manual timingSafeEqual comparison.
 */

import { env } from "./env.ts";
import type { HandoffItem } from "./store.ts";

/**
 * Pinned deliberately. Cursor's Node version pinned 2024-11-20.acacia, which is
 * roughly two years behind. Override with STRIPE_API_VERSION only after reading
 * the changelog for the versions you are skipping.
 */
export const STRIPE_API_VERSION = env("STRIPE_API_VERSION") || "2026-09-30.endive";

const FREE_SHIPPING_OVER = 20_000;
const STANDARD_SHIPPING_CENTS = 800;
const SIGNATURE_TOLERANCE_SECONDS = 300;

export function stripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY"));
}

/**
 * Automatic tax stays on unless STRIPE_AUTOMATIC_TAX is explicitly false.
 * A missing head-office address has to be fixed in Stripe Tax settings.
 * This flag is the only off switch, and it is never implied by an error.
 */
export function automaticTaxEnabled(): boolean {
  const raw = (env("STRIPE_AUTOMATIC_TAX") ?? "true").trim().toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "off" && raw !== "no";
}

export function formEncode(value: unknown, parent = ""): string {
  const parts: string[] = [];
  const append = (key: string, item: unknown) => {
    if (item == null) return;
    if (Array.isArray(item)) {
      item.forEach((entry, index) => append(`${key}[${index}]`, entry));
      return;
    }
    if (typeof item === "object") {
      for (const [child, entry] of Object.entries(item as Record<string, unknown>)) {
        append(`${key}[${child}]`, entry);
      }
      return;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
  };
  if (parent) {
    append(parent, value);
  } else {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) append(key, item);
  }
  return parts.join("&");
}

export interface CheckoutBodyInput {
  origin: string;
  handoffId: string;
  items: HandoffItem[];
  fulfillment?: string;
}

export function buildCheckoutBody({ origin, handoffId, items, fulfillment = "catalog" }: CheckoutBodyInput) {
  const subtotal = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : STANDARD_SHIPPING_CENTS;
  // Unset by default so Stripe falls back to the account's default tax code,
  // which is where an accountant should set the apparel treatment.
  const taxCode = env("STRIPE_TAX_CODE");

  return {
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    customer_creation: "always",
    phone_number_collection: { enabled: true },
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
    automatic_tax: { enabled: automaticTaxEnabled() },
    metadata: { handoff_id: handoffId, brand: "MODST", fulfillment },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: shipping, currency: "usd" },
          tax_behavior: "exclusive",
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
        tax_behavior: "exclusive",
        product_data: {
          name: item.title,
          description: item.description || undefined,
          tax_code: taxCode || undefined,
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

async function stripeRequest(
  path: string,
  init: { method?: string; body?: string; idempotencyKey?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  const secret = env("STRIPE_SECRET_KEY");
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not set");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    "Stripe-Version": STRIPE_API_VERSION,
  };
  if (init.body) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const response = await fetchImpl(`https://api.stripe.com/v1/${path}`, {
    method: init.method || "GET",
    headers,
    body: init.body,
  });
  const body = await response.json();
  if (!response.ok) {
    const detail = (body as { error?: { message?: string } })?.error?.message;
    throw new Error(detail || `Stripe request failed (${response.status})`);
  }
  return body as Record<string, unknown>;
}

export function createCheckoutSession(
  input: CheckoutBodyInput & { fetchImpl?: typeof fetch },
): Promise<Record<string, unknown>> {
  const { fetchImpl = fetch, ...rest } = input;
  return stripeRequest(
    "checkout/sessions",
    {
      method: "POST",
      body: formEncode(buildCheckoutBody({ ...rest, fulfillment: rest.items[0]?.fulfillment || "catalog" })),
      idempotencyKey: rest.handoffId,
    },
    fetchImpl,
  );
}

export function retrieveCheckoutSession(
  id: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  return stripeRequest(`checkout/sessions/${encodeURIComponent(id)}`, {}, fetchImpl);
}

/**
 * Copies a view into a standalone ArrayBuffer.
 *
 * TextEncoder and Uint8Array are typed over ArrayBufferLike, which includes
 * SharedArrayBuffer and so is not assignable to Web Crypto's BufferSource.
 */
function toBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || /[^0-9a-fA-F]/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Verifies a Stripe-Signature header against the raw request body.
 *
 * Must be given the body exactly as received. Re-serialising parsed JSON changes
 * the bytes and the signature will not match.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (!rawBody || !header || !secret) return false;

  const parts = String(header).split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || signatures.length === 0) return false;

  const age = nowSeconds - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    toBuffer(encoder.encode(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = toBuffer(encoder.encode(`${timestamp}.${rawBody}`));

  for (const signature of signatures) {
    const bytes = hexToBytes(signature);
    if (!bytes || bytes.length !== 32) continue;
    if (await crypto.subtle.verify("HMAC", key, toBuffer(bytes), signed)) return true;
  }
  return false;
}
