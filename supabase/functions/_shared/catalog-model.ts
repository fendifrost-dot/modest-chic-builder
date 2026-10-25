/**
 * Pure catalog rules, ported from server/catalog-model.mjs. Printify is the only
 * product source. Behaviour is unchanged; only env access differs.
 *
 * Legacy jacket SKUs are not migrated: jacket / bomber / varsity products are
 * dropped unless explicitly tagged `include-jacket` for a future drop.
 */

import { env } from "./env.ts";

const JACKET_RE = /\b(jacket|bomber|varsity)\b/i;

/** Shop that holds the live catalog. 8464467 is a second shop and it is empty. */
export const PRINTIFY_CATALOG_SHOP_ID = "8464572";
export const PRINTIFY_EMPTY_SHOP_ID = "8464467";

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
  image: { url: string; alt: string | null } | null;
  printifyVariantId: number;
}

export interface CatalogProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  images: Array<{ url: string; alt: string | null; variantIds: string[] }>;
  options: Array<{ name: string; values: string[] }>;
  variants: CatalogVariant[];
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  createdAt: string | null;
  updatedAt: string | null;
  printifyProductId: string;
  blueprintId: number | null;
}

export interface CatalogQuery {
  collection?: string;
  query?: string;
  sort?: string;
  limit?: string | number;
}

export function resolvePrintifyShopId(raw: string | undefined = env("PRINTIFY_SHOP_ID")): string {
  const shopId = String(raw || "").trim() || PRINTIFY_CATALOG_SHOP_ID;
  if (shopId === PRINTIFY_EMPTY_SHOP_ID) {
    throw new Error("PRINTIFY_SHOP_ID 8464467 is the empty shop. The catalog shop is 8464572.");
  }
  return shopId;
}

/** Printify `visible: false` is hidden and must never be sold or listed. */
export function isPrintifyVisible(raw: { visible?: unknown } | null | undefined): boolean {
  return raw?.visible === true;
}

export const FUTURE_DROPSHIP = [
  { id: "polos", status: "planned" },
  { id: "button-ups", status: "planned" },
  { id: "hats", status: "planned" },
  { id: "jackets", status: "planned", note: "Legacy jacket SKUs are not migrated." },
];

export function skipSkuSet(raw: string = env("PRINTIFY_SKIP_SKUS") || ""): Set<string> {
  return new Set(
    String(raw)
      .split(",")
      .map((sku) => sku.trim())
      .filter(Boolean),
  );
}

export function isLegacyJacket(product: { title?: string; tags?: unknown[] }): boolean {
  const tags = (product.tags || []).map((tag) => String(tag).toLowerCase());
  if (tags.includes("include-jacket") || tags.includes("release-jacket")) return false;
  if (tags.includes("legacy-jacket")) return true;
  if (JACKET_RE.test(product.title || "")) return true;
  return tags.some((tag) => JACKET_RE.test(tag));
}

export function slugify(title: string | undefined, id: string | number): string {
  const base = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `piece-${id}`;
}

export function stripHtml(value: string | undefined): string {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function optionName(name: string | undefined): string {
  const key = String(name || "").trim().toLowerCase();
  if (key.startsWith("color") || key.startsWith("colour")) return "Color";
  if (key.startsWith("size")) return "Size";
  return String(name || "Option");
}

function dollars(cents: unknown): string {
  const amount = Number(cents);
  if (!Number.isFinite(amount)) return "0.00";
  return (amount / 100).toFixed(2);
}

// deno-lint-ignore no-explicit-any
export function normalizePrintifyProduct(raw: any, skipSkus: Set<string> = skipSkuSet()): CatalogProduct | null {
  if (!isPrintifyVisible(raw)) return null;
  if (isLegacyJacket({ title: raw.title, tags: raw.tags })) return null;

  const optionById = new Map<unknown, CatalogOption>();
  for (const option of raw.options || []) {
    for (const value of option.values || []) {
      const id = value?.id ?? value;
      const title = value?.title || value?.name || String(value);
      optionById.set(id, { name: optionName(option.name), value: title });
    }
  }

  const images = (raw.images || [])
    // deno-lint-ignore no-explicit-any
    .filter((image: any) => image?.src)
    // deno-lint-ignore no-explicit-any
    .map((image: any) => ({
      url: image.src as string,
      alt: (raw.title || null) as string | null,
      variantIds: (image.variant_ids || []).map(String) as string[],
      isDefault: Boolean(image.is_default),
    }));

  const variants: CatalogVariant[] = [];
  for (const variant of raw.variants || []) {
    if (variant.is_enabled === false) continue;
    const sku = variant.sku ? String(variant.sku) : null;
    if (sku && skipSkus.has(sku)) continue;
    const selectedOptions = (variant.options || [])
      .map((id: unknown) => optionById.get(id))
      .filter(Boolean) as CatalogOption[];
    const variantImages = images.filter((image: { variantIds: string[] }) =>
      image.variantIds.includes(String(variant.id))
    );
    const image = variantImages[0] ||
      images.find((item: { isDefault: boolean }) => item.isDefault) ||
      images[0];
    variants.push({
      id: `${raw.id}:${variant.id}`,
      title: variant.title || selectedOptions.map((option) => option.value).join(" / ") || "Default",
      sku,
      price: { amount: dollars(variant.price), currencyCode: "USD" },
      unitAmount: Number(variant.price) || 0,
      availableForSale: variant.is_available !== false,
      selectedOptions,
      image: image ? { url: image.url, alt: image.alt } : null,
      printifyVariantId: Number(variant.id),
    });
  }

  if (variants.length === 0) return null;

  const optionGroups: Array<{ name: string; values: string[] }> = [];
  const seen = new Map<string, Set<string>>();
  for (const variant of variants) {
    for (const selected of variant.selectedOptions) {
      if (!seen.has(selected.name)) {
        seen.set(selected.name, new Set());
        optionGroups.push({ name: selected.name, values: [] });
      }
      const bucket = seen.get(selected.name)!;
      if (!bucket.has(selected.value)) {
        bucket.add(selected.value);
        optionGroups.find((group) => group.name === selected.name)!.values.push(selected.value);
      }
    }
  }

  const prices = variants.map((variant) => Number(variant.price.amount));
  const min = Math.min(...prices);

  return {
    id: String(raw.id),
    handle: slugify(raw.title, raw.id),
    title: raw.title || "Untitled",
    description: stripHtml(raw.description),
    tags: (raw.tags || []).map(String),
    images: images.map(({ url, alt, variantIds }: { url: string; alt: string | null; variantIds: string[] }) => ({
      url,
      alt,
      variantIds,
    })),
    options: optionGroups,
    variants,
    priceRange: { minVariantPrice: { amount: min.toFixed(2), currencyCode: "USD" } },
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
    printifyProductId: String(raw.id),
    blueprintId: raw.blueprint_id ?? null,
  };
}

export function dedupeHandles(products: CatalogProduct[]): CatalogProduct[] {
  const used = new Map<string, number>();
  return products.map((product) => {
    const count = used.get(product.handle) || 0;
    used.set(product.handle, count + 1);
    if (count === 0) return product;
    return { ...product, handle: `${product.handle}-${product.id}`.slice(0, 96) };
  });
}

function tagsOf(product: { tags?: string[] }): string[] {
  return (product.tags || []).map((tag) => tag.toLowerCase());
}

function hasTag(product: { tags?: string[] }, names: string[]): boolean {
  const tags = tagsOf(product);
  return names.some((name) => tags.includes(name));
}

export function matchesCollection(product: CatalogProduct, collection?: string): boolean {
  if (!collection || collection === "all") return true;
  if (collection === "featured") return hasTag(product, ["featured", "heart-chakra", "heart chakra"]);
  if (collection === "mens") {
    if (hasTag(product, ["mens", "men", "unisex"])) return true;
    if (hasTag(product, ["womens", "women", "accessories", "accessory"])) return false;
    return true;
  }
  if (collection === "womens") return hasTag(product, ["womens", "women"]);
  if (collection === "accessories") return hasTag(product, ["accessories", "accessory"]);
  if (collection === "sale") return hasTag(product, ["sale"]);
  if (collection === "new-arrivals") return true;
  return true;
}

export function matchesQuery(product: CatalogProduct, query?: string): boolean {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return true;
  if (term.startsWith("tag:")) return tagsOf(product).includes(term.slice(4).trim());
  const haystack = [product.title, product.description, product.handle, ...(product.tags || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function filterCatalog(
  products: CatalogProduct[],
  { collection, query, sort, limit }: CatalogQuery = {},
): CatalogProduct[] {
  let next = products.filter(
    (product) => matchesCollection(product, collection) && matchesQuery(product, query),
  );
  if (sort === "created") {
    next = [...next].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }
  const cap = Number(limit);
  if (Number.isFinite(cap) && cap > 0) next = next.slice(0, cap);
  return next;
}

const MENS = "/images/collection-mens-900.webp";
const WOMENS = "/images/collection-womens-800.webp";
const HERO = "/images/hero-1600.webp";

/**
 * Shown only when the Printify token is absent. Titles match the six visible
 * products in shop 8464572. Prices are placeholders.
 */
export function previewProducts(): CatalogProduct[] {
  const note =
    "Preview listing for a visible Printify product. This price is a placeholder until the catalog token is set. Hidden products are not shown.";
  const pieces: Array<[string, string, string[], string]> = [
    ["preview-care-bear", "MOD#$T Care Bear", ["mens"], MENS],
    ["preview-heart-chakra-album-tee", "Heart Chakra Album Tee", ["featured", "heart-chakra", "mens"], MENS],
    ["preview-womens-chakra-crop", "Women's Chakra Bear Crop Tee", ["featured", "heart-chakra", "womens"], WOMENS],
    ["preview-heart-chakra-bear-tee", "Heart Chakra Bear T-Shirt", ["featured", "heart-chakra", "mens"], MENS],
    ["preview-heavy-blend-hoodie", "Unisex Heavy Blend Hooded Sweatshirt", ["unisex", "mens"], HERO],
    ["preview-classic-logo-sweatshirt", "MOD#$T Bear Classic Logo Sweatshirt", ["mens"], HERO],
  ];
  return pieces.map(([id, title, tags, url]) => {
    const image = { url, alt: `${title} preview` };
    return {
      id,
      handle: slugify(title, id),
      title,
      description: note,
      tags,
      images: [{ url, alt: image.alt, variantIds: [] }],
      options: [],
      variants: [
        {
          id: `${id}:1`,
          title: "Default",
          sku: null,
          price: { amount: "48.00", currencyCode: "USD" },
          unitAmount: 4800,
          availableForSale: true,
          selectedOptions: [],
          image,
          printifyVariantId: 1,
        },
      ],
      priceRange: { minVariantPrice: { amount: "48.00", currencyCode: "USD" } },
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
      printifyProductId: id,
      blueprintId: null,
    };
  });
}

export const LEGACY_JACKET_HANDLES = [
  "ketchup-mustard-varsity-jacket",
  "flamingo-fly-varsity-jacket",
  "bzo-bomber-jacket",
  "womens-bzo-bomber-jacket",
];
