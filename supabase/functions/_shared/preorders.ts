/**
 * "What's to Come" pre-orders, ported from server/preorders.mjs.
 *
 * The Node version read content/preorders.json off disk. An edge function has no
 * repo filesystem, and checkout must take the price from a source the server
 * controls, so the rows now live in public.preorders. The validation rules are
 * unchanged: a piece is only purchasable with enabled=true AND a title, an
 * expected ship message, and a positive integer price.
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { requireEnv } from "./env.ts";
import { badRequest } from "./http.ts";
import type { HandoffItem } from "./store.ts";

export interface PreorderImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PreorderRow {
  id: string;
  handle: string;
  title: string;
  colorway: string;
  summary: string;
  expectedShip: string;
  priceCents: number | null;
  currency: string;
  images: PreorderImage[];
  enabled: boolean;
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

export function missingPreorderFields(item: Partial<PreorderRow>): string[] {
  const missing: string[] = [];
  if (!String(item?.title || "").trim()) missing.push("title");
  if (!String(item?.expectedShip || "").trim()) missing.push("expectedShip");
  if (!Number.isInteger(item?.priceCents) || (item.priceCents as number) <= 0) missing.push("priceCents");
  if (!String(item?.id || "").trim()) missing.push("id");
  return missing;
}

export function isPurchasablePreorder(item: Partial<PreorderRow>): boolean {
  return item?.enabled === true && missingPreorderFields(item).length === 0;
}

function normalizeImages(raw: unknown): PreorderImage[] {
  const listed = Array.isArray(raw) ? raw : [];
  return listed
    .map((image) => {
      const src = String((image as PreorderImage)?.src || "").trim();
      if (!src) return null;
      const entry = image as Partial<PreorderImage>;
      return {
        src,
        alt: String(entry.alt || "").trim(),
        width: Number.isInteger(entry.width) ? (entry.width as number) : 1200,
        height: Number.isInteger(entry.height) ? (entry.height as number) : 1600,
      };
    })
    .filter((image): image is PreorderImage => image !== null);
}

export async function loadPreorderItems(): Promise<PreorderRow[]> {
  const { data, error } = await db()
    .from("preorders")
    .select("id, handle, title, colorway, summary, expected_ship, price_cents, currency, images, enabled")
    .order("position", { ascending: true });
  if (error) throw new Error(`Could not read pre-orders: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    handle: String(row.handle || row.id),
    title: String(row.title || "").trim(),
    colorway: String(row.colorway || "").trim(),
    summary: String(row.summary || "").trim(),
    expectedShip: String(row.expected_ship || "").trim(),
    priceCents: Number.isInteger(row.price_cents) ? row.price_cents : null,
    currency: row.currency || "USD",
    images: normalizeImages(row.images),
    enabled: row.enabled === true,
  }));
}

function isListedConcept(item: PreorderRow): boolean {
  if (!item.id) return false;
  const copy = [item.title, item.summary, item.colorway].map((value) => value.trim()).find(Boolean);
  return Boolean(copy || item.images.length || isPurchasablePreorder(item));
}

export async function publicPreorders(): Promise<{
  items: Array<Omit<PreorderRow, "enabled"> & { image: string; purchasable: boolean }>;
  awaitingFounder: boolean;
}> {
  const items = (await loadPreorderItems()).filter(isListedConcept).map((item) => ({
    id: item.id,
    handle: item.handle,
    title: item.title,
    colorway: item.colorway,
    summary: item.summary,
    expectedShip: item.expectedShip,
    priceCents: item.priceCents,
    currency: item.currency,
    images: item.images,
    image: item.images[0]?.src || "",
    purchasable: isPurchasablePreorder(item),
  }));
  return { items, awaitingFounder: items.every((item) => !item.purchasable) };
}

/** Resolves a client-supplied pre-order cart into priced line items. */
export async function resolvePreorderItems(
  items: Array<{ id?: unknown; quantity?: unknown }> | unknown,
): Promise<HandoffItem[]> {
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    throw badRequest("Choose a pre-order piece");
  }
  const catalog = await loadPreorderItems();
  return items.map((item) => {
    const quantity = Number(item?.quantity ?? 1);
    if (!item?.id || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw badRequest("Invalid pre-order");
    }
    const found = catalog.find((entry) => entry.id === item.id);
    if (!found || !isPurchasablePreorder(found)) {
      throw badRequest("That pre-order is not open");
    }
    return {
      fulfillment: "preorder",
      productId: found.id,
      handle: found.handle,
      title: `Pre-order: ${found.title}`,
      description: `Pre-order. This piece is not in production yet. Expected ship: ${found.expectedShip}`,
      expectedShip: found.expectedShip,
      quantity,
      unitAmount: found.priceCents as number,
      currency: found.currency || "USD",
    };
  });
}
