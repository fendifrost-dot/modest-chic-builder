#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the shared route manifest plus live Shopify
 * product handles. Runs at build time (npm prebuild).
 *
 * Routes come from src/seo/routes.js — the same manifest the app and the
 * prerenderer read — so the sitemap can never drift from what is actually served.
 * Product URLs use the authoritative singular `/product/<handle>` namespace.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { absoluteUrl } from '../src/seo/brand.js';
import { STATIC_PATHS, productPath } from '../src/seo/routes.js';
import { fetchAllProducts } from './shopify-build.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Rough crawl-priority hints. Absent entries fall back to the default. */
const PRIORITY = {
  '/': '1.0',
  '/mens': '0.9',
  '/womens': '0.9',
  '/accessories': '0.8',
  '/new-arrivals': '0.8',
  '/about': '0.7',
};

function urlEntry(loc, lastmod, priority) {
  const parts = [`    <loc>${absoluteUrl(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod.split('T')[0]}</lastmod>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

let products = [];
try {
  products = await fetchAllProducts();
} catch (err) {
  console.warn(`[sitemap] Shopify read failed (${err.message}) — product URLs omitted.`);
}

const today = new Date().toISOString().split('T')[0];

const urls = [
  ...STATIC_PATHS.map((path) => urlEntry(path, today, PRIORITY[path] || '0.6')),
  ...products.map((p) => urlEntry(productPath(p.handle), p.updatedAt, '0.8')),
].join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(resolve(__dirname, '../public/sitemap.xml'), xml);
console.log(
  `[sitemap] Wrote ${STATIC_PATHS.length + products.length} URLs ` +
    `(${STATIC_PATHS.length} static + ${products.length} product) to public/sitemap.xml`,
);
