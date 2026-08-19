import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { SITE_NAME } from '@/lib/site';

const futureTopics = [
  'Manufacturing partners',
  'Sourcing and material origins',
  'Packaging',
  'Repair and care',
  'Production quantities',
];

const Sustainability = () => (
  <PageShell
    title={`Materials, Production & Responsibility | ${SITE_NAME}`}
    description={`${SITE_NAME} values durability and long-term wear. We publish sourcing and production facts only when we can substantiate them.`}
    path="/sustainability"
    eyebrow="Responsibility"
    heading="Materials, Production & Responsibility"
  >
    <p className="text-cream/70 leading-relaxed mb-8">
      {SITE_NAME} values durability, thoughtful design, long-term wear, and responsible
      production decisions where they are actually feasible. We would rather say less than
      claim a certification, factory story, or material origin we cannot document.
    </p>
    <p className="text-cream/60 leading-relaxed mb-12">
      As the brand grows, we are documenting our sourcing, production, packaging, and
      material standards so we can communicate them accurately rather than make claims we
      cannot substantiate.
    </p>

    <section>
      <h2 className="font-display text-2xl text-cream tracking-wider mb-4">What we will add when verified</h2>
      <ul className="space-y-2 text-cream/60 text-sm">
        {futureTopics.map((topic) => (
          <li key={topic}>• {topic}</li>
        ))}
      </ul>
    </section>

    <p className="text-cream/50 text-sm mt-10">
      Care questions for a piece you already own:{' '}
      <Link to="/faq" className="text-gold hover:underline">see FAQs</Link>
      {' '}or{' '}
      <Link to="/contact" className="text-gold hover:underline">contact us</Link>.
    </p>
  </PageShell>
);

export default Sustainability;
