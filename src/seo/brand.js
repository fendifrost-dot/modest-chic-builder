/**
 * Canonical Modest entity facts — the single source of truth for brand identity.
 *
 * Consumed by the React app (via `@/seo/brand`) and by the build-time scripts
 * (`scripts/prerender.mjs`, `scripts/generate-sitemap.mjs`) which import this file
 * directly with Node. Keep it dependency-free ESM so both can read it.
 *
 * Rules that must not be relaxed without an explicit directive:
 *   - `Modest` is the machine-readable brand name; `MOD#$T` is display styling.
 *   - `info@bemoremodest.com` is the only public email address.
 *   - There is NO public telephone number. Never add a `telephone` property.
 *   - `sameAs` carries official Modest properties only.
 */

export const SITE_URL = 'https://bemoremodest.com';

/** Machine-readable brand name (schema.org `name`). */
export const BRAND_NAME = 'Modest';
/** Display styling used in visible titles and UI chrome. */
export const BRAND_DISPLAY = 'MOD#$T';
export const BRAND_LEGAL_NAME = 'Modest Streetwear Apparel Inc.';
export const BRAND_ALTERNATE_NAMES = [BRAND_DISPLAY, 'Be More Modest', 'BeMoreModest'];

export const BRAND_FOUNDING_DATE = '2017-09';
export const BRAND_FOUNDER = 'Terrence Cleveland';
export const BRAND_FOUNDER_ROLES = ['Founder', 'Chief Executive Officer', 'Lead Designer'];

export const SITE_EMAIL = 'info@bemoremodest.com';
export const SITE_CITY = 'Chicago';
export const SITE_REGION = 'IL';
export const SITE_REGION_NAME = 'Illinois';
export const SITE_COUNTRY = 'US';
export const SITE_LOCATION = 'Chicago, IL';

/**
 * Official Modest social properties only.
 * Fendi Frost properties must never appear here.
 *
 * No TikTok: the founder never created one, and the @bemoremodest handle on
 * TikTok belongs to someone else. Claiming it in `sameAs` would assert an
 * ownership that is not ours. Do not re-add it.
 */
export const SOCIAL_URLS = {
  instagram: 'https://instagram.com/bemoremodest',
  twitter: 'https://twitter.com/bemoremodest',
};

export const SAME_AS = Object.values(SOCIAL_URLS);

export const SITE_DESCRIPTION =
  'MOD#$T (Modest) is a Chicago streetwear label founded in 2017 by Terrence Cleveland. ' +
  'Shop cashmere sweaters, varsity jackets, bombers, graphic tees and accessories.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const BRAND_LOGO = `${SITE_URL}/favicon.svg`;

/** Stable @id nodes so the JSON-LD graph references one entity, not many copies. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

/** Legacy aliases retained so existing imports from `@/lib/site` keep working. */
export const SITE_NAME = BRAND_DISPLAY;
export const SITE_ALT_NAME = 'Be More Modest';

/**
 * Normalise a path to its canonical form: absolute, no trailing slash (except root),
 * no query string, no fragment.
 */
export function canonicalPath(path) {
  if (!path) return '/';
  let p = String(path).split('#')[0].split('?')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * Absolute, canonical, URL-safe.
 *
 * Relative paths are percent-encoded because some Shopify handles carry characters
 * that are illegal in a URL (e.g. "unisex-heavy-blend\u2122-hooded-sweatshirt").
 * Values that are already absolute URLs — Shopify CDN image sources, for instance —
 * are passed through untouched, since re-encoding them would corrupt any %XX
 * sequences they already contain.
 */
export function absoluteUrl(path) {
  if (typeof path === 'string' && path.startsWith('http')) return path;
  return encodeURI(`${SITE_URL}${canonicalPath(path)}`);
}

/** Visible page title. Interior pages get the display brand as a suffix. */
export function pageTitle(page) {
  return page
    ? `${page} | ${BRAND_DISPLAY}`
    : `${BRAND_DISPLAY} (Modest) | Chicago Streetwear — Cashmere, Varsity Jackets & Tees`;
}
