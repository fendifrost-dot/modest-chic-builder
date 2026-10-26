/**
 * Route manifest — the single source of truth for every indexable non-product route.
 *
 * One entry per route supplies: the canonical path, a unique <title>, a unique meta
 * description, the on-page content (used by the React page components AND by the
 * build-time prerenderer so the same words reach JS and non-JS retrievers), and the
 * schema.org page type.
 *
 * Consumed by:
 *   - src/pages/Collection.tsx, src/pages/InfoPage.tsx  (rendered DOM)
 *   - scripts/prerender.mjs                              (raw HTML)
 *   - scripts/generate-sitemap.mjs                       (sitemap)
 */
import { BRAND_DISPLAY, SITE_EMAIL, SITE_LOCATION, pageTitle } from './brand.js';

/** Product URLs live under the singular `/product/` namespace. See docs/seo/URL_NORMALIZATION.md. */
export const PRODUCT_PATH_PREFIX = '/product';

export const productPath = (handle) => `${PRODUCT_PATH_PREFIX}/${handle}`;

/* ------------------------------------------------------------------ *
 * Collection / category routes
 * ------------------------------------------------------------------ */

export const COLLECTION_ROUTES = {
  mens: {
    path: '/mens',
    /** Shopify collection handle backing this route (source of truth for products). */
    collectionHandle: 'frontpage',
    title: "Men's Streetwear",
    subtitle: 'For Him',
    heading: "Men's Collection",
    description:
      "Men's MOD#$T (Modest) streetwear — cashmere sweaters, varsity jackets, bombers, hoodies and graphic tees from the Chicago label.",
    intro:
      "The men's line from MOD#$T (Modest), the Chicago streetwear label founded in 2017 by Terrence Cleveland. Cashmere knitwear, varsity and bomber jackets, hoodies, sweatshirts and graphic tees.",
  },
  womens: {
    path: '/womens',
    collectionHandle: 'womens',
    title: "Women's Streetwear",
    subtitle: 'For Her',
    heading: "Women's Collection",
    description:
      "Women's MOD#$T (Modest) streetwear — crop tees, bomber and varsity jackets, cashmere and everyday essentials from the Chicago label.",
    intro:
      "The women's line from MOD#$T (Modest). Crop tees, bombers, varsity jackets and relaxed everyday pieces designed in Chicago.",
  },
  accessories: {
    path: '/accessories',
    collectionHandle: 'accessories',
    title: 'Accessories',
    subtitle: 'Complete the Look',
    heading: 'Accessories',
    description:
      'MOD#$T (Modest) accessories — the Big Bear Head ski mask, leather-patch hats and add-on pieces from the Chicago streetwear label.',
    intro:
      'Accessories from MOD#$T (Modest): ski masks, hats and add-on pieces that finish the look.',
  },
  'new-arrivals': {
    path: '/new-arrivals',
    /** No Shopify collection is bound; newest-first across the whole catalogue. */
    sortKey: 'CREATED_AT',
    reverse: true,
    title: 'New Arrivals',
    subtitle: 'Just Dropped',
    heading: 'New Arrivals',
    description:
      'The newest MOD#$T (Modest) releases, newest first — jackets, knitwear, tees and accessories as they drop.',
    intro: 'The most recently released MOD#$T (Modest) pieces, newest first.',
  },
  sale: {
    path: '/sale',
    query: 'tag:sale OR tag:Sale',
    sortKey: 'CREATED_AT',
    reverse: true,
    title: 'Sale',
    subtitle: 'Limited Time',
    heading: 'Sale',
    description:
      'MOD#$T (Modest) sale — current reductions on selected streetwear, applied at Shopify checkout.',
    intro: 'Current MOD#$T (Modest) reductions on selected pieces.',
    emptyMessage:
      'Exclusive savings of up to 30% are applied at checkout. Add pieces to your cart to see the offer on eligible items.',
  },
};

/* ------------------------------------------------------------------ *
 * Information routes
 * ------------------------------------------------------------------ */

export const INFO_ROUTES = {
  about: {
    path: '/about',
    schemaType: 'AboutPage',
    title: 'About Modest',
    subtitle: 'Our Story',
    heading: 'About MOD#$T',
    description:
      'MOD#$T (Modest) is a streetwear label founded in September 2017 by Terrence Cleveland and based in Chicago, Illinois. Legal entity: Modest Streetwear Apparel Inc.',
    sections: [
      {
        body: 'MOD#$T — written "Modest" — is a streetwear label founded in September 2017 by Terrence Cleveland and based in Chicago, Illinois. It trades as Modest Streetwear Apparel Inc.',
      },
      {
        body: 'MOD#$T was born from a simple belief: true style does not need to scream. We craft premium streetwear for those who understand that real luxury is felt, not flaunted.',
      },
      {
        heading: 'Our Mission',
        body: 'Every piece we release is designed with intention — from fabric selection to fit — so you can move through the world with quiet confidence. We believe modesty is not limitation; it is refinement.',
      },
      {
        heading: 'Craft & Quality',
        body: 'We obsess over the details others overlook. Premium materials, thoughtful construction, and limited runs ensure each drop feels exclusive without being excessive.',
      },
      {
        heading: 'Founder',
        body: 'Terrence Cleveland is the founder, Chief Executive Officer and lead designer of MOD#$T.',
      },
    ],
  },
  contact: {
    path: '/contact',
    schemaType: 'ContactPage',
    title: 'Contact Modest',
    subtitle: 'Get in Touch',
    heading: 'Contact Us',
    description: `Contact MOD#$T (Modest) at ${SITE_EMAIL}. The label is based in ${SITE_LOCATION}. Typical response time is 1–2 business days.`,
    sections: [
      {
        body: 'We would love to hear from you. Whether you have a question about your order, sizing, or a collaboration inquiry, our team is here to help.',
      },
      { heading: 'Email', body: SITE_EMAIL },
      { heading: 'Location', body: SITE_LOCATION },
      { heading: 'Response Time', body: 'We typically respond within 1–2 business days.' },
    ],
  },
  shipping: {
    path: '/shipping',
    title: 'Shipping Information',
    subtitle: 'Delivery',
    heading: 'Shipping Info',
    description:
      'MOD#$T (Modest) shipping: orders processed in 1–3 business days, US standard delivery 5–7 business days, free US shipping over $200.',
    sections: [
      {
        body: 'Orders are processed within 1–3 business days. You will receive a confirmation email with tracking once your order ships.',
      },
      {
        heading: 'Domestic Shipping',
        body: 'Standard delivery within the U.S. typically takes 5–7 business days. Free shipping on orders over $200.',
      },
      {
        heading: 'International',
        body: 'International shipping is available to select countries. Rates and delivery times are calculated at checkout.',
      },
    ],
  },
  returns: {
    path: '/returns',
    title: 'Returns & Exchanges',
    subtitle: 'Our Policy',
    heading: 'Returns & Exchanges',
    description:
      'MOD#$T (Modest) accepts returns on unworn items with original tags within 14 days of delivery. Exchanges are subject to availability.',
    sections: [
      {
        body: 'We want you to love your MOD#$T pieces. If something is not right, we accept returns on unworn items with original tags within 14 days of delivery.',
      },
      {
        heading: 'How to Start a Return',
        body: `Email ${SITE_EMAIL} with your order number and reason for return. We will send you a prepaid return label when eligible.`,
      },
      {
        heading: 'Exchanges',
        body: 'Need a different size? Contact us within 14 days and we will help arrange an exchange based on availability.',
      },
    ],
  },
  'size-guide': {
    path: '/size-guide',
    title: 'Size Guide',
    subtitle: 'Find Your Fit',
    heading: 'Size Guide',
    description:
      'MOD#$T (Modest) sizing: relaxed streetwear fit. XS–5XL on unisex tees, standard US sizing on jackets and cashmere. Size up for an oversized look.',
    sections: [
      {
        body: 'Our pieces are designed with a relaxed, elevated streetwear fit. When in doubt, size up for an oversized look or stay true to size for a classic fit.',
      },
      {
        heading: 'Tops & Hoodies',
        body: 'Measure chest at the fullest point. Compare available sizes on each product page — click any size even if it is crossed out for the current color, and we will switch you to a matching pair.',
      },
      {
        heading: 'Approximate unisex tee fit',
        body: `XS extra fitted • S fitted • M regular streetwear • L relaxed • XL oversized • 2XL–5XL extended. Jackets and cashmere follow standard US sizing. If you prefer an oversized look, size up. Email ${SITE_EMAIL} with height, weight, and preferred fit for a recommendation.`,
      },
    ],
  },
  faq: {
    path: '/faq',
    schemaType: 'FAQPage',
    title: 'Frequently Asked Questions',
    subtitle: 'Common Questions',
    heading: 'FAQs',
    description:
      'Answers to common MOD#$T (Modest) questions: order tracking, Affirm payment plans, limited drops and how to redeem a discount code.',
    sections: [
      {
        heading: 'Where is my order?',
        body: 'Check your confirmation email for tracking. Orders ship within 1–3 business days.',
      },
      {
        heading: 'Do you offer payment plans?',
        body: 'Yes — Affirm is available at checkout on eligible orders.',
      },
      {
        heading: 'Are your drops limited?',
        body: 'Many of our collections are produced in limited quantities. Once they sell out, restocks are not guaranteed.',
      },
      {
        heading: 'How do I use a discount code?',
        body: 'Enter your code at Shopify checkout after adding items to your cart. New subscribers can use WELCOME10 for 10% off the first order.',
      },
      {
        heading: 'How do I contact MOD#$T?',
        body: `Email ${SITE_EMAIL}. That is the only public contact address for the brand.`,
      },
    ],
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy',
    subtitle: 'Legal',
    heading: 'Privacy Policy',
    description:
      'How MOD#$T (Modest) collects and handles customer data. Orders and payments are processed by Shopify.',
    sections: [
      {
        body: 'MOD#$T respects your privacy. We collect only the information needed to process orders, send updates you opt into, and improve your shopping experience.',
      },
      {
        heading: 'What We Collect',
        body: 'Name, email, shipping address, and payment details (processed securely by Shopify). Newsletter signups are managed through our email provider.',
      },
      {
        heading: 'Your Rights',
        body: `You may request access to or deletion of your personal data by contacting ${SITE_EMAIL}.`,
      },
    ],
  },
  terms: {
    path: '/terms',
    title: 'Terms of Service',
    subtitle: 'Legal',
    heading: 'Terms of Service',
    description:
      'Terms governing use of bemoremodest.com and purchases from MOD#$T (Modest). Orders are fulfilled through Shopify.',
    sections: [
      {
        body: 'By using bemoremodest.com, you agree to these terms. All products are subject to availability. Prices and promotions may change without notice.',
      },
      {
        heading: 'Orders & Payment',
        body: 'Orders are fulfilled through Shopify. Payment is charged at checkout. We reserve the right to cancel orders suspected of fraud.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All MOD#$T branding, designs, and content are protected. Unauthorized use is prohibited.',
      },
    ],
  },
  careers: {
    path: '/careers',
    title: 'Careers',
    subtitle: 'Join the Team',
    heading: 'Careers',
    description:
      'MOD#$T (Modest) is based in Chicago, Illinois. No roles are listed at present; portfolios are welcome.',
    sections: [
      {
        body: 'We are a growing brand based in Chicago. While we do not have open roles listed right now, we are always interested in connecting with creative talent.',
      },
      {
        heading: 'Get in Touch',
        body: `Send your portfolio and a brief introduction to ${SITE_EMAIL} with the subject line "Careers".`,
      },
    ],
  },
  press: {
    path: '/press',
    title: 'Press & Media',
    subtitle: 'Media Inquiries',
    heading: 'Press',
    description:
      'Press and media contact for MOD#$T (Modest), the Chicago streetwear label founded by Terrence Cleveland in 2017.',
    sections: [
      {
        body: 'For press kits, interview requests, and media collaborations, please reach out to our team.',
      },
      { heading: 'Contact', body: `${SITE_EMAIL} — subject line "Press"` },
      {
        heading: 'Brand facts',
        body: 'MOD#$T (Modest) — legal entity Modest Streetwear Apparel Inc. Founded September 2017 by Terrence Cleveland, founder, CEO and lead designer. Based in Chicago, Illinois.',
      },
    ],
  },
  sustainability: {
    path: '/sustainability',
    title: 'Sustainability',
    subtitle: 'Our Commitment',
    heading: 'Sustainability',
    description:
      'How MOD#$T (Modest) approaches production: limited runs and durable materials rather than volume.',
    sections: [
      {
        body: 'We believe quality over quantity is the most sustainable choice. By producing in limited runs with durable materials, we aim to reduce waste and encourage pieces that last.',
      },
      {
        heading: 'Materials',
        body: 'We prioritize responsible sourcing where possible and work with suppliers who meet our quality and ethical standards.',
      },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * Homepage
 * ------------------------------------------------------------------ */

export const HOME_ROUTE = {
  path: '/',
  schemaType: 'WebPage',
  title: pageTitle(),
  heading: `${BRAND_DISPLAY} — Modest`,
  description:
    'MOD#$T (Modest) is a Chicago streetwear label founded in September 2017 by Terrence Cleveland. Shop cashmere sweaters, varsity jackets, bombers, hoodies, tees and accessories.',
  intro:
    'MOD#$T — written "Modest" — is a streetwear label founded in September 2017 by Terrence Cleveland and based in Chicago, Illinois. Trading as Modest Streetwear Apparel Inc., it produces cashmere knitwear, varsity and bomber jackets, hoodies, sweatshirts, graphic tees and accessories in limited runs.',
};

/* ------------------------------------------------------------------ *
 * Derived views
 * ------------------------------------------------------------------ */

/** Every indexable static route, in sitemap order. */
export const STATIC_ROUTES = [
  { key: 'home', ...HOME_ROUTE, kind: 'home' },
  ...Object.entries(COLLECTION_ROUTES).map(([key, r]) => ({ key, kind: 'collection', ...r })),
  ...Object.entries(INFO_ROUTES).map(([key, r]) => ({ key, kind: 'info', ...r })),
];

export const STATIC_PATHS = STATIC_ROUTES.map((r) => r.path);

/** Resolved <title> for a static route (HOME_ROUTE already carries its own). */
export function routeTitle(route) {
  return route.kind === 'home' ? route.title : pageTitle(route.title);
}

/** Breadcrumb trail for a static route. */
export function routeBreadcrumb(route) {
  if (route.kind === 'home') return [{ name: 'Home', path: '/' }];
  return [
    { name: 'Home', path: '/' },
    { name: route.heading || route.title, path: route.path },
  ];
}

/**
 * Foreign URL namespaces that must not compete with the authoritative ones.
 * Shopify's own `/collections/<handle>` handles map onto this site's top-level routes.
 */
export const COLLECTION_HANDLE_REDIRECTS = {
  frontpage: '/mens',
  mens: '/mens',
  womens: '/womens',
  accessories: '/accessories',
  'new-arrivals': '/new-arrivals',
  sale: '/sale',
  all: '/',
  'heart-chakra-collection': '/',
};
