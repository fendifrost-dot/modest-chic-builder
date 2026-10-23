/**
 * Pure catalog rules. Printify is the only product source.
 * Legacy jacket SKUs are not migrated: jacket / bomber / varsity products
 * are dropped unless explicitly tagged `include-jacket` for a future drop.
 * Polos, button-ups, hats, and jackets are roadmap categories — not built here.
 */

const JACKET_RE = /\b(jacket|bomber|varsity)\b/i;

export const FUTURE_DROPSHIP = [
  { id: "polos", status: "planned" },
  { id: "button-ups", status: "planned" },
  { id: "hats", status: "planned" },
  { id: "jackets", status: "planned", note: "Legacy jacket SKUs are not migrated." },
];

export function skipSkuSet(raw = process.env.PRINTIFY_SKIP_SKUS || "") {
  return new Set(
    String(raw)
      .split(",")
      .map((sku) => sku.trim())
      .filter(Boolean),
  );
}

export function isLegacyJacket(product) {
  const tags = (product.tags || []).map((tag) => String(tag).toLowerCase());
  if (tags.includes("include-jacket") || tags.includes("release-jacket")) return false;
  if (tags.includes("legacy-jacket")) return true;
  if (JACKET_RE.test(product.title || "")) return true;
  return tags.some((tag) => JACKET_RE.test(tag));
}

export function slugify(title, id) {
  const base = String(title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `piece-${id}`;
}

export function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function optionName(name) {
  const key = String(name || "").trim().toLowerCase();
  if (key.startsWith("color") || key.startsWith("colour")) return "Color";
  if (key.startsWith("size")) return "Size";
  return String(name || "Option");
}

function dollars(cents) {
  const amount = Number(cents);
  if (!Number.isFinite(amount)) return "0.00";
  return (amount / 100).toFixed(2);
}

export function normalizePrintifyProduct(raw, skipSkus = skipSkuSet()) {
  if (!raw || raw.visible === false) return null;
  if (isLegacyJacket({ title: raw.title, tags: raw.tags })) return null;

  const optionById = new Map();
  for (const option of raw.options || []) {
    for (const value of option.values || []) {
      const id = value?.id ?? value;
      const title = value?.title || value?.name || String(value);
      optionById.set(id, { name: optionName(option.name), value: title });
    }
  }

  const images = (raw.images || [])
    .filter((image) => image?.src)
    .map((image) => ({
      url: image.src,
      alt: raw.title || null,
      variantIds: (image.variant_ids || []).map(String),
      isDefault: Boolean(image.is_default),
    }));

  const variants = [];
  for (const variant of raw.variants || []) {
    if (variant.is_enabled === false) continue;
    const sku = variant.sku ? String(variant.sku) : null;
    if (sku && skipSkus.has(sku)) continue;
    const selectedOptions = (variant.options || [])
      .map((id) => optionById.get(id))
      .filter(Boolean);
    const variantImages = images.filter((image) => image.variantIds.includes(String(variant.id)));
    const image = variantImages[0] || images.find((item) => item.isDefault) || images[0];
    variants.push({
      id: `${raw.id}:${variant.id}`,
      title: variant.title || selectedOptions.map((option) => option.value).join(" / ") || "Default",
      sku,
      price: {
        amount: dollars(variant.price),
        currencyCode: "USD",
      },
      unitAmount: Number(variant.price) || 0,
      availableForSale: variant.is_available !== false,
      selectedOptions,
      image: image ? { url: image.url, alt: image.alt } : null,
      printifyVariantId: Number(variant.id),
    });
  }

  if (variants.length === 0) return null;

  const optionGroups = [];
  const seen = new Map();
  for (const variant of variants) {
    for (const selected of variant.selectedOptions) {
      if (!seen.has(selected.name)) {
        seen.set(selected.name, new Set());
        optionGroups.push({ name: selected.name, values: [] });
      }
      const bucket = seen.get(selected.name);
      if (!bucket.has(selected.value)) {
        bucket.add(selected.value);
        optionGroups.find((group) => group.name === selected.name).values.push(selected.value);
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
    images: images.map(({ url, alt, variantIds }) => ({ url, alt, variantIds })),
    options: optionGroups,
    variants,
    priceRange: {
      minVariantPrice: {
        amount: min.toFixed(2),
        currencyCode: "USD",
      },
    },
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
    printifyProductId: String(raw.id),
    blueprintId: raw.blueprint_id ?? null,
  };
}

export function dedupeHandles(products) {
  const used = new Map();
  return products.map((product) => {
    const count = used.get(product.handle) || 0;
    used.set(product.handle, count + 1);
    if (count === 0) return product;
    return { ...product, handle: `${product.handle}-${product.id}`.slice(0, 96) };
  });
}

function tagsOf(product) {
  return (product.tags || []).map((tag) => tag.toLowerCase());
}

function hasTag(product, names) {
  const tags = tagsOf(product);
  return names.some((name) => tags.includes(name));
}

export function matchesCollection(product, collection) {
  if (!collection || collection === "all") return true;
  if (collection === "featured") {
    return hasTag(product, ["featured", "heart-chakra", "heart chakra"]);
  }
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

export function matchesQuery(product, query) {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return true;
  if (term.startsWith("tag:")) {
    return tagsOf(product).includes(term.slice(4).trim());
  }
  const haystack = [product.title, product.description, product.handle, ...(product.tags || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function filterCatalog(products, { collection, query, sort, limit } = {}) {
  let next = products.filter((product) => matchesCollection(product, collection) && matchesQuery(product, query));
  if (sort === "created") {
    next = [...next].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }
  const cap = Number(limit);
  if (Number.isFinite(cap) && cap > 0) next = next.slice(0, cap);
  return next;
}

function previewVariant(productId, id, title, cents, options, image) {
  return {
    id: `${productId}:${id}`,
    title,
    sku: null,
    price: { amount: (cents / 100).toFixed(2), currencyCode: "USD" },
    unitAmount: cents,
    availableForSale: true,
    selectedOptions: options,
    image,
    printifyVariantId: id,
  };
}

const MENS = "/images/collection-mens-900.webp";
const WOMENS = "/images/collection-womens-800.webp";
const ACCESSORY = "/images/collection-accessories-800.webp";
const HERO = "/images/hero-1600.webp";

/**
 * Shown only when Printify credentials are absent.
 * Prices are placeholders. These are not a SKU migration.
 */
export function previewProducts() {
  const teeOptions = [
    { name: "Color", values: ["Berry", "Ivory"] },
    { name: "Size", values: ["S", "M", "L", "XL"] },
  ];
  const heart = {
    id: "preview-heart-chakra-tee",
    handle: "heart-chakra-bear-tee",
    title: "Heart Chakra Bear Tee",
    description:
      "Preview piece. Relaxed tee with the Heart Chakra bear graphic. Live price, photos, and sizes load from Printify.",
    tags: ["featured", "heart-chakra", "mens", "tee"],
    images: [{ url: MENS, alt: "Heart Chakra Bear Tee preview", variantIds: [] }],
    options: teeOptions,
    variants: [
      previewVariant("preview-heart-chakra-tee", 101, "Berry / M", 4800, [
        { name: "Color", value: "Berry" },
        { name: "Size", value: "M" },
      ], { url: MENS, alt: "Berry" }),
      previewVariant("preview-heart-chakra-tee", 102, "Ivory / L", 4800, [
        { name: "Color", value: "Ivory" },
        { name: "Size", value: "L" },
      ], { url: HERO, alt: "Ivory" }),
    ],
    priceRange: { minVariantPrice: { amount: "48.00", currencyCode: "USD" } },
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
    printifyProductId: "preview-heart-chakra-tee",
    blueprintId: null,
  };

  return [
    heart,
    {
      id: "preview-cashmere-bear",
      handle: "big-bear-cashmere-sweater",
      title: "Big Bear Cashmere Sweater",
      description: "Preview knit. Cashmere-weight sweater from the Chicago edit. Not a live Printify price.",
      tags: ["featured", "mens", "knit"],
      images: [{ url: HERO, alt: "Big Bear Cashmere Sweater preview", variantIds: [] }],
      options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map((size, index) =>
        previewVariant(
          "preview-cashmere-bear",
          200 + index,
          size,
          22000,
          [{ name: "Size", value: size }],
          { url: HERO, alt: size },
        ),
      ),
      priceRange: { minVariantPrice: { amount: "220.00", currencyCode: "USD" } },
      createdAt: "2026-07-15T00:00:00.000Z",
      updatedAt: "2026-07-15T00:00:00.000Z",
      printifyProductId: "preview-cashmere-bear",
      blueprintId: null,
    },
    {
      id: "preview-crop-tee",
      handle: "chakra-bear-crop-tee",
      title: "Chakra Bear Crop Tee",
      description: "Preview women's tee. Cropped Heart Chakra graphic. Connect Printify for the live assortment.",
      tags: ["womens", "featured", "tee"],
      images: [{ url: WOMENS, alt: "Chakra Bear Crop Tee preview", variantIds: [] }],
      options: [{ name: "Size", values: ["XS", "S", "M", "L"] }],
      variants: ["XS", "S", "M", "L"].map((size, index) =>
        previewVariant(
          "preview-crop-tee",
          300 + index,
          size,
          4200,
          [{ name: "Size", value: size }],
          { url: WOMENS, alt: size },
        ),
      ),
      priceRange: { minVariantPrice: { amount: "42.00", currencyCode: "USD" } },
      createdAt: "2026-07-18T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
      printifyProductId: "preview-crop-tee",
      blueprintId: null,
    },
    {
      id: "preview-smoke-bear",
      handle: "smoke-bear-tee",
      title: "Smoke Bear Tee",
      description: "Preview tee. Understated chest graphic, relaxed streetwear fit.",
      tags: ["mens", "tee"],
      images: [{ url: MENS, alt: "Smoke Bear Tee preview", variantIds: [] }],
      options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map((size, index) =>
        previewVariant(
          "preview-smoke-bear",
          400 + index,
          size,
          4800,
          [{ name: "Size", value: size }],
          { url: MENS, alt: size },
        ),
      ),
      priceRange: { minVariantPrice: { amount: "48.00", currencyCode: "USD" } },
      createdAt: "2026-07-17T00:00:00.000Z",
      updatedAt: "2026-07-17T00:00:00.000Z",
      printifyProductId: "preview-smoke-bear",
      blueprintId: null,
    },
    {
      id: "preview-logo-sweatshirt",
      handle: "bear-classic-logo-sweatshirt",
      title: "Bear Classic Logo Sweatshirt",
      description: "Preview sweatshirt. Heavy fleece, quiet logo, Chicago fit.",
      tags: ["mens", "fleece"],
      images: [{ url: HERO, alt: "Bear Classic Logo Sweatshirt preview", variantIds: [] }],
      options: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map((size, index) =>
        previewVariant(
          "preview-logo-sweatshirt",
          500 + index,
          size,
          8800,
          [{ name: "Size", value: size }],
          { url: HERO, alt: size },
        ),
      ),
      priceRange: { minVariantPrice: { amount: "88.00", currencyCode: "USD" } },
      createdAt: "2026-07-16T00:00:00.000Z",
      updatedAt: "2026-07-16T00:00:00.000Z",
      printifyProductId: "preview-logo-sweatshirt",
      blueprintId: null,
    },
    {
      id: "preview-bear-mask",
      handle: "big-head-bear-mask",
      title: "Big Head Bear Mask",
      description: "Preview accessory. One size. Live stock comes from Printify.",
      tags: ["accessories", "accessory"],
      images: [{ url: ACCESSORY, alt: "Big Head Bear Mask preview", variantIds: [] }],
      options: [],
      variants: [
        previewVariant("preview-bear-mask", 601, "Default", 3600, [], { url: ACCESSORY, alt: "Mask" }),
      ],
      priceRange: { minVariantPrice: { amount: "36.00", currencyCode: "USD" } },
      createdAt: "2026-07-08T00:00:00.000Z",
      updatedAt: "2026-07-08T00:00:00.000Z",
      printifyProductId: "preview-bear-mask",
      blueprintId: null,
    },
  ];
}

export const LEGACY_JACKET_HANDLES = [
  "ketchup-mustard-varsity-jacket",
  "flamingo-fly-varsity-jacket",
  "bzo-bomber-jacket",
  "womens-bzo-bomber-jacket",
];

export function isLegacyJacketPath(pathname) {
  const match = String(pathname || "").match(/^\/product\/([^/]+)\/?$/);
  if (!match) return false;
  return LEGACY_JACKET_HANDLES.includes(decodeURIComponent(match[1]));
}
