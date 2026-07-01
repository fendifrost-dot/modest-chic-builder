#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from static routes + Shopify product handles.
 * Runs at Lovable/GitHub build time (npm prebuild). Does not import shopify.ts.
 *
 * Token resolution (first match wins):
 *   1. SHOPIFY_STOREFRONT_ACCESS_TOKEN — Lovable Shopify integration secret
 *   2. VITE_SHOPIFY_STOREFRONT_TOKEN   — Vite client env name / local dev
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://bemoremodest.com';

const staticPaths = [
  '/',
  '/mens',
  '/womens',
  '/accessories',
  '/new-arrivals',
  '/sale',
  '/about',
  '/contact',
  '/shipping',
  '/returns',
  '/size-guide',
  '/faq',
  '/privacy',
  '/terms',
];

const STORE_DOMAIN =
  process.env.VITE_SHOPIFY_STORE_DOMAIN || 'modest-streetwear-apparel.myshopify.com';

const TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

async function fetchProductHandles() {
  if (!TOKEN) {
    console.warn(
      '[sitemap] No Shopify Storefront token — product URLs omitted. ' +
        'Set SHOPIFY_STOREFRONT_ACCESS_TOKEN in Lovable Project Settings.'
    );
    return [];
  }

  const query = `
    query SitemapProducts($first: Int!) {
      products(first: $first) {
        edges { node { handle updatedAt } }
      }
    }
  `;

  try {
    const res = await fetch(`https://${STORE_DOMAIN}/api/2025-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body: JSON.stringify({ query, variables: { first: 250 } }),
    });
    const json = await res.json();
    return (json?.data?.products?.edges || []).map((edge) => ({
      path: `/product/${edge.node.handle}`,
      lastmod: edge.node.updatedAt,
    }));
  } catch (err) {
    console.warn('[sitemap] Failed to fetch products:', err.message);
    return [];
  }
}

function urlEntry(loc, lastmod) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod.split('T')[0]}</lastmod>` : '';
  return `  <url>\n    <loc>${SITE}${loc}</loc>${lastmodTag}\n  </url>`;
}

const productEntries = await fetchProductHandles();
const today = new Date().toISOString().split('T')[0];

const urls = [
  ...staticPaths.map((path) => urlEntry(path, today)),
  ...productEntries.map((p) => urlEntry(p.path, p.lastmod)),
].join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const outPath = resolve(__dirname, '../public/sitemap.xml');
writeFileSync(outPath, xml);
console.log(`[sitemap] Wrote ${staticPaths.length + productEntries.length} URLs to public/sitemap.xml`);
