import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { PRIVACY_CONTACT_EMAIL, PRIVACY_EFFECTIVE_DATE } from '@/lib/privacy';
import { ENTITY_NAME, LEGAL_ADDRESS, LEGAL_ENTITY_NAME, SITE_NAME, SITE_URL } from '@/lib/site';

const Terms = () => (
  <PageShell
    title={`Terms of Use | ${SITE_NAME}`}
    description={`Terms of use for Modest (${SITE_NAME}) at bemoremodest.com, operated by ${LEGAL_ENTITY_NAME}. Purchases are processed through Shopify checkout and Stripe. This page is a draft pending legal review.`}
    path="/terms"
    eyebrow="Legal"
    heading="Terms of Use"
  >
    <p className="text-cream/50 text-sm mb-4">Effective date: {PRIVACY_EFFECTIVE_DATE}</p>
    <p className="text-cream/50 text-sm mb-10">
      Draft for legal review. Governing-law jurisdiction, arbitration, and class-action waiver are not specified here and are not invented.
    </p>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Site use</h2>
      <p className="text-cream/60 leading-relaxed">
        By using {SITE_URL.replace('https://', '')} you agree to these terms. The site is offered by {LEGAL_ENTITY_NAME}, which operates {ENTITY_NAME} (stylized {SITE_NAME}), for browsing and purchasing products.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Purchases</h2>
      <p className="text-cream/60 leading-relaxed">
        Orders are placed through Shopify checkout. Card payments are processed by Stripe. A contract of sale is formed according to Shopify’s checkout flow and the payment you authorize there. We may refuse or cancel an order we believe is fraudulent, erroneous, or cannot be fulfilled.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Pricing and errors</h2>
      <p className="text-cream/60 leading-relaxed">
        Prices and promotions can change. If we discover an obvious pricing or listing error, we may cancel the affected order and notify you.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Product availability</h2>
      <p className="text-cream/60 leading-relaxed">
        Products are subject to availability. Sizes and colors that appear on a product page may not all be in stock.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Intellectual property</h2>
      <p className="text-cream/60 leading-relaxed">
        {SITE_NAME} branding, designs, text, and images on this site are owned by {LEGAL_ENTITY_NAME} or used with permission. You may not copy or exploit them without permission, except as allowed by law (for example fair use).
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">User submissions</h2>
      <p className="text-cream/60 leading-relaxed">
        If you send us a message, application, or other content, you grant {LEGAL_ENTITY_NAME} a non-exclusive right to use it to respond and operate the business. Do not send confidential designs you are not prepared to share.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Prohibited conduct</h2>
      <p className="text-cream/60 leading-relaxed">
        Do not misuse the site: no scraping that impairs service, no attempts to break checkout or accounts, no unlawful content in forms.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Third-party links</h2>
      <p className="text-cream/60 leading-relaxed">
        Links to Instagram, X, TikTok, Shopify accounts, or other sites are not under our control. Their terms and privacy practices apply there.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Disclaimers</h2>
      <p className="text-cream/60 leading-relaxed">
        The site is provided “as is.” We do not warrant uninterrupted or error-free operation.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Limitation of liability</h2>
      <p className="text-cream/60 leading-relaxed">
        To the fullest extent permitted by law, {LEGAL_ENTITY_NAME} is not liable for indirect, incidental, or consequential damages arising from use of the site. Some jurisdictions do not allow certain limitations; in those places our liability is limited to the maximum allowed.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Governing law</h2>
      <p className="text-cream/60 leading-relaxed">
        Owner / legal confirmation still required. These terms name the company and mailing address but do not name a governing jurisdiction, arbitration clause, or class-action waiver.
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Changes</h2>
      <p className="text-cream/60 leading-relaxed">
        We may update these terms. The effective date will change when we do.
      </p>
    </section>

    <section className="space-y-3">
      <h2 className="font-display text-2xl text-cream tracking-wider">Contact</h2>
      <p className="text-cream/60 leading-relaxed">
        {LEGAL_ENTITY_NAME}<br />
        {LEGAL_ADDRESS}<br />
        {PRIVACY_CONTACT_EMAIL}
      </p>
      <p className="text-cream/60 leading-relaxed">
        Shipping and returns processes are described on{' '}
        <Link to="/shipping" className="text-gold hover:underline">Shipping</Link>
        {' '}and{' '}
        <Link to="/returns" className="text-gold hover:underline">Returns</Link>.
      </p>
    </section>
  </PageShell>
);

export default Terms;
