#!/usr/bin/env node
/**
 * Phase 1A verification gate.
 *
 * Runs the twelve checks the 2026-08-19 baseline used, over raw HTTP with no
 * JavaScript execution — the view a non-rendering crawler or retriever gets.
 *
 *   node scripts/verify-seo.mjs --base https://bemoremodest.com
 *   node scripts/verify-seo.mjs --base http://127.0.0.1:4173 --json report.json
 *
 * Exits non-zero if any check fails, so it can gate a deploy.
 */
import { writeFileSync } from 'node:fs';
import { STATIC_PATHS, productPath } from '../src/seo/routes.js';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const BASE = (arg('base', 'http://127.0.0.1:4173') || '').replace(/\/$/, '');
const JSON_OUT = arg('json', null);
const CANONICAL_ORIGIN = 'https://bemoremodest.com';

/** The routes the directive names for the gate, plus the namespace probes. */
const GATE_ROUTES = [
  '/',
  '/about',
  '/mens',
  '/womens',
  '/accessories',
  productPath('big-bear-cashmere-sweater'),
  productPath('ketchup-mustard-varsity-jacket'),
  productPath('unisex-jersey-short-sleeve-tee'),
  '/contact',
  '/faq',
];

const NAMESPACE_PROBES = [
  '/products/big-bear-cashmere-sweater',
  '/collections/mens',
  '/collections/all',
];

const PHONE = /\b(\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/;

const pick = (html, re) => (html.match(re) || [])[1] ?? null;

const canonicalOf = (h) => pick(h, /<link rel="canonical" href="([^"]*)"/i);
const titleOf = (h) => pick(h, /<title>([\s\S]*?)<\/title>/i);
const descOf = (h) => pick(h, /<meta name="description" content="([^"]*)"/i);
const ogUrlOf = (h) => pick(h, /<meta property="og:url" content="([^"]*)"/i);
const robotsOf = (h) => pick(h, /<meta name="robots" content="([^"]*)"/i);

function jsonLdOf(html) {
  const out = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1].replace(/\\u003c/g, '<')));
    } catch (err) {
      out.push({ __parseError: err.message });
    }
  }
  return out;
}

/** Text a non-rendering retriever can actually read out of <body>. */
function bodyText(html) {
  const body = html.slice(html.indexOf('<body'));
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const internalLinksOf = (html) =>
  [...new Set([...html.matchAll(/href="(\/[^"#][^"]*)"/g)].map((m) => m[1]))];

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { 'user-agent': 'Modest-SEO-Verify/1.0' },
  });
  const body = res.status >= 300 && res.status < 400 ? '' : await res.text();
  return { status: res.status, location: res.headers.get('location'), body };
}

/* ------------------------------------------------------------------ */

const results = [];
const failures = [];

function check(route, name, ok, detail) {
  results.push({ route, check: name, pass: Boolean(ok), detail });
  if (!ok) failures.push(`${route} — ${name}: ${detail}`);
}

const sitemapRes = await get('/sitemap.xml');
const sitemapUrls = new Set(
  [...sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURI(m[1])),
);
const robotsRes = await get('/robots.txt');

const titles = new Map();
const descriptions = new Map();

for (const route of GATE_ROUTES) {
  const { status, body } = await get(route);
  const expectedCanonical = `${CANONICAL_ORIGIN}${route}`;

  check(route, '1. HTTP status 200', status === 200, `got ${status}`);

  const canonical = canonicalOf(body);
  check(
    route,
    '2. self-referencing canonical',
    decodeURI(canonical || '') === expectedCanonical,
    `got ${canonical}`,
  );

  const title = titleOf(body);
  check(route, '3. unique title', title && !titles.has(title), `"${title}"${titles.has(title) ? ` duplicates ${titles.get(title)}` : ''}`);
  if (title) titles.set(title, route);

  const description = descOf(body);
  check(
    route,
    '4. unique description',
    description && description.length > 40 && !descriptions.has(description),
    description ? `${description.length} chars${descriptions.has(description) ? ` — duplicates ${descriptions.get(description)}` : ''}` : 'missing',
  );
  if (description) descriptions.set(description, route);

  const ogUrl = ogUrlOf(body);
  check(route, '5. og:url matches canonical', decodeURI(ogUrl || '') === expectedCanonical, `got ${ogUrl}`);

  const text = bodyText(body);
  check(route, '6. raw-HTML route content', text.length >= 250, `${text.length} chars of readable text`);

  const graphs = jsonLdOf(body);
  check(route, '8. structured data present', graphs.length > 0, `${graphs.length} JSON-LD blocks`);

  const parseErrors = graphs.filter((g) => g.__parseError);
  const org = graphs
    .flatMap((g) => g['@graph'] || [g])
    .find((n) => [].concat(n['@type'] || []).includes('Organization'));
  const serialized = JSON.stringify(graphs);
  const valid =
    parseErrors.length === 0 &&
    org &&
    org.name === 'Modest' &&
    [].concat(org.alternateName || []).includes('MOD#$T') &&
    org.legalName === 'Modest Streetwear Apparel Inc.' &&
    org.foundingDate === '2017-09' &&
    org.email === 'info@bemoremodest.com' &&
    !/"telephone"/.test(serialized) &&
    !/fendi/i.test(serialized);
  check(
    route,
    '9. structured data valid + entity correct',
    valid,
    parseErrors.length ? `JSON parse error: ${parseErrors[0].__parseError}` : org ? 'entity fields checked' : 'no Organization node',
  );

  check(
    route,
    '10. present in sitemap',
    sitemapUrls.has(`${CANONICAL_ORIGIN}${route}`),
    `${sitemapUrls.size} URLs in sitemap`,
  );

  const links = internalLinksOf(body);
  check(route, '11. internal links in raw HTML', links.length >= 8, `${links.length} distinct internal links`);

  const robotsMeta = robotsOf(body);
  check(
    route,
    '12. indexable',
    robotsMeta ? /index/.test(robotsMeta) && !/noindex/.test(robotsMeta) : false,
    `robots="${robotsMeta}"`,
  );

  // Contact-surface guard.
  const contactSurface = `${body}`;
  check(
    route,
    'no support@ address',
    !/support@/i.test(contactSurface),
    'support@ found in page source',
  );
  const phoneHunt = text.replace(/\b(19|20)\d{2}\b/g, ' ').replace(/\$[\d.,]+/g, ' ');
  check(route, 'no public phone number', !PHONE.test(phoneHunt), `matched "${(phoneHunt.match(PHONE) || [])[0]}"`);
  check(route, 'no Fendi Frost reference', !/fendi/i.test(body), 'fendi found in page source');
}

// ---- Namespace probes -------------------------------------------------
for (const probe of NAMESPACE_PROBES) {
  const { status, location } = await get(probe);
  check(
    probe,
    'foreign namespace 301s to the authoritative URL',
    status === 301 && Boolean(location),
    `status ${status}${location ? ` → ${location}` : ''}`,
  );
}

// ---- Site-wide --------------------------------------------------------
check('/robots.txt', 'robots.txt served', robotsRes.status === 200, `status ${robotsRes.status}`);
check(
  '/robots.txt',
  'robots.txt declares the sitemap',
  /Sitemap:\s*https:\/\/bemoremodest\.com\/sitemap\.xml/i.test(robotsRes.body),
  'missing Sitemap directive',
);
check('/sitemap.xml', 'sitemap served', sitemapRes.status === 200, `status ${sitemapRes.status}`);
check(
  '/sitemap.xml',
  'sitemap covers every static route',
  STATIC_PATHS.every((p) => sitemapUrls.has(`${CANONICAL_ORIGIN}${p}`)),
  `${sitemapUrls.size} URLs`,
);
check(
  '/sitemap.xml',
  'sitemap uses only the singular /product namespace',
  ![...sitemapUrls].some((u) => u.includes('/products/') || u.includes('/collections/')),
  'foreign namespace URL found in sitemap',
);

/* ------------------------------------------------------------------ */

const passed = results.filter((r) => r.pass).length;
const byRoute = new Map();
for (const r of results) {
  if (!byRoute.has(r.route)) byRoute.set(r.route, []);
  byRoute.get(r.route).push(r);
}

for (const [route, checks] of byRoute) {
  const bad = checks.filter((c) => !c.pass);
  console.log(`${bad.length === 0 ? 'PASS' : 'FAIL'}  ${route}  (${checks.length - bad.length}/${checks.length})`);
  for (const c of bad) console.log(`        ✗ ${c.check} — ${c.detail}`);
}

console.log(`\n${passed}/${results.length} checks passed against ${BASE}`);

if (JSON_OUT) {
  writeFileSync(
    JSON_OUT,
    `${JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), passed, total: results.length, results }, null, 2)}\n`,
  );
  console.log(`Wrote ${JSON_OUT}`);
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exitCode = 1;
}
