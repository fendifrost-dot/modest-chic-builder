import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { JsonLd } from '@/components/JsonLd';
import {
  ENTITY_ID,
  ENTITY_NAME,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site';

/**
 * FOUNDER DISCLOSURE LOG (Fendi observation period, 2026-08-19):
 * About page copy names Terrence Cleveland as founder/CEO/lead designer and
 * Fendi Frost as his artist name; states Modest has been part of Frost's
 * visual identity / music-video wardrobe since 2017. No Person JSON-LD, no
 * cross-domain sameAs, no "Discover Fendi Frost" outbound CTA.
 */
const About = () => (
  <PageShell
    title={`About Modest (${SITE_NAME}) | Chicago Luxury Streetwear`}
    description="Founded in Chicago in 2017, Modest (MOD#$T) is a high-end luxury streetwear brand led by CEO and lead designer Terrence Cleveland, also known as artist Fendi Frost."
    path="/about"
    heading={SITE_NAME}
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

    <p className="text-cream/70 text-lg md:text-xl leading-relaxed mb-6">
      Premium streetwear that speaks without shouting.
    </p>
    <p className="text-cream/60 leading-relaxed mb-4">
      Modest is a Chicago-born luxury streetwear brand built around material, detail, silhouette, and the belief that making a statement does not require making noise.
    </p>
    <p className="text-cream/60 leading-relaxed mb-10">
      Founded in September 2017, the brand creates elevated streetwear designed to live between luxury, culture, music, and everyday wear.
    </p>
    <Link to="/#shop" className="btn-hero-primary inline-flex mb-16">
      Shop {SITE_NAME}
    </Link>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl md:text-3xl text-cream tracking-wider">Our Story</h2>
      <p className="text-gold text-sm tracking-[0.2em] uppercase">Made in Chicago. Built from culture.</p>
      <p className="text-cream/60 leading-relaxed">
        Modest was founded in September 2017 by Terrence Cleveland, who serves as CEO and lead designer.
      </p>
      <p className="text-cream/60 leading-relaxed">
        Cleveland is also the Chicago artist, producer, and engineer known as Fendi Frost. Fashion and music have developed alongside each other throughout his creative career, and Modest grew from that same point of view: clothing is another language for identity, presentation, and culture.
      </p>
      <p className="text-cream/60 leading-relaxed">
        Since 2017, Modest has been part of the visual identity surrounding Fendi Frost’s music. He has worn pieces from the brand throughout his music-video work from that era to the present.
      </p>
      <p className="text-cream/60 leading-relaxed">
        The relationship is not a collaboration between two unrelated projects. The music and clothing come from the same creative perspective.
      </p>
    </section>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl md:text-3xl text-cream tracking-wider">What We Make</h2>
      <p className="text-gold text-sm tracking-[0.2em] uppercase">Luxury streetwear with substance.</p>
      <p className="text-cream/60 leading-relaxed">
        Modest creates high-end streetwear with an emphasis on pieces that can carry both presence and longevity.
      </p>
      <p className="text-cream/60 leading-relaxed">The collection includes:</p>
      <ul className="text-cream/60 text-sm space-y-2">
        <li>• Outerwear</li>
        <li>• Cashmere sweaters</li>
        <li>• Sweatshirts</li>
        <li>• T-shirts</li>
        <li>• Accessories</li>
      </ul>
      <p className="text-cream/60 leading-relaxed">
        The brand is also known for its distinctive rabbit-fur patch work and use of texture as part of the design language.
      </p>
    </section>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl md:text-3xl text-cream tracking-wider">Design Philosophy</h2>
      <p className="text-gold text-sm tracking-[0.2em] uppercase">The detail should speak before the logo has to.</p>
      <p className="text-cream/60 leading-relaxed">
        Modest is built around the idea that luxury can be expressive without being excessive.
      </p>
      <p className="text-cream/60 leading-relaxed">
        Fabric, texture, proportion, construction, and unexpected details carry the design. Some pieces communicate immediately. Others reveal themselves more slowly.
      </p>
      <p className="text-cream/60 leading-relaxed">
        The goal is not to chase every trend. It is to make clothing with enough identity to stand on its own.
      </p>
    </section>

    <section className="space-y-4 mb-12">
      <h2 className="font-display text-2xl md:text-3xl text-cream tracking-wider">Music × Fashion</h2>
      <p className="text-gold text-sm tracking-[0.2em] uppercase">One creative world.</p>
      <p className="text-cream/60 leading-relaxed">
        For founder and lead designer Terrence Cleveland, music and fashion have never been separate practices.
      </p>
      <p className="text-cream/60 leading-relaxed">
        As Fendi Frost, his catalog has repeatedly used fabric, clothing, luxury, and fashion as creative language. That relationship eventually developed into both Modest and a broader music-fashion identity.
      </p>
      <p className="text-cream/60 leading-relaxed">
        Today, {SITE_NAME} continues to operate at that intersection: Chicago street culture, luxury materials, independent design, music, and visual storytelling.
      </p>
    </section>

    <section className="space-y-4 mb-16">
      <h2 className="font-display text-2xl md:text-3xl text-cream tracking-wider">Founder</h2>
      <p className="text-cream text-lg">Terrence Cleveland</p>
      <p className="text-gold text-sm tracking-[0.15em] uppercase">Founder · CEO · Lead Designer</p>
      <p className="text-cream/60 leading-relaxed">
        Terrence Cleveland is a Chicago designer and creative entrepreneur and the artist known as Fendi Frost.
      </p>
      <p className="text-cream/60 leading-relaxed">
        He founded Modest in September 2017 and leads the brand’s design and creative direction.
      </p>
    </section>

    <div className="text-center space-y-6 py-8 border-t border-border">
      <p className="font-display text-3xl md:text-4xl text-cream tracking-wider">Be more. Say less.</p>
      <Link to="/#shop" className="btn-hero-primary inline-flex">
        Shop {SITE_NAME}
      </Link>
    </div>
  </PageShell>
);

export default About;
