/**
 * Tests for the ported Stripe module.
 *
 * Mirrors server/stripe-client.test.mjs so the Deno port is held to the same bar,
 * plus cases for the behaviour added during the port (tax, customer creation) and
 * for signature edge cases the Node tests did not cover.
 *
 * Run: deno test --allow-env supabase/functions/_shared/stripe.test.ts
 */

import { assert, assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildCheckoutBody, verifyStripeSignature } from "./stripe.ts";

const ORIGIN = "https://bemoremodest.com";
const HANDOFF = "abc123def456";

function item(overrides: Record<string, unknown> = {}) {
  return {
    productId: "p1",
    handle: "heart-chakra-bear-tee",
    title: "Heart Chakra Bear Tee — Berry / M",
    quantity: 2,
    unitAmount: 4800,
    currency: "USD",
    printifyProductId: "p1",
    printifyVariantId: 101,
    ...overrides,
  };
}

async function sign(secret: string, timestamp: number, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret) as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`) as unknown as ArrayBuffer,
  );
  return Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("checkout prices come from the catalog unit amount", () => {
  const body = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
  assertEquals(body.line_items[0].price_data.unit_amount, 4800);
  assertEquals(body.line_items[0].quantity, 2);
  assertEquals(body.mode, "payment");
  assertEquals(body.shipping_options[0].shipping_rate_data.fixed_amount.amount, 800);
  assertMatch(body.success_url, /session_id=\{CHECKOUT_SESSION_ID\}/);
});

Deno.test("free shipping applies at $200", () => {
  const body = buildCheckoutBody({
    origin: ORIGIN,
    handoffId: HANDOFF,
    items: [item({ title: "Knit", quantity: 1, unitAmount: 22_000 })],
  });
  assertEquals(body.shipping_options[0].shipping_rate_data.fixed_amount.amount, 0);
});

Deno.test("sales tax is collected - the Node version collected none", () => {
  const body = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
  assertEquals(body.automatic_tax.enabled, true);
  // automatic_tax needs tax_behavior on every inline price, shipping included.
  assertEquals(body.line_items[0].price_data.tax_behavior, "exclusive");
  assertEquals(body.shipping_options[0].shipping_rate_data.tax_behavior, "exclusive");
});

Deno.test("automatic tax turns off only when STRIPE_AUTOMATIC_TAX is false", () => {
  const previous = Deno.env.get("STRIPE_AUTOMATIC_TAX");
  try {
    Deno.env.set("STRIPE_AUTOMATIC_TAX", "false");
    const off = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
    assertEquals(off.automatic_tax.enabled, false);
    Deno.env.set("STRIPE_AUTOMATIC_TAX", "true");
    const on = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
    assertEquals(on.automatic_tax.enabled, true);
  } finally {
    if (previous == null) Deno.env.delete("STRIPE_AUTOMATIC_TAX");
    else Deno.env.set("STRIPE_AUTOMATIC_TAX", previous);
  }
});

Deno.test("every order leaves a Stripe Customer behind", () => {
  const body = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
  assertEquals(body.customer_creation, "always");
});

Deno.test("return URLs come from the passed origin, never a header", () => {
  const body = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
  assert(body.success_url.startsWith(`${ORIGIN}/checkout/success`));
  assert(body.cancel_url.startsWith(`${ORIGIN}/checkout/cancelled`));
});

Deno.test("the handoff id is carried in metadata for the webhook", () => {
  const body = buildCheckoutBody({ origin: ORIGIN, handoffId: HANDOFF, items: [item()] });
  assertEquals(body.metadata.handoff_id, HANDOFF);
});

Deno.test("webhook signatures accept the current v1 and reject tampering", async () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
  const timestamp = 1_700_000_000;
  const header = `t=${timestamp},v1=${await sign(secret, timestamp, payload)}`;

  assertEquals(await verifyStripeSignature(payload, header, secret, timestamp + 10), true);
  // A single trailing space changes the bytes, so the MAC must not match.
  assertEquals(await verifyStripeSignature(`${payload} `, header, secret, timestamp + 10), false);
  // Outside the 300s replay window.
  assertEquals(await verifyStripeSignature(payload, header, secret, timestamp + 400), false);
  // Clock skew the other way is rejected too.
  assertEquals(await verifyStripeSignature(payload, header, secret, timestamp - 400), false);
  assertEquals(await verifyStripeSignature(payload, header, "whsec_wrong", timestamp + 10), false);
});

Deno.test("signature verification tolerates several v1 values during secret rotation", async () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_2" });
  const timestamp = 1_700_000_000;
  const good = await sign(secret, timestamp, payload);
  const stale = "f".repeat(64);
  const header = `t=${timestamp},v1=${stale},v1=${good}`;
  assertEquals(await verifyStripeSignature(payload, header, secret, timestamp + 5), true);
});

Deno.test("malformed signature headers are rejected, not thrown on", async () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_3" });
  const timestamp = 1_700_000_000;
  const cases = [
    "",
    "garbage",
    `t=${timestamp}`,
    `v1=${await sign(secret, timestamp, payload)}`,
    `t=notanumber,v1=${await sign(secret, timestamp, payload)}`,
    `t=${timestamp},v1=zzzz`,
    `t=${timestamp},v1=abc`,
  ];
  for (const header of cases) {
    assertEquals(
      await verifyStripeSignature(payload, header, secret, timestamp + 5),
      false,
      `expected rejection for header: ${header}`,
    );
  }
  assertEquals(await verifyStripeSignature("", `t=${timestamp},v1=x`, secret, timestamp), false);
  assertEquals(await verifyStripeSignature(payload, null, secret, timestamp), false);
  assertEquals(await verifyStripeSignature(payload, `t=${timestamp},v1=x`, undefined, timestamp), false);
});
