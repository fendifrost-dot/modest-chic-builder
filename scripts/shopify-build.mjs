/**
 * Build-time Shopify Storefront reads, shared by the prerenderer and the sitemap
 * generator. Mirrors the queries the client makes in src/lib/shopify.ts so that
 * prerendered HTML and browser-rendered DOM describe the same products.
 *
 * Token resolution (first match wins):
 *   1. SHOPIFY_STOREFRONT_ACCESS_TOKEN — Lovable Shopify integration secret
 *   2. VITE_SHOPIFY_STOREFRONT_TOKEN   — Vite client env name / local dev
 *   3. the public Storefront token the client already ships
 */

export const STORE_DOMAIN =
  process.env.VITE_SHOPIFY_STORE_DOMAIN || 'modest-streetwear-apparel.myshopify.com';

const TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
  'a2c0b8ea61ed91424a63a92e2135e275';

const API_VERSION = '2025-07';

export async function storefront(query, variables = {}) {
  const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Shopify: ${json.errors.map((e) => e.message).join(', ')}`);
  return json.data;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  productType
  tags
  updatedAt
  seo { title description }
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 10) { edges { node { url altText } } }
  variants(first: 100) {
    edges {
      node {
        id
        title
        sku
        availableForSale
        price { amount currencyCode }
        image { url }
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

/** Every product in the catalogue, with the detail a product page needs. */
export async function fetchAllProducts(first = 250) {
  const data = await storefront(
    `query AllProducts($first: Int!) { products(first: $first) { edges { node { ${PRODUCT_FIELDS} } } } }`,
    { first },
  );
  return (data?.products?.edges || []).map((e) => e.node);
}

/** Products in a Shopify collection, in collection order. */
export async function fetchCollection(handle, first = 50) {
  const data = await storefront(
    `query Coll($handle: String!, $first: Int!) {
       collectionByHandle(handle: $handle) { products(first: $first) { edges { node { ${PRODUCT_FIELDS} } } } }
     }`,
    { handle, first },
  );
  return (data?.collectionByHandle?.products?.edges || []).map((e) => e.node);
}

/** Products by search query / sort — mirrors fetchProducts() in the client. */
export async function fetchProductQuery({ first = 50, query = null, sortKey = null, reverse = null }) {
  const data = await storefront(
    `query Q($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
       products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
         edges { node { ${PRODUCT_FIELDS} } }
       }
     }`,
    { first, query, sortKey, reverse },
  );
  return (data?.products?.edges || []).map((e) => e.node);
}

/** Flatten a product node into the shape the schema builders expect. */
export function normalizeProduct(node) {
  const variants = (node.variants?.edges || []).map((e) => e.node);
  const images = (node.images?.edges || []).map((e) => e.node);
  const first = variants.find((v) => v.availableForSale) || variants[0];
  return {
    handle: node.handle,
    title: node.title,
    description: node.description || '',
    productType: node.productType || '',
    tags: node.tags || [],
    updatedAt: node.updatedAt,
    seoTitle: node.seo?.title || null,
    seoDescription: node.seo?.description || null,
    price: first?.price?.amount || node.priceRange?.minVariantPrice?.amount,
    currency: first?.price?.currencyCode || node.priceRange?.minVariantPrice?.currencyCode,
    availability: variants.some((v) => v.availableForSale),
    sku: first?.sku || undefined,
    images: images.map((i) => i.url),
    imageAlt: images[0]?.altText || null,
    options: node.options || [],
    variants: variants.map((v) => ({
      name: `${node.title} — ${v.title}`,
      sku: v.sku || undefined,
      price: v.price.amount,
      currency: v.price.currencyCode,
      availability: v.availableForSale,
      color: v.selectedOptions.find((o) => /colou?r/i.test(o.name))?.value,
      size: v.selectedOptions.find((o) => /^size$/i.test(o.name))?.value,
      image: v.image?.url,
    })),
  };
}
