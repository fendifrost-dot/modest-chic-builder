/**
 * Owner-editable store policies.
 *
 * Only fields with a string/number value are shown on /shipping and /returns.
 * Leave a field `null` to avoid publishing an unconfirmed number or rule.
 *
 * Homepage marquee currently markets free shipping over $200 — keep that
 * threshold here in sync if you confirm it in Shopify.
 */
export const SHIPPING_POLICY = {
  /** e.g. '1–3 business days' */
  processingTime: null as string | null,
  /** e.g. '5–7 business days' */
  domesticEstimate: null as string | null,
  /** e.g. 200 — shown only if set */
  freeShippingThresholdUsd: 200 as number | null,
  internationalOffered: 'checkout' as 'checkout' | 'yes' | 'no',
  trackingNote: 'A tracking link is emailed when an order ships.',
  lostPackageNote:
    'If a package is delayed or marked delivered but missing, contact us with your order number and we will help from there.',
  addressChangeNote:
    'Address changes are not always possible once an order is in fulfillment. Contact us as soon as you can with your order number.',
};

export const RETURNS_POLICY = {
  /** e.g. 14 — shown only if set */
  windowDays: null as number | null,
  condition:
    'Items generally need to be unworn, unwashed, and in original condition with tags attached when tags were included.',
  startHow:
    'Email us with your order number and whether you need a return or an exchange. We will confirm eligibility and next steps for that order.',
  exchangesNote:
    'Exchanges depend on availability. Tell us the size or item you want when you write in.',
  finalSaleNote:
    'Some items may be final sale. If that applies, it will be stated on the product or at checkout.',
  refundNote:
    'Refund timing depends on how the original order was paid and when the return is received. We confirm the path when the return is approved.',
  damagedNote:
    'If something arrives damaged or incorrect, photograph the issue and contact us with your order number. Do not wear the piece.',
};

export const CAREERS_COPY = {
  marketingEmploymentLabel: 'Internship',
  techPackEmploymentLabel: 'Contract, freelance, or part-time — confirmed with selected candidates',
  internCompensationCallout:
    'Internship structure: Educational objectives, schedule, school-credit considerations where applicable, responsibilities, and compensation structure are discussed with selected candidates.',
};
