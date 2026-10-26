/**
 * Printify catalog fetch + cache, ported from server/catalog.mjs.
 *
 * The cache is module-level, so it lives as long as a warm edge function instance.
 * That is shorter than the Node process it replaces, which only means more Printify
 * calls on cold starts, never stale data beyond the TTL.
 */

import { env } from "./env.ts";
import {
  type CatalogProduct,
  type CatalogQuery,
  dedupeHandles,
  filterCatalog,
  isPrintifyVisible,
  normalizePrintifyProduct,
  previewProducts,
  resolvePrintifyShopId,
  skipSkuSet,
} from "./catalog-model.ts";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_PAGES = 20;

let cache: { at: number; key: string; products: CatalogProduct[] | null } = {
  at: 0,
  key: "",
  products: null,
};

export type CatalogMode = "printify" | "preview";

export function printifyConfigured(): boolean {
  return Boolean(env("PRINTIFY_API_TOKEN"));
}

export function resetCatalogCache(): void {
  cache = { at: 0, key: "", products: null };
}

function cacheTtl(): number {
  const configured = Number(env("PRINTIFY_CACHE_TTL_MS"));
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_TTL_MS;
}

export function printifyBase(): string {
  return (env("PRINTIFY_API_BASE") || "https://api.printify.com/v1").replace(/\/$/, "");
}

export function printifyHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${env("PRINTIFY_API_TOKEN")}`,
    "User-Agent": "ModestStorefront",
    Accept: "application/json",
    ...extra,
  };
}

async function fetchPrintifyProducts(fetchImpl: typeof fetch): Promise<CatalogProduct[]> {
  const shopId = resolvePrintifyShopId();
  const base = printifyBase();
  const headers = printifyHeaders();
  const skip = skipSkuSet();
  const collected: CatalogProduct[] = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage && page <= MAX_PAGES) {
    const response = await fetchImpl(
      `${base}/shops/${encodeURIComponent(shopId)}/products.json?limit=50&page=${page}`,
      { headers },
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Printify catalog failed (${response.status}): ${detail.slice(0, 180)}`);
    }
    const body = await response.json();
    const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
    lastPage = Number(body?.last_page || body?.meta?.last_page || 1);
    for (const row of rows) {
      if (!isPrintifyVisible(row)) continue;
      const product = normalizePrintifyProduct(row, skip);
      if (product) collected.push(product);
    }
    page += 1;
  }

  return dedupeHandles(collected);
}

export async function listProducts(
  { fetchImpl = fetch, force = false }: { fetchImpl?: typeof fetch; force?: boolean } = {},
): Promise<{ mode: CatalogMode; products: CatalogProduct[] }> {
  if (!printifyConfigured()) {
    return { mode: "preview", products: previewProducts() };
  }

  const key = `${resolvePrintifyShopId()}:${env("PRINTIFY_SKIP_SKUS") || ""}`;
  const fresh = cache.products && cache.key === key && Date.now() - cache.at < cacheTtl();
  if (fresh && !force) {
    return { mode: "printify", products: cache.products! };
  }

  const products = await fetchPrintifyProducts(fetchImpl);
  cache = { at: Date.now(), key, products };
  return { mode: "printify", products };
}

export async function queryProducts(
  params: CatalogQuery = {},
): Promise<{ mode: CatalogMode; products: CatalogProduct[] }> {
  const { mode, products } = await listProducts();
  return { mode, products: filterCatalog(products, params) };
}

export async function productByHandle(
  handle: string,
): Promise<{ mode: CatalogMode; product: CatalogProduct | null }> {
  const { mode, products } = await listProducts();
  return { mode, product: products.find((item) => item.handle === handle) || null };
}
