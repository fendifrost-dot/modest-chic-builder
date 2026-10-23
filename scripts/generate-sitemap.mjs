#!/usr/bin/env node
/**
 * Static routes match the live bemoremodest.com sitemap (lastmod 2026-08-31).
 * Product URLs are added only when Printify credentials are present.
 * Preview products are never written into the sitemap.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv } from "../server/env.mjs";
import { listProducts } from "../server/catalog.mjs";

loadLocalEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "https://bemoremodest.com";
const STATIC_LASTMOD = "2026-08-31";

const staticPaths = [
  "/",
  "/mens",
  "/womens",
  "/accessories",
  "/new-arrivals",
  "/sale",
  "/about",
  "/contact",
  "/shipping",
  "/returns",
  "/size-guide",
  "/faq",
  "/privacy",
  "/terms",
  "/careers",
  "/press",
  "/sustainability",
];

const addedPaths = [{ path: "/whats-to-come", lastmod: "2026-10-23" }];

function urlEntry(loc, lastmod) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod.split("T")[0]}</lastmod>` : "";
  return `  <url>\n    <loc>${SITE}${loc}</loc>${lastmodTag}\n  </url>`;
}

const catalog = await listProducts();
const productEntries = catalog.mode === "printify"
  ? catalog.products.map((product) => ({
      path: `/product/${product.handle}`,
      lastmod: product.updatedAt || STATIC_LASTMOD,
    }))
  : [];

if (catalog.mode !== "printify") {
  console.log("[sitemap] Printify credentials absent — static routes only, matching the live sitemap.");
}

const urls = [
  ...staticPaths.map((path) => urlEntry(path, STATIC_LASTMOD)),
  ...addedPaths.map((entry) => urlEntry(entry.path, entry.lastmod)),
  ...productEntries.map((product) => urlEntry(product.path, product.lastmod)),
].join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const outPath = resolve(__dirname, "../public/sitemap.xml");
writeFileSync(outPath, xml);
console.log(`[sitemap] Wrote ${staticPaths.length + addedPaths.length + productEntries.length} URLs to public/sitemap.xml`);
