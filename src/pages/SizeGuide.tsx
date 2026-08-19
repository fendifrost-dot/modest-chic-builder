import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import HowToMeasure from '@/components/size-guide/HowToMeasure';
import { SITE_EMAIL, SITE_NAME } from '@/lib/site';

const SizeGuide = () => (
  <PageShell
    title={`Size Guide | ${SITE_NAME}`}
    description={`How to measure for Modest (${SITE_NAME}) outerwear, knitwear, and tees. Use the size options on each product page — we do not publish guessed garment specs.`}
    path="/size-guide"
    eyebrow="Find Your Fit"
    heading="Size Guide"
  >
    <p className="text-cream/60 leading-relaxed mb-10">
      {SITE_NAME} is cut for a relaxed, elevated streetwear fit. When in doubt, stay true to
      size for a cleaner line or size up for drape. Select sizes on the product page — some
      colors do not exist in every size.
    </p>

    <HowToMeasure />

    <p className="text-cream/50 text-sm mt-10 leading-relaxed">
      Need a recommendation? Email {SITE_EMAIL} with height, weight, and how you like pieces
      to sit.{' '}
      <Link to="/contact" className="text-gold hover:underline">Contact form</Link>.
    </p>
  </PageShell>
);

export default SizeGuide;
