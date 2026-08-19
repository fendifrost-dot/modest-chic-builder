export const SITE_URL = 'https://bemoremodest.com';
export const SITE_NAME = 'MOD#$T';
export const SITE_ALT_NAME = 'Be More Modest';
export const SITE_EMAIL = 'info@bemoremodest.com';
export const SITE_CITY = 'Chicago';
export const SITE_REGION = 'IL';
export const SITE_LOCATION = 'Chicago, IL';
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
