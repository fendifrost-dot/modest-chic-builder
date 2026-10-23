import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { handleRequest } from "./api.mjs";
import { isPurchasablePreorder, publicPreorders, resolvePreorderItems } from "./preorders.mjs";
import { buildCheckoutBody } from "./stripe-client.mjs";

test("seeded concepts stay visible and are not for sale", () => {
  delete process.env.PREORDERS_PATH;
  const list = publicPreorders();
  assert.equal(list.awaitingFounder, true);
  assert.deepEqual(
    list.items.map((item) => item.id),
    [
      "concept-cap-grey-white",
      "concept-cap-tan",
      "concept-cap-golden",
      "concept-cap-brown-black",
      "concept-bear-pin-set",
    ],
  );
  for (const item of list.items) {
    assert.equal(item.purchasable, false);
    assert.equal(item.title, "");
    assert.equal(item.expectedShip, "");
    assert.equal(item.priceCents, null);
    assert.equal(item.summary.includes("$"), false);
    assert.match(item.summary, /cap|pin set/);
    assert.ok(item.images.length >= 1);
    for (const image of item.images) {
      const file = join(process.cwd(), "public", image.src.replace(/^\//, ""));
      assert.equal(existsSync(file), true);
      assert.equal(existsSync(file.replace(/\.webp$/, "-720.webp")), true);
    }
    assert.throws(() => resolvePreorderItems([{ id: item.id, quantity: 1 }]), /not open/);
  }
  assert.equal(list.items.find((item) => item.id === "concept-cap-grey-white").images.length, 2);
  assert.equal(list.items.find((item) => item.id === "concept-bear-pin-set").images.length, 1);
  assert.equal(isPurchasablePreorder({ enabled: true, title: "Polo", expectedShip: "", priceCents: null, id: "x" }), false);
});

test("a filled pre-order uses the Founder's price and is labeled for Stripe", () => {
  const dir = mkdtempSync(join(tmpdir(), "preorders-"));
  const file = join(dir, "preorders.json");
  writeFileSync(
    file,
    JSON.stringify({
      items: [
        {
          id: "piece-1",
          handle: "piece-1",
          title: "Studio polo",
          summary: "Not produced yet.",
          expectedShip: "Founder window",
          priceCents: 12000,
          currency: "USD",
          image: "",
          enabled: true,
        },
      ],
    }),
  );
  process.env.PREORDERS_PATH = file;
  try {
    const [line] = resolvePreorderItems([{ id: "piece-1", quantity: 1, unitAmount: 1 }]);
    assert.equal(line.unitAmount, 12000);
    assert.equal(line.title, "Pre-order: Studio polo");
    assert.match(line.description, /Expected ship: Founder window/);
    assert.equal(line.printifyProductId, undefined);
    const body = buildCheckoutBody({
      origin: "https://bemoremodest.com",
      handoffId: "abc123def456",
      items: [line],
      fulfillment: "preorder",
    });
    assert.equal(body.metadata.fulfillment, "preorder");
    assert.equal(body.line_items[0].price_data.unit_amount, 12000);
    assert.equal(body.line_items[0].price_data.product_data.description, line.description);
    assert.equal(body.line_items[0].price_data.product_data.metadata.printify_product_id, undefined);
  } finally {
    delete process.env.PREORDERS_PATH;
  }
});

test("paid pre-order checkout is recorded and not sent to Printify", async () => {
  const dir = mkdtempSync(join(tmpdir(), "preorder-api-"));
  process.env.MODEST_DATA_DIR = dir;
  process.env.PREORDERS_PATH = join(dir, "preorders.json");
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_preorder_test";
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.PRINTIFY_API_TOKEN;
  delete process.env.PRINTIFY_SHOP_ID;
  writeFileSync(
    process.env.PREORDERS_PATH,
    JSON.stringify({
      items: [
        {
          id: "piece-9",
          handle: "piece-9",
          title: "Upcoming piece",
          summary: "Not produced.",
          expectedShip: "When the Founder names the window",
          priceCents: 9000,
          currency: "USD",
          image: "",
          enabled: true,
        },
      ],
    }),
  );
  const server = createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      res.statusCode = 500;
      res.end(error.message);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  try {
    const list = await fetch(`${base}/api/preorders`).then((res) => res.json());
    assert.equal(list.items.length, 1);
    assert.equal(list.items[0].priceCents, 9000);
    const checkout = await fetch(`${base}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "preorder", items: [{ id: "piece-9", quantity: 1, unitAmount: 1 }] }),
    }).then((res) => res.json());
    const sessionId = new URL(checkout.url, base).searchParams.get("session_id");
    const session = await fetch(`${base}/api/checkout/sessions/${sessionId}`).then((res) => res.json());
    assert.equal(session.source, "preorder");
    assert.equal(session.items[0].unitAmount, 9000);
    const payload = JSON.stringify({
      id: "evt_preorder_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_preorder123",
          payment_status: "paid",
          metadata: { handoff_id: session.handoffId, fulfillment: "preorder" },
          customer_details: { email: "a@bemoremodest.com", name: "A Buyer" },
          shipping_details: {
            name: "A Buyer",
            address: { line1: "1 N State", city: "Chicago", state: "IL", postal_code: "60602", country: "US" },
          },
        },
      },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest("hex");
    const webhook = await fetch(`${base}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": `t=${timestamp},v1=${signature}` },
      body: payload,
    }).then((res) => res.json());
    assert.equal(webhook.result.status, "preorder_held");
    assert.equal(webhook.result.printify, false);
  } finally {
    delete process.env.PREORDERS_PATH;
    await new Promise((resolve) => server.close(resolve));
  }
});
