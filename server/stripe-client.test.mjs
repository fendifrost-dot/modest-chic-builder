import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { buildCheckoutBody, verifyStripeSignature } from "./stripe-client.mjs";

test("checkout prices come from the catalog unit amount", () => {
  const body = buildCheckoutBody({
    origin: "https://bemoremodest.com",
    handoffId: "abc123def456",
    items: [
      {
        title: "Heart Chakra Bear Tee — Berry / M",
        quantity: 2,
        unitAmount: 4800,
        printifyProductId: "p1",
        printifyVariantId: 101,
      },
    ],
  });
  assert.equal(body.line_items[0].price_data.unit_amount, 4800);
  assert.equal(body.line_items[0].quantity, 2);
  assert.equal(body.mode, "payment");
  assert.equal(body.shipping_options[0].shipping_rate_data.fixed_amount.amount, 800);
  assert.match(body.success_url, /session_id=\{CHECKOUT_SESSION_ID\}/);
});

test("free shipping applies at $200", () => {
  const body = buildCheckoutBody({
    origin: "https://bemoremodest.com",
    handoffId: "abc123def456",
    items: [{ title: "Knit", quantity: 1, unitAmount: 22000, printifyProductId: "p", printifyVariantId: 1 }],
  });
  assert.equal(body.shipping_options[0].shipping_rate_data.fixed_amount.amount, 0);
});

test("webhook signatures accept the current v1 and reject tampering", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
  const timestamp = 1_700_000_000;
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const header = `t=${timestamp},v1=${signature}`;
  assert.equal(verifyStripeSignature(payload, header, secret, timestamp + 10), true);
  assert.equal(verifyStripeSignature(`${payload} `, header, secret, timestamp + 10), false);
  assert.equal(verifyStripeSignature(payload, header, secret, timestamp + 400), false);
});
