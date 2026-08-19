/**
 * Privacy facts derived from this repo plus owner-confirmed operators.
 * Update this file when trackers or processors change.
 */
export const PRIVACY_EFFECTIVE_DATE = 'August 19, 2026';

/** Only public inbox. Casing in copy is info@bemoremodest.com. */
export const PRIVACY_CONTACT_EMAIL = 'info@bemoremodest.com';

export const TRACKERS = [
  {
    service: 'Shopify Storefront API + Shopify Checkout',
    purpose: 'Catalog, cart, checkout, shipping rates, order email, customer accounts',
    data: 'Cart contents, product views via API, checkout identity, shipping/billing',
    loadsBeforeConsent: true,
    storage: 'localStorage key `shopify-cart`; Shopify checkout cookies on the Shopify domain',
    disclosure: true,
    control: 'Necessary for purchasing. Account: modest-streetwear-apparel.myshopify.com/account',
  },
  {
    service: 'Stripe',
    purpose: 'Payment processing at Shopify checkout',
    data: 'Payment-card details and related transaction data — handled by Stripe, not by the Modest React storefront',
    loadsBeforeConsent: true,
    storage: 'Stripe / Shopify checkout cookies on the checkout domain',
    disclosure: true,
    control: 'Necessary to pay for an order',
  },
  {
    service: 'Mailchimp (audience signup)',
    purpose: 'Marketing email list (homepage newsletter, welcome offer)',
    data: 'Email address; Mailchimp may collect IP and signup metadata',
    loadsBeforeConsent: false,
    storage: 'Posted to Mailchimp on submit only',
    disclosure: true,
    control: '/email-preferences unsubscribe',
  },
  {
    service: 'Google Analytics 4 (optional)',
    purpose: 'Site usage analytics',
    data: 'Page path, title, device/browser, approximate location, product view events if configured',
    loadsBeforeConsent: true,
    storage: 'Google cookies (_ga and related) only if VITE_GA_MEASUREMENT_ID is set',
    disclosure: true,
    control: 'No on-site analytics toggle. Browser cookie controls. Script does not load if the ID is unset.',
  },
  {
    service: 'Meta Pixel (active)',
    purpose: 'Advertising measurement and retargeting',
    data: 'PageView, ViewContent, browser identifiers, IP / device data as collected by Meta',
    loadsBeforeConsent: true,
    storage: '_fbp / Meta cookies unless the visitor has opted out or sent Global Privacy Control',
    disclosure: true,
    control: '/privacy-choices Meta Pixel opt-out (this browser) and Global Privacy Control',
  },
  {
    service: 'Google Fonts',
    purpose: 'Display and body typography',
    data: 'IP address and user-agent to Google when fonts are fetched',
    loadsBeforeConsent: true,
    storage: 'Browser cache for font files',
    disclosure: true,
    control: 'None on-site',
  },
  {
    service: 'Lovable hosting / Lovable Cloud (Supabase)',
    purpose: 'Host the storefront; Cloud client is present but not used for catalog or checkout',
    data: 'Standard web-server logs; Supabase client may use localStorage if auth is invoked',
    loadsBeforeConsent: true,
    storage: 'Supabase auth localStorage keys if used',
    disclosure: true,
    control: 'Necessary for serving the site',
  },
  {
    service: 'Welcome-offer frequency cap',
    purpose: 'Avoid repeating the homepage popup',
    data: 'Timestamp only',
    loadsBeforeConsent: true,
    storage: 'localStorage `modest_welcome_dismissed`',
    disclosure: true,
    control: 'Clear site data in the browser',
  },
] as const;
