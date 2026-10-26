/**
 * schema.org JSON-LD builders — shared by the React components (rendered DOM) and by
 * scripts/prerender.mjs (raw HTML), so both emit byte-comparable graphs.
 *
 * Entity rules enforced here:
 *   - `name` is "Modest"; "MOD#$T" is an alternateName.
 *   - No `telephone` property is emitted anywhere, ever.
 *   - `sameAs` carries official Modest properties only — no Fendi Frost.
 *   - Address is locality/region/country only. No street address is published.
 *   - Product facts are passed in from Shopify; nothing is inferred here.
 */
import {
  SITE_URL,
  BRAND_NAME,
  BRAND_DISPLAY,
  BRAND_LEGAL_NAME,
  BRAND_ALTERNATE_NAMES,
  BRAND_FOUNDING_DATE,
  BRAND_FOUNDER,
  BRAND_FOUNDER_ROLES,
  BRAND_LOGO,
  SITE_EMAIL,
  SITE_CITY,
  SITE_REGION,
  SITE_COUNTRY,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SAME_AS,
  ORGANIZATION_ID,
  WEBSITE_ID,
  FOUNDER_ID,
  absoluteUrl,
} from './brand.js';

export const BRAND_ID = `${SITE_URL}/#brand`;

const drop = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)),
  );

/* ------------------------------------------------------------------ *
 * Entity nodes
 * ------------------------------------------------------------------ */

export function founderNode() {
  return {
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: BRAND_FOUNDER,
    jobTitle: BRAND_FOUNDER_ROLES,
    worksFor: { '@id': ORGANIZATION_ID },
  };
}

export function brandNode() {
  return {
    '@type': 'Brand',
    '@id': BRAND_ID,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    logo: BRAND_LOGO,
    url: SITE_URL,
  };
}

export function organizationNode() {
  return {
    '@type': ['Organization', 'ClothingStore'],
    '@id': ORGANIZATION_ID,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    legalName: BRAND_LEGAL_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: BRAND_LOGO },
    image: DEFAULT_OG_IMAGE,
    email: SITE_EMAIL,
    description: SITE_DESCRIPTION,
    foundingDate: BRAND_FOUNDING_DATE,
    founder: { '@id': FOUNDER_ID },
    brand: { '@id': BRAND_ID },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_CITY,
      addressRegion: SITE_REGION,
      addressCountry: SITE_COUNTRY,
    },
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE_CITY,
        addressRegion: SITE_REGION,
        addressCountry: SITE_COUNTRY,
      },
    },
    areaServed: SITE_COUNTRY,
    priceRange: '$$',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SITE_EMAIL,
      availableLanguage: 'en',
    },
    sameAs: SAME_AS,
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: BRAND_NAME,
    alternateName: BRAND_ALTERNATE_NAMES,
    url: SITE_URL,
    inLanguage: 'en-US',
    publisher: { '@id': ORGANIZATION_ID },
    copyrightHolder: { '@id': ORGANIZATION_ID },
  };
}

/** The site-wide entity graph. Emitted on every route. */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), brandNode(), founderNode(), websiteNode()],
  };
}

/* ------------------------------------------------------------------ *
 * Page-level nodes
 * ------------------------------------------------------------------ */

export function breadcrumbNode(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url || absoluteUrl(item.path),
    })),
  };
}

export function webPageNode({ path, name, description, type = 'WebPage', primaryImage }) {
  const url = absoluteUrl(path);
  return drop({
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-US',
    primaryImageOfPage: primaryImage,
  });
}

export function faqNode(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/**
 * CollectionPage + ItemList.
 * `items` come straight from the Shopify response — nothing is inferred.
 */
export function collectionNode({ path, name, description, items = [] }) {
  const url = absoluteUrl(path);
  return drop({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-US',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) =>
        drop({
          '@type': 'ListItem',
          position: index + 1,
          url: item.url,
          item: drop({
            '@type': 'Product',
            '@id': `${item.url}#product`,
            name: item.name,
            url: item.url,
            image: item.image,
            brand: { '@id': BRAND_ID },
            offers: item.price
              ? drop({
                  '@type': 'Offer',
                  url: item.url,
                  price: item.price,
                  priceCurrency: item.currency,
                  availability: availabilityUrl(item.availability),
                })
              : undefined,
          }),
        }),
      ),
    },
  });
}

function availabilityUrl(available) {
  if (available === undefined || available === null) return undefined;
  return available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
}

/**
 * Material is only emitted when the merchant's own Shopify tags name a material
 * outright. Nothing is guessed from product titles or imagery.
 */
export const MATERIAL_TAGS = ['cotton', 'cashmere', 'wool', 'leather', 'denim', 'linen', 'silk'];

export function materialFromTags(tags = []) {
  const found = tags
    .map((t) => String(t).trim().toLowerCase())
    .filter((t) => MATERIAL_TAGS.includes(t));
  if (found.length === 0) return undefined;
  return [...new Set(found)].map((t) => t[0].toUpperCase() + t.slice(1));
}

/**
 * Product + Offer.
 * Every value is supplied by the caller from the Shopify source of truth.
 * `sku` is only emitted when it is a real merchant SKU, never a synthesised id.
 */
export function productNode({
  path,
  name,
  description,
  images = [],
  sku,
  price,
  currency,
  availability,
  material,
  variants = [],
}) {
  const url = absoluteUrl(path);
  const numericPrices = variants
    .map((v) => parseFloat(v.price))
    .filter((n) => Number.isFinite(n));
  const useAggregate = variants.length > 1 && numericPrices.length > 0;

  return drop({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name,
    description,
    url,
    image: images,
    sku,
    material,
    brand: { '@id': BRAND_ID },
    offers: drop(
      useAggregate
        ? {
            '@type': 'AggregateOffer',
            url,
            priceCurrency: currency,
            lowPrice: Math.min(...numericPrices).toFixed(2),
            highPrice: Math.max(...numericPrices).toFixed(2),
            offerCount: variants.length,
            availability: availabilityUrl(availability),
            seller: { '@id': ORGANIZATION_ID },
          }
        : {
            '@type': 'Offer',
            url,
            priceCurrency: currency,
            price,
            availability: availabilityUrl(availability),
            seller: { '@id': ORGANIZATION_ID },
          },
    ),
    hasVariant: variants.length
      ? variants.map((variant) =>
          drop({
            '@type': 'Product',
            name: variant.name,
            sku: variant.sku,
            image: variant.image,
            color: variant.color,
            size: variant.size,
            brand: { '@id': BRAND_ID },
            offers: drop({
              '@type': 'Offer',
              url,
              priceCurrency: variant.currency,
              price: variant.price,
              availability: availabilityUrl(variant.availability),
              seller: { '@id': ORGANIZATION_ID },
            }),
          }),
        )
      : undefined,
  });
}

/** Serialise for embedding in a <script> tag without allowing a tag breakout. */
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
