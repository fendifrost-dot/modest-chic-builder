/**
 * Derives machine-readable product copy from the Shopify source of truth.
 *
 * Nothing here invents a fact. Every output is either the merchant's own text or a
 * sentence composed from fields that exist in Shopify (title, product type, price,
 * currency). Two real problems in the catalogue are handled:
 *
 *   1. Several product descriptions open with a raw size-chart dump
 *      ("S M L XL 2XL 3XL Width, in 18.25 20.25 …"). Used verbatim these produce
 *      useless — and, for two products, byte-identical — meta descriptions. The
 *      first genuine prose in the description is used instead.
 *
 *   2. One product's description is under an explicit publication hold. Its merchant
 *      text is kept off machine-readable surfaces (meta description, JSON-LD,
 *      prerendered HTML) until the hold is lifted. The storefront itself still
 *      renders the merchant's description unchanged — this suppresses a signal, it
 *      never adds one.
 */
import { BRAND_DISPLAY, BRAND_NAME } from './brand.js';

/** Trim to a sensible meta-description length, on a word boundary. */
export function clampDescription(text, max = 158) {
  const flat = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const boundary = cut.lastIndexOf(' ');
  return `${(boundary > 0 ? cut.slice(0, boundary) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/**
 * Products whose merchant description is under a publication hold.
 *
 * Listed by handle rather than by phrase so the held text itself never ships in the
 * client bundle. `scripts/hold-audit.mjs` holds the phrase list and runs at build
 * time, failing the build if a product matches a held phrase without being listed
 * here — so a new match can never slip through silently.
 *
 * Emptying this array lifts the hold; nothing else needs to change.
 */
export const HELD_PRODUCT_HANDLES = ['nutrition-album-tee'];

export function isHeldProduct(handle) {
  return HELD_PRODUCT_HANDLES.includes(String(handle ?? ''));
}

/** Heuristic: does this opening read as a measurement table rather than prose? */
function looksLikeMeasurementTable(text) {
  const head = String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
  if (!head) return false;
  const digitChars = (head.match(/[\d.]/g) || []).length;
  return digitChars / head.length > 0.15;
}

/**
 * First run of real prose in a description: ten consecutive digit-free words
 * starting on a capital letter.
 */
function firstProse(text) {
  const tokens = String(text ?? '').replace(/\s+/g, ' ').trim().split(' ');
  for (let i = 0; i < tokens.length; i += 1) {
    const window = tokens.slice(i, i + 10);
    if (window.length < 10) break;
    if (window.every((t) => !/\d/.test(t)) && /^["“'(]?[A-Z]/.test(tokens[i])) {
      return tokens.slice(i).join(' ');
    }
  }
  return null;
}

/** A factual one-liner built only from fields Shopify actually holds. */
export function composedDescription({ title, productType, price, currency }) {
  const type = productType ? String(productType).toLowerCase() : null;
  const priced =
    price !== undefined && price !== null
      ? ` $${Number(price).toFixed(2)} ${currency || ''}`.trimEnd() + '.'
      : '';
  return `${title}${type ? ` — ${type}` : ''} from ${BRAND_DISPLAY} (${BRAND_NAME}).${priced}`;
}

/**
 * The description to publish for a product.
 * Returns the text plus which source it came from, so the build can report it.
 */
export function machineDescription(product) {
  const { handle, title, productType, price, currency, description, seoDescription } = product;
  const held = isHeldProduct(handle);

  if (!held) {
    if (seoDescription) {
      return { text: seoDescription.replace(/\s+/g, ' ').trim(), source: 'shopify-seo' };
    }
    if (description) {
      const isTable = looksLikeMeasurementTable(description);
      const prose = isTable ? firstProse(description) : description.replace(/\s+/g, ' ').trim();
      if (prose) return { text: prose, source: isTable ? 'prose-extract' : 'shopify' };
    }
  }

  return {
    text: composedDescription({ title, productType, price, currency }),
    source: held ? 'composed-held' : 'composed',
  };
}
