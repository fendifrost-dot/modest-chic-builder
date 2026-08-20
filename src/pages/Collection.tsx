import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import SeoHead from '@/components/SeoHead';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { pageTitle } from '@/lib/site';
import { COLLECTION_ROUTES } from '@/seo/routes.js';

interface Props {
  collection: keyof typeof COLLECTION_ROUTES;
}

/**
 * Collection/category route. All metadata comes from the shared route manifest
 * (`src/seo/routes.js`) so the rendered head matches the prerendered raw HTML.
 */
const Collection = ({ collection }: Props) => {
  const config = COLLECTION_ROUTES[collection];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={pageTitle(config.title)}
        description={config.description}
        path={config.path}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: config.heading, path: config.path },
        ]}
      />
      <Header />
      <main className="pt-32">
        <ProductGrid
          title={config.heading}
          subtitle={config.subtitle}
          limit={50}
          collectionHandle={config.collectionHandle}
          query={config.query}
          sortKey={config.sortKey}
          reverse={config.reverse}
          jsonLdPath={config.path}
          jsonLdName={config.heading}
          jsonLdDescription={config.description}
          intro={config.intro}
          emptyMessage={config.emptyMessage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
