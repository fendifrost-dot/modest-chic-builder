export const SITE_URL = 'https://bemoremodest.com';
/** Visual lockup */
export const SITE_NAME = 'MOD#$T';
/** Canonical machine-readable entity name */
export const ENTITY_NAME = 'Modest';
export const SITE_ALT_NAME = 'Be More Modest';
export const ENTITY_ID = `${SITE_URL}/#modest`;

export const SITE_EMAIL = 'info@bemoremodest.com';
export const SITE_CITY = 'Chicago';
export const SITE_REGION = 'IL';
export const SITE_LOCATION = 'Chicago, IL';
/** Confirmed legal owner — customer-facing brand remains Modest / MOD#$T. */
export const LEGAL_ENTITY_NAME = 'Modest Streetwear Apparel Inc.';
export const LEGAL_STREET = '8402 S Burley Ave';
export const LEGAL_ADDRESS = '8402 S Burley Ave, Chicago, IL';
export const SITE_FOUNDED = 'September 2017';
export const SITE_FOUNDED_YEAR = 2017;

export const FOUNDER_LEGAL_NAME = 'Terrence Cleveland';
export const FOUNDER_CREATIVE_NAME = 'Fendi Frost';
export const FOUNDER_DISPLAY = 'Terrence Cleveland / Fendi Frost';
export const FOUNDER_ROLE = 'Founder, CEO, and Lead Designer';

export const PRODUCT_CATEGORIES = [
  'Outerwear',
  'Cashmere sweaters',
  'Sweatshirts',
  'T-shirts',
  'Accessories',
] as const;

export const SITE_DESCRIPTION =
  'Premium streetwear that speaks without shouting. Shop exclusive cashmere sweaters, varsity jackets, hoodies and accessories. Crafted for those who know true luxury is understated.';

export const SOCIAL_URLS = {
  instagram: 'https://instagram.com/bemoremodest',
  twitter: 'https://twitter.com/bemoremodest',
  tiktok: 'https://www.tiktok.com/@bemoremodest',
} as const;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function pageTitle(page?: string): string {
  return page ? `${page} | ${SITE_NAME}` : `${SITE_NAME} | Premium Luxury Streetwear - ${SITE_ALT_NAME}`;
}
