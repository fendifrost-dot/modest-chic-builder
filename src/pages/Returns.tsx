import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { RETURNS_POLICY } from '@/lib/policies';
import { SITE_EMAIL, SITE_NAME } from '@/lib/site';

const Returns = () => (
  <PageShell
    title={`Returns & Exchanges | ${SITE_NAME}`}
    description={`Start a Modest (${SITE_NAME}) return or exchange by emailing ${SITE_EMAIL} with your order number. Eligibility is confirmed per order.`}
    path="/returns"
    eyebrow="Our Policy"
    heading="Returns & Exchanges"
  >
    <p className="text-cream/60 leading-relaxed mb-10">
      We want you to live in the piece. If something is wrong, write us — we confirm
      eligibility against the original order rather than posting a one-size rule that
      checkout might override.
    </p>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Eligibility</h2>
      <p className="text-cream/60 leading-relaxed">{RETURNS_POLICY.condition}</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Return Window</h2>
      <p className="text-cream/60 leading-relaxed">
        {RETURNS_POLICY.windowDays
          ? `Contact us within ${RETURNS_POLICY.windowDays} days of delivery.`
          : 'Ask as soon as you can. We will tell you whether the order still qualifies when we review it.'}
      </p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Condition Requirements</h2>
      <p className="text-cream/60 leading-relaxed">{RETURNS_POLICY.condition}</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Exchanges</h2>
      <p className="text-cream/60 leading-relaxed">{RETURNS_POLICY.exchangesNote}</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Final Sale</h2>
      <p className="text-cream/60 leading-relaxed">{RETURNS_POLICY.finalSaleNote}</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Refund Processing</h2>
      <p className="text-cream/60 leading-relaxed">{RETURNS_POLICY.refundNote}</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Damaged / Incorrect Items</h2>
      <p className="text-cream/60 leading-relaxed">{RETURNS_POLICY.damagedNote}</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">How to Start a Return</h2>
      <p className="text-cream/60 leading-relaxed">
        {RETURNS_POLICY.startHow}{' '}
        <Link to="/contact" className="text-gold hover:underline">Open the contact form</Link>
        {' '}or write {SITE_EMAIL}.
      </p>
    </section>
  </PageShell>
);

export default Returns;
