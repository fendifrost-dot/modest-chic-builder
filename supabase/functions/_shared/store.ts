/**
 * Durable record store, backed by Postgres.
 *
 * Replaces server/store.mjs, which wrote JSON files under data/. That store loses
 * every pending handoff when the host restarts, so a customer could be charged and
 * the webhook would then fail to find the cart it was supposed to fulfil.
 *
 * Uses the service role key, so these calls bypass RLS. The tables carry RLS with
 * no policies, which means nothing else can reach them.
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { requireEnv } from "./env.ts";

export interface HandoffItem {
  fulfillment?: string;
  productId: string;
  handle: string;
  title: string;
  description?: string;
  expectedShip?: string;
  printifyProductId?: string;
  printifyVariantId?: number;
  variantId?: string;
  quantity: number;
  unitAmount: number;
  currency: string;
}

export interface Handoff {
  id: string;
  source: "catalog" | "preorder";
  items: HandoffItem[];
  createdAt: string;
}

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) {
    client = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function writeHandoff(handoff: Handoff): Promise<void> {
  const { error } = await db().from("checkout_handoffs").insert({
    id: handoff.id,
    source: handoff.source,
    items: handoff.items,
    created_at: handoff.createdAt,
  });
  if (error) throw new Error(`Could not record checkout handoff: ${error.message}`);
}

export async function readHandoff(id: string): Promise<Handoff | null> {
  const { data, error } = await db()
    .from("checkout_handoffs")
    .select("id, source, items, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not read checkout handoff: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    source: data.source,
    items: (data.items ?? []) as HandoffItem[],
    createdAt: data.created_at,
  };
}

export async function writeSession(
  id: string,
  payload: Record<string, unknown>,
  handoffId: string | null,
): Promise<void> {
  const { error } = await db()
    .from("checkout_sessions")
    .upsert({ id, handoff_id: handoffId, payload }, { onConflict: "id" });
  if (error) throw new Error(`Could not record checkout session: ${error.message}`);
}

export async function readSession(id: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await db()
    .from("checkout_sessions")
    .select("payload")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not read checkout session: ${error.message}`);
  return (data?.payload as Record<string, unknown>) ?? null;
}

export async function readOrder(sessionId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await db()
    .from("orders")
    .select("session_id, handoff_id, status, result, recorded_at")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(`Could not read order: ${error.message}`);
  return data ?? null;
}

export async function writeOrder(
  sessionId: string,
  handoffId: string | null,
  status: string,
  result: Record<string, unknown>,
): Promise<void> {
  const { error } = await db()
    .from("orders")
    .upsert({ session_id: sessionId, handoff_id: handoffId, status, result }, { onConflict: "session_id" });
  if (error) throw new Error(`Could not record order: ${error.message}`);
}

const UNIQUE_VIOLATION = "23505";

/**
 * Takes exclusive ownership of fulfilling a session by inserting its orders row.
 * Returns false when a row already exists, meaning another delivery of this event
 * is in flight or already finished — the caller must then do nothing.
 *
 * This, not the event id, is the guard against double-ordering: Stripe sends more
 * than one event type for the same session, and any of them could fulfil it.
 */
export async function claimOrder(sessionId: string, handoffId: string | null): Promise<boolean> {
  const { error } = await db()
    .from("orders")
    .insert({ session_id: sessionId, handoff_id: handoffId, status: "processing", result: {} });
  if (!error) return true;
  if (error.code === UNIQUE_VIOLATION) return false;
  throw new Error(`Could not claim order: ${error.message}`);
}

/**
 * Drops a claim so Stripe's next retry can try again.
 *
 * Call this only for failures that a retry might fix, such as a Printify timeout.
 * For a permanent failure, write a terminal status instead and return 200, because
 * retrying something unfixable just delays the alert.
 */
export async function releaseOrder(sessionId: string): Promise<void> {
  const { error } = await db().from("orders").delete().eq("session_id", sessionId);
  if (error) console.error(`Could not release order claim ${sessionId}: ${error.message}`);
}

/** Append-only audit log of received events. Best effort; never blocks fulfilment. */
export async function recordWebhookEvent(
  id: string,
  type: string,
  sessionId: string | null,
): Promise<void> {
  const { error } = await db()
    .from("stripe_webhook_events")
    .insert({ id, type, session_id: sessionId });
  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error(`Could not log webhook event ${id}: ${error.message}`);
  }
}
