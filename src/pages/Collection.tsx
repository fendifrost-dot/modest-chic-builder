import Header from '@/components/Header';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

interface CollectionPageProps {
  tag: string;
  title: string;
  subtitle: string;
}

const collectionConfig: Record<string, CollectionPageProps> = {
  mens: { tag: 'mens', title: "Men's Collection", subtitle: 'For Him' },
  womens: { tag: 'womens', title: "Women's Collection", subtitle: 'For Her' },
  accessories: { tag: 'accessories', title: 'Accessories', subtitle: 'Complete the Look' },
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
          query={`tag:${config.tag}`}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
