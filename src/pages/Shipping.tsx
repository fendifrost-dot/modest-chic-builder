import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { SHIPPING_POLICY } from '@/lib/policies';
import { SITE_EMAIL, SITE_NAME } from '@/lib/site';

const Shipping = () => (
  <PageShell
    title={`Shipping Info | ${SITE_NAME}`}
    description={`How Modest (${SITE_NAME}) ships. Processing, tracking, and delivery details are confirmed at Shopify checkout.`}
    path="/shipping"
    eyebrow="Delivery"
    heading="Shipping Info"
  >
    <p className="text-cream/60 leading-relaxed mb-10">
      Checkout is hosted by Shopify. Carrier, rate, and delivery window for your order are
      calculated there — we do not invent a timeline on this page that checkout might contradict.
    </p>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Order Processing</h2>
      <p className="text-cream/60 leading-relaxed">
        {SHIPPING_POLICY.processingTime
          ? `Orders are typically processed within ${SHIPPING_POLICY.processingTime}.`
          : 'Orders enter fulfillment after payment clears. Processing time is confirmed in your order email and can vary by item.'}
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Domestic Shipping</h2>
      <p className="text-cream/60 leading-relaxed">
        We ship within the United States.
        {SHIPPING_POLICY.domesticEstimate
          ? ` Standard delivery is often ${SHIPPING_POLICY.domesticEstimate}.`
          : ' The carrier and estimated arrival date appear at checkout.'}
        {SHIPPING_POLICY.freeShippingThresholdUsd
          ? ` Complimentary shipping is offered on qualifying U.S. orders over $${SHIPPING_POLICY.freeShippingThresholdUsd}.`
          : ''}
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">International Shipping</h2>
      <p className="text-cream/60 leading-relaxed">
        If an international option is available for your address, rates and delivery times
        are shown at checkout. Customs, duties, and import taxes — if charged — are the
        recipient’s responsibility unless checkout states otherwise.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Tracking</h2>
      <p className="text-cream/60 leading-relaxed">{SHIPPING_POLICY.trackingNote}</p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Lost / Delayed Packages</h2>
      <p className="text-cream/60 leading-relaxed">{SHIPPING_POLICY.lostPackageNote}</p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Address Changes</h2>
      <p className="text-cream/60 leading-relaxed">{SHIPPING_POLICY.addressChangeNote}</p>
    </section>

    <p className="text-cream/50 text-sm">
      Questions:{' '}
      <Link to="/contact" className="text-gold hover:underline">contact us</Link>
      {' '}or {SITE_EMAIL}.
    </p>
  </PageShell>
);

export default Shipping;
