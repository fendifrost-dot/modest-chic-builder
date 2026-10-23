import {
  dedupeHandles,
  filterCatalog,
  isPrintifyVisible,
  normalizePrintifyProduct,
  previewProducts,
  resolvePrintifyShopId,
  skipSkuSet,
} from "./catalog-model.mjs";

const DEFAULT_TTL_MS = 5 * 60 * 1000;

let cache = { at: 0, key: "", products: null, mode: "preview" };

export function printifyConfigured() {
  return Boolean(process.env.PRINTIFY_API_TOKEN);
}

export function resetCatalogCache() {
  cache = { at: 0, key: "", products: null, mode: "preview" };
}

function cacheTtl() {
  const configured = Number(process.env.PRINTIFY_CACHE_TTL_MS);
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_TTL_MS;
}

async function fetchPrintifyProducts(fetchImpl) {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = resolvePrintifyShopId();
  const base = (process.env.PRINTIFY_API_BASE || "https://api.printify.com/v1").replace(/\/$/, "");
  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "ModestStorefront",
    Accept: "application/json",
  };
  const skip = skipSkuSet();
  const collected = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage && page <= 20) {
    const response = await fetchImpl(`${base}/shops/${encodeURIComponent(shopId)}/products.json?limit=50&page=${page}`, {
      headers,
    });
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

export async function listProducts({ fetchImpl = fetch, force = false } = {}) {
  if (!printifyConfigured()) {
    return { mode: "preview", products: previewProducts() };
  }

  const key = `${resolvePrintifyShopId()}:${process.env.PRINTIFY_SKIP_SKUS || ""}`;
  const fresh = cache.products && cache.key === key && Date.now() - cache.at < cacheTtl();
  if (fresh && !force) {
    return { mode: "printify", products: cache.products };
  }

  const products = await fetchPrintifyProducts(fetchImpl);
  cache = { at: Date.now(), key, products, mode: "printify" };
  return { mode: "printify", products };
}

export async function queryProducts(params = {}, options = {}) {
  const { mode, products } = await listProducts(options);
  return { mode, products: filterCatalog(products, params) };
}

export async function productByHandle(handle, options = {}) {
  const { mode, products } = await listProducts(options);
  const product = products.find((item) => item.handle === handle) || null;
  return { mode, product };
}
