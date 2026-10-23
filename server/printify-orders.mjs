/**
 * Paid-order handoff. Creates a Printify order after Stripe confirms payment.
 * Orders stay in Printify as drafts unless PRINTIFY_AUTO_SUBMIT=true.
 */

function splitName(full) {
  const parts = String(full || "Customer").trim().split(/\s+/);
  return {
    first_name: parts[0] || "Customer",
    last_name: parts.slice(1).join(" ") || "Order",
  };
}

export function addressFromSession(session) {
  const shipping = session?.shipping_details || session?.customer_details || {};
  const address = shipping.address || session?.customer_details?.address;
  if (!address?.line1 || !address?.country) return null;
  const name = splitName(shipping.name || session?.customer_details?.name);
  return {
    ...name,
    email: session?.customer_details?.email || session?.customer_email || "",
    phone: session?.customer_details?.phone || shipping.phone || "0000000000",
    country: address.country,
    region: address.state || "",
    address1: address.line1,
    address2: address.line2 || "",
    city: address.city || "",
    zip: address.postal_code || "",
  };
}

export async function createPrintifyOrder({ session, handoff, fetchImpl = fetch }) {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!token || !shopId) {
    return { status: "pending_printify", reason: "Printify credentials are not set" };
  }

  const address_to = addressFromSession(session);
  if (!address_to) {
    throw new Error("Stripe session is missing a shipping address");
  }

  const base = (process.env.PRINTIFY_API_BASE || "https://api.printify.com/v1").replace(/\/$/, "");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "ModestStorefront",
  };
  const line_items = handoff.items.map((item) => ({
    product_id: item.printifyProductId,
    variant_id: item.printifyVariantId,
    quantity: item.quantity,
  }));

  const shippingResponse = await fetchImpl(`${base}/shops/${encodeURIComponent(shopId)}/orders/shipping.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ line_items, address_to }),
  });
  const shippingBody = await shippingResponse.json();
  if (!shippingResponse.ok) {
    throw new Error(`Printify shipping lookup failed (${shippingResponse.status})`);
  }
  const methods = Array.isArray(shippingBody) ? shippingBody : shippingBody?.data || [];
  if (!methods.length) {
    throw new Error("Printify returned no shipping methods");
  }
  const cheapest = [...methods].sort((a, b) => Number(a.cost ?? a.rate ?? 0) - Number(b.cost ?? b.rate ?? 0))[0];

  const orderResponse = await fetchImpl(`${base}/shops/${encodeURIComponent(shopId)}/orders.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      external_id: session.id,
      label: `Modest ${session.id}`,
      line_items,
      shipping_method: cheapest.id,
      send_shipping_notification: false,
      address_to,
    }),
  });
  const order = await orderResponse.json();
  if (!orderResponse.ok) {
    throw new Error(order?.message || order?.error || `Printify order failed (${orderResponse.status})`);
  }

  let submitted = false;
  if (String(process.env.PRINTIFY_AUTO_SUBMIT || "").toLowerCase() === "true" && order?.id) {
    const submit = await fetchImpl(
      `${base}/shops/${encodeURIComponent(shopId)}/orders/${encodeURIComponent(order.id)}/send_to_production.json`,
      { method: "POST", headers },
    );
    if (!submit.ok) {
      throw new Error(`Printify send_to_production failed (${submit.status})`);
    }
    submitted = true;
  }

  return {
    status: submitted ? "submitted" : "draft_created",
    printifyOrderId: order.id,
    shippingMethod: cheapest.id,
  };
}
