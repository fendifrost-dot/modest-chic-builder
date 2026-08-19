import PageShell from '@/components/info/PageShell';
import {
  ENTITY_NAME,
  FOUNDER_DISPLAY,
  FOUNDER_ROLE,
  PRODUCT_CATEGORIES,
  SITE_CITY,
  SITE_EMAIL,
  SITE_FOUNDED,
  SITE_NAME,
} from '@/lib/site';

const Press = () => (
  <PageShell
    title={`${SITE_NAME} Press & Media`}
    description={`Press and media for Modest (${SITE_NAME}) — Chicago luxury streetwear founded ${SITE_FOUNDED}. Contact ${SITE_EMAIL}.`}
    path="/press"
    eyebrow="Media"
    heading="Press & Media"
  >
    <p className="text-cream/70 leading-relaxed mb-12">
      {ENTITY_NAME} ({SITE_NAME}) is an independent luxury streetwear house from {SITE_CITY}.
      For interviews, lookbooks, and collaboration inquiries, start here.
    </p>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl text-cream tracking-wider">Brand Facts</h2>
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-gold tracking-[0.2em] uppercase text-xs mb-1">Founded</dt>
          <dd className="text-cream/70">{SITE_FOUNDED}</dd>
        </div>
        <div>
          <dt className="text-gold tracking-[0.2em] uppercase text-xs mb-1">Category</dt>
          <dd className="text-cream/70">Luxury streetwear</dd>
        </div>
        <div>
          <dt className="text-gold tracking-[0.2em] uppercase text-xs mb-1">{FOUNDER_ROLE}</dt>
          <dd className="text-cream/70">{FOUNDER_DISPLAY}</dd>
        </div>
        <div>
          <dt className="text-gold tracking-[0.2em] uppercase text-xs mb-1">Based in</dt>
          <dd className="text-cream/70">{SITE_CITY}</dd>
        </div>
        <div>
          <dt className="text-gold tracking-[0.2em] uppercase text-xs mb-1">Product categories</dt>
          <dd className="text-cream/70">{PRODUCT_CATEGORIES.join(' · ')}</dd>
        </div>
      </dl>
    </section>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl text-cream tracking-wider">Media Assets</h2>
      <p className="text-cream/60 leading-relaxed">
        Logo files, campaign stills, product imagery, and a downloadable boilerplate will
        be listed here when they are cleared for press use. Until then, request assets
        directly so we send current files.
      </p>
    </section>

    <section className="space-y-3">
      <h2 className="font-display text-2xl text-cream tracking-wider">Press Contact</h2>
      <p className="text-cream/60 leading-relaxed">
        Email{' '}
        <a href={`mailto:${SITE_EMAIL}?subject=Press`} className="text-gold hover:underline">
          {SITE_EMAIL}
        </a>{' '}
        with the subject line “Press”.
      </p>
    </section>
  </PageShell>
);

export default Press;
