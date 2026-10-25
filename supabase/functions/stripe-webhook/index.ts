// POST /stripe-webhook
//
// Replaces POST /api/webhooks/stripe in server/api.mjs. Differences, all deliberate:
//
//  - Fulfilment is claimed by inserting the orders row before any Printify call, so
//    two concurrent deliveries cannot both place an order.
//  - A missing handoff is terminal: it records status 'needs_attention' and returns
//    200. The Node version returned 500, which made Stripe retry for three days
//    something no retry could fix, and raised no alert.
//  - A Printify failure releases the claim and returns 500, so Stripe's retry can
//    genuinely succeed.
//  - Handles the async payment events. Affirm and ACH complete a session before the
//    money confirms; without these, those orders would never be fulfilled.
//
// This function must run with verify_jwt = false: Stripe cannot send a Supabase JWT.
// The Stripe-Signature check below is what authenticates the caller.

import { env } from "../_shared/env.ts";
import { corsHeaders, json } from "../_shared/http.ts";
import { createPrintifyOrder } from "../_shared/printify-orders.ts";
import {
  claimOrder,
  readHandoff,
  recordWebhookEvent,
  releaseOrder,
  writeOrder,
} from "../_shared/store.ts";
import { retrieveCheckoutSession, stripeConfigured, verifyStripeSignature } from "../_shared/stripe.ts";

const FULFIL_ON = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

// deno-lint-ignore no-explicit-any
type Session = any;

function isPaid(session: Session): boolean {
  const status = session?.payment_status;
  // Absent means an older payload shape; treat as paid, matching the Node version.
  if (!status) return true;
  return status === "paid" || status === "no_payment_required";
}

async function fulfil(session: Session): Promise<Record<string, unknown>> {
  const handoffId: string | null = session?.metadata?.handoff_id ?? null;

  const claimed = await claimOrder(session.id, handoffId);
  if (!claimed) return { received: true, duplicate: true };

  try {
    const handoff = handoffId ? await readHandoff(handoffId) : null;

    if (!handoff) {
      // Terminal. The cart is gone, so no retry can complete this. Record it so
      // it shows up in `select * from orders where status = 'needs_attention'`.
      const result = {
        status: "needs_attention",
        reason: handoffId
          ? `Checkout handoff ${handoffId} was not found`
          : "Stripe session carried no handoff_id",
        customerEmail: session?.customer_details?.email ?? null,
        amountTotal: session?.amount_total ?? null,
      };
      await writeOrder(session.id, handoffId, "needs_attention", result);
      console.error(`order needs attention: ${session.id} — ${result.reason}`);
      return { received: true, result };
    }

    // The completed event often omits shipping_details; Printify needs the address.
    let full = session;
    if (!session.shipping_details && stripeConfigured()) {
      full = await retrieveCheckoutSession(session.id);
    }

    const result = handoff.source === "preorder"
      ? { status: "preorder_held", fulfillment: "preorder", printify: false }
      : await createPrintifyOrder({ session: full, handoff });

    await writeOrder(session.id, handoffId, result.status, result as Record<string, unknown>);
    return { received: true, result };
  } catch (error) {
    // Possibly transient (Printify timeout, rate limit). Drop the claim so Stripe's
    // retry gets a clean attempt, and let this surface as a 500.
    await releaseOrder(session.id);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; refusing webhook");
    return json({ error: "Webhook is not configured" }, 500);
  }

  // Must be the bytes exactly as sent. Never verify against re-serialised JSON.
  const raw = await req.text();
  const valid = await verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret);
  if (!valid) {
    return json({ error: "Invalid Stripe signature" }, 400);
  }

  let event: { id?: string; type?: string; data?: { object?: Session } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const type = String(event.type || "");
  const object = event.data?.object;
  const sessionId = typeof object?.id === "string" && object.id.startsWith("cs_") ? object.id : null;
  if (event.id) await recordWebhookEvent(event.id, type, sessionId);

  try {
    if (FULFIL_ON.has(type)) {
      if (!object?.id) return json({ error: "Missing session" }, 400);
      if (!isPaid(object)) {
        // Async method (Affirm, ACH). Wait for async_payment_succeeded.
        return json({ received: true, pending: object.payment_status });
      }
      return json(await fulfil(object));
    }

    if (type === "checkout.session.async_payment_failed") {
      if (object?.id) {
        await writeOrder(object.id, object?.metadata?.handoff_id ?? null, "payment_failed", {
          status: "payment_failed",
          paymentStatus: object?.payment_status ?? null,
          customerEmail: object?.customer_details?.email ?? null,
        });
      }
      console.error(`async payment failed for session ${object?.id}`);
      return json({ received: true, recorded: type });
    }

    if (type === "charge.dispute.created") {
      // Logged, not auto-handled. Someone has to decide how to respond.
      console.error(
        `DISPUTE opened: charge ${object?.charge ?? "unknown"}, amount ${object?.amount ?? "?"}, reason ${object?.reason ?? "?"}`,
      );
      return json({ received: true, recorded: type });
    }

    if (type === "charge.refunded" || type === "checkout.session.expired") {
      return json({ received: true, recorded: type });
    }

    return json({ received: true, ignored: type });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error(`webhook ${type} failed: ${message}`);
    // 500 asks Stripe to retry. The orders claim has already been released.
    return json({ error: message }, 500);
  }
});
