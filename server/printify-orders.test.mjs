import assert from "node:assert/strict";
import test from "node:test";
import { createPrintifyOrder } from "./printify-orders.mjs";

test("paid session becomes a Printify draft order", async () => {
  const previousToken = process.env.PRINTIFY_API_TOKEN;
  const previousShop = process.env.PRINTIFY_SHOP_ID;
  process.env.PRINTIFY_API_TOKEN = "token";
  process.env.PRINTIFY_SHOP_ID = "shop_1";
  delete process.env.PRINTIFY_AUTO_SUBMIT;
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, body: options.body });
    if (String(url).includes("/shipping.json")) {
      return { ok: true, json: async () => [{ id: 1, cost: 499 }, { id: 2, cost: 799 }] };
    }
    return { ok: true, json: async () => ({ id: "order_9" }) };
  };
  try {
    const result = await createPrintifyOrder({
      fetchImpl,
      handoff: { items: [{ printifyProductId: "prod_1", printifyVariantId: 55, quantity: 1 }] },
      session: {
        id: "cs_test_123456",
        customer_details: { email: "buyer@example.com", phone: "+13125550100", name: "A Buyer" },
        shipping_details: {
          name: "A Buyer",
          address: {
            line1: "1 N State",
            city: "Chicago",
            state: "IL",
            postal_code: "60602",
            country: "US",
          },
        },
      },
    });
    assert.equal(result.status, "draft_created");
    assert.equal(result.printifyOrderId, "order_9");
    const order = JSON.parse(calls[1].body);
    assert.equal(order.external_id, "cs_test_123456");
    assert.equal(order.shipping_method, 1);
    assert.equal(order.line_items[0].product_id, "prod_1");
    assert.equal(order.address_to.city, "Chicago");
  } finally {
    if (previousToken == null) delete process.env.PRINTIFY_API_TOKEN;
    else process.env.PRINTIFY_API_TOKEN = previousToken;
    if (previousShop == null) delete process.env.PRINTIFY_SHOP_ID;
    else process.env.PRINTIFY_SHOP_ID = previousShop;
  }
});
