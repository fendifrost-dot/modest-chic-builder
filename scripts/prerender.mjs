#!/usr/bin/env node
/**
 * Build-time prerenderer.
 *
 * The site is a Vite SPA: before this ran, every URL returned the same empty
 * index.html shell with the homepage's canonical, title and metadata, and no
 * structured data at all. Retrievers that do not execute JavaScript therefore saw
 * one page, repeated, for the entire site.
 *
 * This script runs after `vite build` and writes a real HTML file per indexable
 * route into dist/, each carrying:
 *   - a self-referencing canonical
 *   - a unique title / description / og set
 *   - the route's JSON-LD (entity graph + page-level nodes)
 *   - the route's actual text content and internal links inside #root
 *
 * The content inside #root is the same content the React app renders; React's
 * createRoot() replaces it on mount, so browsers are unaffected. Nothing is shown
 * to crawlers that is hidden from users.
 *
 * Route metadata comes from src/seo/routes.js and product data from Shopify, so
 * this file holds no facts of its own.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BRAND_DISPLAY,
  BRAND_NAME,
  SITE_EMAIL,
  SITE_LOCATION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  pageTitle,
} from '../src/seo/brand.js';
import {
  HOME_ROUTE,
  COLLECTION_ROUTES,
  INFO_ROUTES,
  STATIC_ROUTES,
  productPath,
} from '../src/seo/routes.js';
import {
  siteGraph,
  webPageNode,
  collectionNode,
  productNode,
  faqNode,
  breadcrumbNode,
  materialFromTags,
  serializeJsonLd,
} from '../src/seo/schema.js';
import {
  machineDescription,
  isHeldProduct,
  clampDescription as clamp,
} from '../src/seo/product-meta.js';
import { auditHold } from './hold-audit.mjs';
import {
  fetchAllProducts,
  fetchCollection,
  fetchProductQuery,
  normalizeProduct,
} from './shopify-build.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');

/** Mirrors the product ids the homepage grid requests in src/pages/Index.tsx. */
const HOME_GRID_QUERY =
  'id:8965877104817 OR id:8965878087857 OR id:8965883068593 OR id:8966533677233';

/* ------------------------------------------------------------------ *
 * HTML helpers
 * ------------------------------------------------------------------ */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const money = (amount, currency) =>
  amount === undefined || amount === null
    ? ''
    : `$${Number(amount).toFixed(2)} ${currency || ''}`.trim();

/* ------------------------------------------------------------------ *
 * Template surgery
 * ------------------------------------------------------------------ */

/** Remove every head tag this script is responsible for, so none are duplicated. */
function stripManagedTags(head) {
  return head
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>\s*/gi, '')
    .replace(/<script\s+type="application\/ld\+json"[\s\S]*?<\/script>\s*/gi, '');
}

function headTags({ title, description, path, ogImage, ogType, jsonLd }) {
  const url = absoluteUrl(path);
  const image = ogImage || DEFAULT_OG_IMAGE;
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:type" content="${esc(ogType || 'website')}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:site_name" content="${esc(BRAND_DISPLAY)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:site" content="@bemoremodest" />`,
  ];
  for (const node of jsonLd.filter(Boolean)) {
    // Marked so the app can retire these once React owns the graph — see SeoHead.
    tags.push(
      `<script type="application/ld+json" data-prerendered-ld>${serializeJsonLd(node)}</script>`,
    );
  }
  return tags.map((t) => `    ${t}`).join('\n');
}

/* ------------------------------------------------------------------ *
 * Static body content (replaced by React on mount)
 * ------------------------------------------------------------------ */

const NAV_LINKS = [
  ...Object.values(COLLECTION_ROUTES).map((r) => ({ path: r.path, name: r.heading })),
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/faq', name: 'FAQs' },
  { path: '/size-guide', name: 'Size Guide' },
  { path: '/shipping', name: 'Shipping Info' },
  { path: '/returns', name: 'Returns & Exchanges' },
];

const shellNav = () =>
  `<nav aria-label="Primary"><ul>${NAV_LINKS.map(
    (l) => `<li><a href="${l.path}">${esc(l.name)}</a></li>`,
  ).join('')}</ul></nav>`;

const shellFooter = () =>
  `<footer class="border-t border-border">
      <p><a href="/">${esc(BRAND_DISPLAY)}</a> — ${esc(BRAND_NAME)}</p>
      <p>${esc(SITE_LOCATION)} · <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a></p>
      <p><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a> · <a href="/press">Press</a> · <a href="/careers">Careers</a> · <a href="/sustainability">Sustainability</a></p>
    </footer>`;

/** Wrap route content in the shared shell so every page carries internal links. */
function shell(main) {
  return `<div class="min-h-screen bg-background">
    <header><a href="/" class="font-display">${esc(BRAND_DISPLAY)}</a>${shellNav()}</header>
    <main class="container mx-auto px-6">
${main}
    </main>
${shellFooter()}
  </div>`;
}

function productListHtml(products) {
  if (products.length === 0) return '';
  return `<ul class="grid">${products
    .map(
      (p) => `<li>
        <a href="${productPath(p.handle)}">
          <img src="${esc(p.images[0] || '')}" alt="${esc(p.imageAlt || p.title)}" loading="lazy" width="600" height="800" />
          <h3>${esc(p.title)}</h3>
        </a>
        <p>${esc(money(p.price, p.currency))} — ${p.availability ? 'In stock' : 'Sold out'}</p>
      </li>`,
    )
    .join('')}</ul>`;
}

function sectionsHtml(sections) {
  return sections
    .map(
      (s) =>
        `      ${s.heading ? `<h2 class="font-display">${esc(s.heading)}</h2>\n      ` : ''}<p>${esc(s.body)}</p>`,
    )
    .join('\n');
}

/* ------------------------------------------------------------------ *
 * Page writers
 * ------------------------------------------------------------------ */

const written = [];

function writePage({ path, title, description, ogImage, ogType, jsonLd, main }, template) {
  const [beforeHead, rest] = splitOnce(template, '</head>');
  const head = `${stripManagedTags(beforeHead)}\n${headTags({
    title,
    description,
    path,
    ogImage,
    ogType,
    jsonLd,
  })}\n  `;
  const body = rest.replace(
    '<div id="root"></div>',
    `<div id="root">${shell(main)}</div>`,
  );
  if (!body.includes('id="root"')) {
    throw new Error('prerender: could not find the #root mount point in dist/index.html');
  }

  const html = `${head}</head>${body}`;
  const outDir = path === '/' ? DIST : join(DIST, path.replace(/^\//, ''));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);

  // Extensionless-lookup hosts resolve /about from /about.html; emitting both
  // keeps the route addressable regardless of which convention the host uses.
  if (path !== '/') {
    const flat = join(DIST, `${path.replace(/^\//, '')}.html`);
    mkdirSync(dirname(flat), { recursive: true });
    writeFileSync(flat, html);
  }

  written.push({ path, title, description, canonical: absoluteUrl(path), bytes: html.length });
}

function splitOnce(str, marker) {
  const i = str.indexOf(marker);
  if (i === -1) throw new Error(`prerender: template is missing ${marker}`);
  return [str.slice(0, i), str.slice(i + marker.length)];
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

async function main() {
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error('prerender: dist/index.html not found — run vite build first');
  }
  const template = readFileSync(templatePath, 'utf8');

  // ---- Commerce data -------------------------------------------------
  let allProducts = [];
  let collectionProducts = {};
  let homeProducts = [];
  try {
    allProducts = (await fetchAllProducts()).map(normalizeProduct);

    for (const [key, cfg] of Object.entries(COLLECTION_ROUTES)) {
      const nodes = cfg.collectionHandle
        ? await fetchCollection(cfg.collectionHandle, 50)
        : await fetchProductQuery({
            first: 50,
            query: cfg.query || null,
            sortKey: cfg.sortKey || null,
            reverse: cfg.reverse ?? null,
          });
      collectionProducts[key] = nodes.map(normalizeProduct);
    }

    homeProducts = (await fetchProductQuery({ first: 10, query: HOME_GRID_QUERY })).map(
      normalizeProduct,
    );
  } catch (err) {
    console.error(`[prerender] FATAL: Shopify read failed — ${err.message}`);
    console.error('[prerender] Refusing to emit product/collection pages without real data.');
    process.exitCode = 1;
    return;
  }

  // Fails the build if the declared hold list and the live catalogue disagree.
  auditHold(allProducts);

  const entityGraph = siteGraph();

  // ---- Homepage ------------------------------------------------------
  writePage(
    {
      path: '/',
      title: HOME_ROUTE.title,
      description: HOME_ROUTE.description,
      ogType: 'website',
      jsonLd: [
        entityGraph,
        webPageNode({
          path: '/',
          name: HOME_ROUTE.title,
          description: HOME_ROUTE.description,
          type: 'WebPage',
        }),
        breadcrumbNode([{ name: 'Home', path: '/' }]),
      ],
      main: `      <h1 class="font-display">${esc(HOME_ROUTE.heading)}</h1>
      <p>${esc(HOME_ROUTE.intro)}</p>
      <h2 class="font-display">Shop by category</h2>
      <ul>${Object.values(COLLECTION_ROUTES)
        .map((r) => `<li><a href="${r.path}">${esc(r.heading)}</a> — ${esc(r.description)}</li>`)
        .join('')}</ul>
      <h2 class="font-display">Heart Chakra Collection</h2>
${productListHtml(homeProducts)}
      <h2 class="font-display">Contact</h2>
      <p>${esc(BRAND_DISPLAY)} (${esc(BRAND_NAME)}) — <a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a>, ${esc(SITE_LOCATION)}.</p>`,
    },
    template,
  );

  // ---- Collection routes --------------------------------------------
  for (const [key, cfg] of Object.entries(COLLECTION_ROUTES)) {
    const products = collectionProducts[key] || [];
    writePage(
      {
        path: cfg.path,
        title: pageTitle(cfg.title),
        description: cfg.description,
        ogImage: products[0]?.images?.[0],
        ogType: 'website',
        jsonLd: [
          entityGraph,
          collectionNode({
            path: cfg.path,
            name: cfg.heading,
            description: cfg.description,
            items: products.map((p) => ({
              name: p.title,
              url: absoluteUrl(productPath(p.handle)),
              image: p.images[0],
              price: p.price,
              currency: p.currency,
              availability: p.availability,
            })),
          }),
          breadcrumbNode([
            { name: 'Home', path: '/' },
            { name: cfg.heading, path: cfg.path },
          ]),
        ],
        main: `      <h1 class="font-display">${esc(cfg.heading)}</h1>
      <p>${esc(cfg.intro)}</p>
${products.length ? productListHtml(products) : `      <p>${esc(cfg.emptyMessage || 'No products found')}</p>`}`,
      },
      template,
    );
  }

  // ---- Information routes -------------------------------------------
  for (const cfg of Object.values(INFO_ROUTES)) {
    const faqs =
      cfg.schemaType === 'FAQPage'
        ? cfg.sections.filter((s) => s.heading).map((s) => ({ question: s.heading, answer: s.body }))
        : [];
    writePage(
      {
        path: cfg.path,
        title: pageTitle(cfg.title),
        description: cfg.description,
        ogType: 'website',
        jsonLd: [
          entityGraph,
          webPageNode({
            path: cfg.path,
            name: cfg.title,
            description: cfg.description,
            type: cfg.schemaType || 'WebPage',
          }),
          breadcrumbNode([
            { name: 'Home', path: '/' },
            { name: cfg.heading, path: cfg.path },
          ]),
          faqs.length ? faqNode(faqs) : null,
        ],
        main: `      <h1 class="font-display">${esc(cfg.heading)}</h1>
${sectionsHtml(cfg.sections)}`,
      },
      template,
    );
  }

  // ---- Product routes ------------------------------------------------
  const heldProducts = [];
  for (const p of allProducts) {
    const path = productPath(p.handle);
    const derived = machineDescription(p);
    const description = clamp(derived.text);
    const held = isHeldProduct(p.handle);
    if (held) heldProducts.push(p.handle);
    const material = materialFromTags(p.tags);
    writePage(
      {
        path,
        title: pageTitle(p.seoTitle || p.title),
        description,
        ogImage: p.images[0],
        ogType: 'product',
        jsonLd: [
          entityGraph,
          productNode({
            path,
            name: p.title,
            description: derived.text,
            images: p.images,
            sku: p.sku,
            price: p.price,
            currency: p.currency,
            availability: p.availability,
            material,
            variants: p.variants,
          }),
          breadcrumbNode([
            { name: 'Home', path: '/' },
            { name: p.title, path },
          ]),
        ],
        main: `      <h1 class="font-display">${esc(p.title)}</h1>
      <p>${esc(money(p.price, p.currency))}</p>
      <p>${p.availability ? 'In stock' : 'Sold out'}${p.sku ? ` · SKU ${esc(p.sku)}` : ''}${
        material ? ` · ${esc(material.join(', '))}` : ''
      }</p>
      ${p.images
        .slice(0, 4)
        .map(
          (src) =>
            `<img src="${esc(src)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy" width="900" height="1200" />`,
        )
        .join('\n      ')}
${
  held
    ? ''
    : `      <h2 class="font-display">Description</h2>
      <p>${esc(p.description || p.title)}</p>`
}
${
  p.options.length
    ? `      <h2 class="font-display">Options</h2>
      <ul>${p.options
        .map((o) => `<li>${esc(o.name)}: ${esc((o.values || []).join(', '))}</li>`)
        .join('')}</ul>`
    : ''
}
      <p>Sold by ${esc(BRAND_DISPLAY)} (${esc(BRAND_NAME)}). <a href="/size-guide">Size guide</a> · <a href="/shipping">Shipping</a> · <a href="/returns">Returns</a></p>`,
      },
      template,
    );
  }

  // ---- Manifest for verification -------------------------------------
  writeFileSync(
    join(DIST, 'prerender-manifest.json'),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        routeCount: written.length,
        staticRoutes: STATIC_ROUTES.length,
        productRoutes: allProducts.length,
        heldProducts,
        routes: written,
      },
      null,
      2,
    )}\n`,
  );

  const titles = new Set(written.map((w) => w.title));
  const descriptions = new Set(written.map((w) => w.description));
  console.log(
    `[prerender] ${written.length} routes (${STATIC_ROUTES.length} static + ${allProducts.length} product) — ` +
      `${titles.size} unique titles, ${descriptions.size} unique descriptions`,
  );
  if (titles.size !== written.length || descriptions.size !== written.length) {
    console.warn('[prerender] WARNING: duplicate titles or descriptions detected');
  }
  if (heldProducts.length) {
    console.log(
      `[prerender] HOLD: merchant description withheld from machine-readable surfaces for ` +
        `${heldProducts.length} product(s): ${heldProducts.join(', ')}`,
    );
  }
}

await main();
