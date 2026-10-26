import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { FaqJsonLd, WebPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { pageTitle } from '@/lib/site';
import { INFO_ROUTES } from '@/seo/routes.js';

interface Props {
  slug: keyof typeof INFO_ROUTES;
}

/**
 * Information route (About, Contact, FAQ, Size Guide, policies).
 * Copy and metadata both come from the shared route manifest, so the words a
 * crawler reads in the prerendered HTML are the words a browser renders.
 */
const InfoPage = ({ slug }: Props) => {
  const page = INFO_ROUTES[slug];

  if (!page) {
    return null;
  }

  const faqs =
    page.schemaType === 'FAQPage'
      ? page.sections
          .filter((section) => section.heading)
          .map((section) => ({ question: section.heading as string, answer: section.body }))
      : [];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={pageTitle(page.title)} description={page.description} path={page.path} />
      <WebPageJsonLd
        path={page.path}
        name={page.title}
        description={page.description}
        type={page.schemaType || 'WebPage'}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: page.heading, path: page.path },
        ]}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <Header />
      <main className="pt-36 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          {page.subtitle && (
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">{page.subtitle}</p>
          )}
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-12">{page.heading}</h1>

          <div className="space-y-8">
            {page.sections.map((section, index) => (
              <div key={index}>
                {section.heading && (
                  <h2 className="font-display text-xl text-cream tracking-wider mb-3">
                    {section.heading}
                  </h2>
                )}
                <p className="text-cream/60 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="inline-block mt-12 text-gold text-sm tracking-[0.2em] uppercase hover:underline"
          >
            ← Back to Shop
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
