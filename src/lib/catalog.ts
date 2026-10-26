import { callFunction } from "./functions";

export { FUTURE_DROPSHIP } from "./roadmap";

export interface CatalogImage {
  url: string;
  alt: string | null;
  variantIds: string[];
}

export interface CatalogOption {
  name: string;
  value: string;
}

export interface CatalogVariant {
  id: string;
  title: string;
  sku: string | null;
  price: { amount: string; currencyCode: string };
  unitAmount: number;
  availableForSale: boolean;
  selectedOptions: CatalogOption[];
  image?: { url: string; alt: string | null } | null;
  printifyVariantId: number;
}

export interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  images: CatalogImage[];
  options: Array<{ name: string; values: string[] }>;
  variants: CatalogVariant[];
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  createdAt: string | null;
  updatedAt: string | null;
  printifyProductId: string;
  blueprintId: number | null;
}

export type CatalogMode = "printify" | "preview";

export interface CatalogResponse {
  mode: CatalogMode;
  products: CatalogProduct[];
}

interface CatalogParams {
  limit?: number;
  query?: string;
  collection?: string;
  sort?: string;
}

export async function fetchCatalog(params: CatalogParams = {}): Promise<CatalogResponse> {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.query) search.set("query", params.query);
  if (params.collection) search.set("collection", params.collection);
  if (params.sort) search.set("sort", params.sort);
  const response = await callFunction(`catalog?${search.toString()}`);
  if (!response.ok) {
    throw new Error("Catalog unavailable");
  }
  return response.json();
}

export async function fetchProducts(
  first = 20,
  query?: string,
  sortKey?: string,
  reverse?: boolean,
): Promise<CatalogProduct[]> {
  const { products } = await fetchCatalog({
    limit: first,
    query,
    sort: sortKey === "CREATED_AT" && reverse ? "created" : undefined,
  });
  return products;
}

export async function fetchCollectionProducts(collection: string, first = 20): Promise<CatalogProduct[]> {
  const { products } = await fetchCatalog({
    collection,
    limit: first,
    sort: collection === "new-arrivals" ? "created" : undefined,
  });
  return products;
}

export async function fetchProductByHandle(handle: string): Promise<CatalogProduct | null> {
  const response = await callFunction(`products/${encodeURIComponent(handle)}`);
  if (response.status === 404) return null;
  if (response.status === 410) {
    const gone = new Error("This piece is no longer offered");
    gone.name = "ProductGone";
    throw gone;
  }
  if (!response.ok) throw new Error("Product unavailable");
  const body = await response.json();
  return body.product as CatalogProduct;
}
