/**
 * Brand constants. The values themselves live in `src/seo/brand.js` so that the
 * build-time scripts (prerender, sitemap) can read the same source with plain Node.
 * This module is kept as the app-facing import path.
 */
export {
  SITE_URL,
  SITE_NAME,
  SITE_ALT_NAME,
  SITE_EMAIL,
  SITE_CITY,
  SITE_REGION,
  SITE_LOCATION,
  SITE_DESCRIPTION,
  SOCIAL_URLS,
  DEFAULT_OG_IMAGE,
  BRAND_NAME,
  BRAND_DISPLAY,
  BRAND_LEGAL_NAME,
  BRAND_FOUNDER,
  absoluteUrl,
  canonicalPath,
  pageTitle,
} from '@/seo/brand.js';
