import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { JsonLd } from '@/components/JsonLd';
import {
  ENTITY_ID,
  ENTITY_NAME,
  FOUNDER_DISPLAY,
  FOUNDER_ROLE,
  PRODUCT_CATEGORIES,
  SITE_CITY,
  SITE_FOUNDED,
  SITE_FOUNDED_YEAR,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site';

/**
 * FOUNDER DISCLOSURE LOG (Fendi observation period, 2026-08-19):
 * Visible copy only: Modest founded in Chicago, September 2017, by
 * Terrence Cleveland / Fendi Frost (founder, CEO, lead designer); Frost
 * has worn Modest in visual work since 2017. No Person JSON-LD, no
 * cross-domain sameAs, no Fendi Frost entity campaign.
 */
const About = () => (
  <PageShell
    title={`About Modest (${SITE_NAME}) | Chicago Luxury Streetwear`}
    description={`Modest (${SITE_NAME}) is Chicago luxury streetwear founded ${SITE_FOUNDED} by ${FOUNDER_DISPLAY}. Outerwear, cashmere, tees, and accessories — luxury without the noise.`}
    path="/about"
    eyebrow="Our Story"
    heading={`${SITE_NAME} — Luxury Streetwear Without the Noise`}
  >
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About ${ENTITY_NAME}`,
        url: `${SITE_URL}/about`,
        mainEntity: { '@id': ENTITY_ID },
      }}
    />

    <p className="text-cream/70 text-lg md:text-xl leading-relaxed mb-12">
      Premium streetwear that speaks without shouting.
    </p>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl text-cream tracking-wider">Our Story</h2>
      <p className="text-cream/60 leading-relaxed">
        {ENTITY_NAME} was founded in {SITE_CITY} in {SITE_FOUNDED} around a simple idea:
        luxury and restraint can live in the same garment. The house presents as {SITE_NAME} —
        high-end luxury streetwear for people who would rather be recognized by construction
        than by a shout.
      </p>
      <p className="text-cream/60 leading-relaxed">
        {FOUNDER_DISPLAY} is {FOUNDER_ROLE.toLowerCase()}. The work has stayed independent:
        outerwear, cashmere sweaters, sweatshirts, T-shirts, and accessories, often marked by
        rabbit-fur patch work and other signature details.
      </p>
    </section>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl text-cream tracking-wider">Design Philosophy</h2>
      <p className="text-cream/60 leading-relaxed">
        Pieces are built around material, construction, silhouette, and texture. The aim is an
        understated statement — coats and jackets that hold a line, cashmere that reads quiet
        up close, graphics that do not need to explain themselves.
      </p>
      <ul className="text-cream/60 text-sm space-y-2 tracking-wide">
        {PRODUCT_CATEGORIES.map((category) => (
          <li key={category} className="flex gap-3">
            <span className="text-gold" aria-hidden="true">★</span>
            {category}
          </li>
        ))}
      </ul>
    </section>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl text-cream tracking-wider">Music + Culture</h2>
      <p className="text-cream/60 leading-relaxed">
        Since {SITE_FOUNDED_YEAR}, founder and lead designer Fendi Frost has worn Modest
        throughout his visual work. The clothes and the catalog grew in the same room — not as
        merch bolted onto a career, but as the wardrobe of the work itself.
      </p>
    </section>

    <Link to="/#shop" className="btn-hero-primary inline-flex">
      Shop {SITE_NAME}
    </Link>
  </PageShell>
);

export default About;
