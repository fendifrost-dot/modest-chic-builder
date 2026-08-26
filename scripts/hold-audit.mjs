/**
 * Build-time guard for the publication hold.
 *
 * The held phrases live here, in a build-only module, so they are never bundled
 * into the client JavaScript that ships from bemoremodest.com. The app-side hold
 * (src/seo/product-meta.js) lists held products by handle instead.
 *
 * This audit re-derives the hold from the live Shopify catalogue on every build and
 * fails the build if the two ever disagree — so a newly-added product carrying held
 * text can never be published by accident, and a stale entry can never quietly
 * suppress a product that no longer needs it.
 */
import { HELD_PRODUCT_HANDLES } from '../src/seo/product-meta.js';

const HELD_PHRASES = ['fendi frost'];

function matchesHeldPhrase(product) {
  const hay = [
    product.title,
    product.description,
    product.seoTitle,
    product.seoDescription,
    (product.tags || []).join(' '),
  ]
    .join(' ')
    .toLowerCase();
  return HELD_PHRASES.some((phrase) => hay.includes(phrase));
}

/**
 * @returns {{ matched: string[], missing: string[], stale: string[] }}
 * @throws if the declared hold list and the live catalogue disagree.
 */
export function auditHold(products) {
  const matched = products.filter(matchesHeldPhrase).map((p) => p.handle);
  const missing = matched.filter((h) => !HELD_PRODUCT_HANDLES.includes(h));
  const stale = HELD_PRODUCT_HANDLES.filter((h) => !matched.includes(h));

  if (missing.length) {
    throw new Error(
      `hold audit: product(s) carry held text but are not declared in HELD_PRODUCT_HANDLES: ` +
        `${missing.join(', ')}. Add them to src/seo/product-meta.js before building.`,
    );
  }
  if (stale.length) {
    throw new Error(
      `hold audit: HELD_PRODUCT_HANDLES lists product(s) that no longer carry held text: ` +
        `${stale.join(', ')}. Remove them from src/seo/product-meta.js.`,
    );
  }
  return { matched, missing, stale };
}
