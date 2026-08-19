import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoHead from '@/components/SeoHead';
import CompanyLinks from '@/components/info/CompanyLinks';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';

interface PageShellProps {
  /** Browser tab / metadata title */
  title: string;
  description: string;
  path: string;
  eyebrow?: string;
  heading: string;
  children: React.ReactNode;
  wide?: boolean;
}

const PageShell = ({
  title,
  description,
  path,
  eyebrow,
  heading,
  children,
  wide = false,
}: PageShellProps) => (
  <div className="min-h-screen bg-background">
    <SeoHead title={title} description={description} path={path} />
    <BreadcrumbJsonLd
      items={[
        { name: 'Home', url: `${SITE_URL}/` },
        { name: heading, url: `${SITE_URL}${path}` },
      ]}
    />
    <Header />
    <main className="pt-36 pb-24">
      <div className={`container mx-auto px-6 lg:px-12 ${wide ? 'max-w-4xl' : 'max-w-3xl'}`}>
        {eyebrow && (
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-10 leading-tight">
          {heading}
        </h1>
        {children}
        <CompanyLinks />
      </div>
    </main>
    <Footer />
  </div>
);

export default PageShell;
