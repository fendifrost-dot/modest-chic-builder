#!/usr/bin/env node
/**
 * Static routes match the live bemoremodest.com sitemap (lastmod 2026-08-31).
 * Product URLs are added only when the public catalog edge function is in
 * printify mode. Preview products are never written into the sitemap.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = "https://bemoremodest.com";
const STATIC_LASTMOD = "2026-08-31";

function envValue(name) {
  if (process.env[name]) return process.env[name];
  const path = resolve(__dirname, "../.env");
  if (!existsSync(path)) return "";
  const line = readFileSync(path, "utf8")
    .split("\n")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!line) return "";
  return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
}

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

async function printifyProducts() {
  const base = envValue("VITE_SUPABASE_URL").replace(/\/$/, "");
  if (!base) {
    console.log("[sitemap] VITE_SUPABASE_URL absent — static routes only.");
    return [];
  }
  const headers = { Accept: "application/json" };
  const key = envValue("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (key) {
    headers.apikey = key;
    headers.Authorization = `Bearer ${key}`;
  }
  try {
    const response = await fetch(`${base}/functions/v1/catalog`, { headers });
    if (!response.ok) {
      console.log(`[sitemap] Catalog function returned ${response.status} — static routes only.`);
      return [];
    }
    const body = await response.json();
    if (body.mode !== "printify" || !Array.isArray(body.products)) {
      console.log("[sitemap] Catalog is not in printify mode — static routes only.");
      return [];
    }
    return body.products.map((product) => ({
      path: `/product/${product.handle}`,
      lastmod: product.updatedAt || STATIC_LASTMOD,
    }));
  } catch (error) {
    console.log(`[sitemap] Catalog function unreachable — static routes only. ${error instanceof Error ? error.message : ""}`);
    return [];
  }
}

const productEntries = await printifyProducts();
const urls = [
  ...staticPaths.map((path) => urlEntry(path, STATIC_LASTMOD)),
  ...addedPaths.map((entry) => urlEntry(entry.path, entry.lastmod)),
  ...productEntries.map((product) => urlEntry(product.path, product.lastmod)),
].join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const outPath = resolve(__dirname, "../public/sitemap.xml");
writeFileSync(outPath, xml);
console.log(`[sitemap] Wrote ${staticPaths.length + addedPaths.length + productEntries.length} URLs to public/sitemap.xml`);
