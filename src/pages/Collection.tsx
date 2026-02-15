import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

interface CollectionPageProps {
  title: string;
  subtitle: string;
  /** If set, uses collectionByHandle query (exact Shopify parity). */
  collectionHandle?: string;
  /** Fallback: tag-based search query (used when no Shopify collection exists). */
  query?: string;
}

const collectionConfig: Record<string, CollectionPageProps> = {
  mens: { collectionHandle: 'frontpage', title: "Men's Collection", subtitle: 'For Him' },
  womens: { collectionHandle: 'womens', title: "Women's Collection", subtitle: 'For Her' },
  accessories: { collectionHandle: 'accessories', title: 'Accessories', subtitle: 'Complete the Look' },
};

interface Props {
  collection: keyof typeof collectionConfig;
}

const Collection = ({ collection }: Props) => {
  const config = collectionConfig[collection];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32">
        <ProductGrid
          title={config.title}
          subtitle={config.subtitle}
          limit={50}
          collectionHandle={config.collectionHandle}
          query={config.query}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
