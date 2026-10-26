/**
 * Paid-order handoff, ported from server/printify-orders.mjs.
 * Creates a Printify order after Stripe confirms payment. Orders stay as drafts
 * unless PRINTIFY_AUTO_SUBMIT=true.
 */

import { env, envFlag } from "./env.ts";
import { printifyBase, printifyHeaders } from "./catalog.ts";
import { resolvePrintifyShopId } from "./catalog-model.ts";
import type { Handoff } from "./store.ts";

export interface PrintifyResult {
  status: string;
  reason?: string;
  printifyOrderId?: string;
  shippingMethod?: unknown;
}

function splitName(full: unknown) {
  const parts = String(full || "Customer").trim().split(/\s+/);
  return {
    first_name: parts[0] || "Customer",
    last_name: parts.slice(1).join(" ") || "Order",
  };
}

// deno-lint-ignore no-explicit-any
export function addressFromSession(session: any) {
  const shipping = session?.shipping_details || session?.customer_details || {};
  const address = shipping.address || session?.customer_details?.address;
  if (!address?.line1 || !address?.country) return null;
  return {
    ...splitName(shipping.name || session?.customer_details?.name),
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

export async function createPrintifyOrder(
  // deno-lint-ignore no-explicit-any
  { session, handoff, fetchImpl = fetch }: { session: any; handoff: Handoff; fetchImpl?: typeof fetch },
): Promise<PrintifyResult> {
  if (!env("PRINTIFY_API_TOKEN")) {
    return { status: "pending_printify", reason: "Printify credentials are not set" };
  }
  let shopId: string;
  try {
    shopId = resolvePrintifyShopId();
  } catch (error) {
    return { status: "pending_printify", reason: (error as Error).message };
  }

  const address_to = addressFromSession(session);
  if (!address_to) {
    throw new Error("Stripe session is missing a shipping address");
  }

  const base = printifyBase();
  const headers = printifyHeaders({ "Content-Type": "application/json" });
  const line_items = handoff.items.map((item) => ({
    product_id: item.printifyProductId,
    variant_id: item.printifyVariantId,
    quantity: item.quantity,
  }));

  const shippingResponse = await fetchImpl(
    `${base}/shops/${encodeURIComponent(shopId)}/orders/shipping.json`,
    { method: "POST", headers, body: JSON.stringify({ line_items, address_to }) },
  );
  const shippingBody = await shippingResponse.json();
  if (!shippingResponse.ok) {
    throw new Error(`Printify shipping lookup failed (${shippingResponse.status})`);
  }
  const methods = Array.isArray(shippingBody) ? shippingBody : shippingBody?.data || [];
  if (!methods.length) {
    throw new Error("Printify returned no shipping methods");
  }
  const cheapest = [...methods].sort(
    // deno-lint-ignore no-explicit-any
    (a: any, b: any) => Number(a.cost ?? a.rate ?? 0) - Number(b.cost ?? b.rate ?? 0),
  )[0];

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
  if (envFlag("PRINTIFY_AUTO_SUBMIT") && order?.id) {
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
