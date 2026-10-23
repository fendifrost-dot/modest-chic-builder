import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { handleRequest } from "./api.mjs";

process.env.MODEST_DATA_DIR = mkdtempSync(join(tmpdir(), "modest-"));
delete process.env.PRINTIFY_API_TOKEN;
delete process.env.PRINTIFY_SHOP_ID;
delete process.env.STRIPE_SECRET_KEY;
process.env.STRIPE_WEBHOOK_SECRET = "whsec_api_test";

function listen() {
  const server = createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      res.statusCode = 500;
      res.end(error.message);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

test("preview catalog, mock checkout, and signed webhook", async () => {
  const server = await listen();
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    const health = await fetch(`${base}/api/health`).then((res) => res.json());
    assert.equal(health.catalog, "preview");
    assert.equal(health.checkout, "mock");

    const catalog = await fetch(`${base}/api/catalog?collection=featured`).then((res) => res.json());
    assert.equal(catalog.mode, "preview");
    assert.ok(catalog.products.length >= 1);
    assert.equal(catalog.products.some((product) => /jacket/i.test(product.title)), false);

    const variantId = catalog.products[0].variants[0].id;
    const checkout = await fetch(`${base}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ variantId, quantity: 1, unitAmount: 1 }],
      }),
    }).then((res) => res.json());
    assert.equal(checkout.mode, "mock");
    assert.match(checkout.url, /^\/checkout\/success\?session_id=/);

    const sessionId = new URL(checkout.url, base).searchParams.get("session_id");
    const session = await fetch(`${base}/api/checkout/sessions/${sessionId}`).then((res) => res.json());
    assert.equal(session.payment_status, "unpaid");
    assert.equal(session.items[0].unitAmount, catalog.products[0].variants[0].unitAmount);

    const gone = await fetch(`${base}/product/bzo-bomber-jacket`);
    assert.equal(gone.status, 410);

    const payload = JSON.stringify({
      id: "evt_test_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_webhook123",
          payment_status: "paid",
          metadata: { handoff_id: session.handoffId },
          customer_details: { email: "a@bemoremodest.com", name: "A Buyer" },
          shipping_details: {
            name: "A Buyer",
            address: { line1: "1 N State", city: "Chicago", state: "IL", postal_code: "60602", country: "US" },
          },
        },
      },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${payload}`)
      .digest("hex");
    const webhook = await fetch(`${base}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": `t=${timestamp},v1=${signature}` },
      body: payload,
    });
    const webhookBody = await webhook.json();
    assert.equal(webhook.status, 200);
    assert.equal(webhookBody.result.status, "pending_printify");

    const rejected = await fetch(`${base}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": "t=1,v1=deadbeef" },
      body: payload,
    });
    assert.equal(rejected.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
