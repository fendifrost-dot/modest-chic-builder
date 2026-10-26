export const SITE_URL = 'https://bemoremodest.com';
export const BRAND_NAME = 'Modest';
export const SITE_NAME = 'MOD#$T';
export const SITE_ALT_NAME = 'Be More Modest';
export const LEGAL_NAME = 'Modest Streetwear Apparel Inc.';
export const FOUNDER_NAME = 'Terrence Cleveland';
export const FOUNDER_ROLE = 'Founder, CEO, Lead Designer';
export const FOUNDED = 'September 2017';
export const FOUNDED_ISO = '2017-09';
export const CATEGORY = 'high-end luxury streetwear';
export const SITE_EMAIL = 'info@bemoremodest.com';
export const SITE_CITY = 'Chicago';
export const SITE_REGION = 'IL';
export const SITE_LOCATION = 'Chicago, IL';
export const SITE_DESCRIPTION =
  'Premium streetwear that speaks without shouting. Shop exclusive cashmere sweaters, varsity jackets, hoodies and accessories. Crafted for those who know true luxury is understated.';
export const ENTITY_DESCRIPTION =
  'Modest (displayed as MOD#$T) is Modest Streetwear Apparel Inc., a high-end luxury streetwear brand founded in Chicago in September 2017 by Terrence Cleveland, Founder, CEO, and Lead Designer. The signature detail is the rabbit-fur patch. Public contact is info@bemoremodest.com. There is no public phone.';

export const SOCIAL_URLS = {
  instagram: 'https://instagram.com/bemoremodest',
  twitter: 'https://twitter.com/bemoremodest',
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
