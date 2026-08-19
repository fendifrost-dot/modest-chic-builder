import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { pageTitle, SITE_DESCRIPTION, SITE_EMAIL } from '@/lib/site';

interface PageContent {
  title: string;
  subtitle?: string;
  sections: Array<{ heading?: string; body: string }>;
}

const pages: Record<string, PageContent> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Legal',
    sections: [
      {
        body: 'MOD#$T respects your privacy. We collect only the information needed to process orders, send updates you opt into, and improve your shopping experience.',
      },
      {
        heading: 'What We Collect',
        body: 'Name, email, shipping address, and payment details (processed securely by Shopify). Newsletter signups are managed through our email provider. Contact and careers forms open a message to our inbox and are not stored in this app.',
      },
      {
        heading: 'Your Rights',
        body: `You may request access to or deletion of your personal data by contacting ${SITE_EMAIL}.`,
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Legal',
    sections: [
      {
        body: 'By using bemoremodest.com, you agree to these terms. All products are subject to availability. Prices and promotions may change without notice.',
      },
      {
        heading: 'Orders & Payment',
        body: 'Orders are fulfilled through Shopify. Payment is charged at checkout. We reserve the right to cancel orders suspected of fraud.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All MOD#$T branding, designs, and content are protected. Unauthorized use is prohibited.',
      },
    ],
  },
};

interface Props {
  slug: keyof typeof pages;
}

const InfoPage = ({ slug }: Props) => {
  const page = pages[slug];

  if (!page) {
    return null;
  }

  const description = page.sections[0]?.body || SITE_DESCRIPTION;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={pageTitle(page.title)}
        description={description.slice(0, 160)}
        path={`/${slug}`}
      />
      <Header />
      <main className="pt-36 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          {page.subtitle && (
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">{page.subtitle}</p>
          )}
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-12">{page.title}</h1>

          <div className="space-y-8">
            {page.sections.map((section, index) => (
              <div key={index}>
                {section.heading && (
                  <h2 className="font-display text-xl text-cream tracking-wider mb-3">{section.heading}</h2>
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
