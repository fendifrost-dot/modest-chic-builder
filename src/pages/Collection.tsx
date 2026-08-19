import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import SeoHead from '@/components/SeoHead';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { pageTitle, SITE_URL } from '@/lib/site';

interface CollectionPageProps {
  title: string;
  subtitle: string;
  description: string;
  path: string;
  /** If set, uses collectionByHandle query (exact Shopify parity). */
  collectionHandle?: string;
  /** Fallback: tag-based search query (used when no Shopify collection exists). */
  query?: string;
  /** Sort key for products query (e.g. CREATED_AT). */
  sortKey?: string;
  /** Reverse sort order. */
  reverse?: boolean;
}

const collectionConfig: Record<string, CollectionPageProps> = {
  mens: {
    collectionHandle: 'frontpage',
    title: "Men's Collection",
    subtitle: 'For Him',
    path: '/mens',
    description: "Shop men's MOD#$T luxury streetwear — cashmere sweaters, varsity jackets, tees, and limited drops crafted in Los Angeles.",
  },
  womens: {
    collectionHandle: 'womens',
    title: "Women's Collection",
    subtitle: 'For Her',
    path: '/womens',
    description: "Shop women's MOD#$T streetwear — chakra tees, bombers, and elevated essentials with a relaxed, modest fit.",
  },
  accessories: {
    collectionHandle: 'accessories',
    title: 'Accessories',
    subtitle: 'Complete the Look',
    path: '/accessories',
    description: 'MOD#$T accessories to complete the look — ski masks, extras, and limited add-ons from Be More Modest.',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    subtitle: 'Just Dropped',
    path: '/new-arrivals',
    sortKey: 'CREATED_AT',
    reverse: true,
    description: 'New MOD#$T arrivals — the latest limited-run streetwear drops from Be More Modest.',
  },
  sale: {
    title: 'Sale',
    subtitle: 'Limited Time',
    path: '/sale',
    query: 'tag:sale OR tag:Sale',
    sortKey: 'CREATED_AT',
    reverse: true,
    description: 'Shop the MOD#$T sale — limited-time savings on luxury streetwear at checkout.',
  },
};

interface Props {
  collection: keyof typeof collectionConfig;
}

const Collection = ({ collection }: Props) => {
  const config = collectionConfig[collection];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={pageTitle(config.title)}
        description={config.description}
        path={config.path}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: `${SITE_URL}/` },
          { name: config.title, url: `${SITE_URL}${config.path}` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <ProductGrid
          title={config.title}
          subtitle={config.subtitle}
          limit={50}
          collectionHandle={config.collectionHandle}
          query={config.query}
          sortKey={config.sortKey}
          reverse={config.reverse}
          jsonLdPath={config.path}
          jsonLdDescription={config.description}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
