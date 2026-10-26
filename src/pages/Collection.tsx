import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { pageTitle, SITE_URL } from "@/lib/site";

interface CollectionPageProps {
  title: string;
  subtitle: string;
  description: string;
  path: string;
  collection?: string;
  sortKey?: string;
  reverse?: boolean;
  emptyMessage?: string;
}

const collectionConfig: Record<string, CollectionPageProps> = {
  mens: {
    collection: "mens",
    title: "Men's Collection",
    subtitle: "For Him",
    path: "/mens",
    description: "Shop men's MOD#$T luxury streetwear — tees, knits, and limited drops from Chicago.",
  },
  womens: {
    collection: "womens",
    title: "Women's Collection",
    subtitle: "For Her",
    path: "/womens",
    description: "Shop women's MOD#$T streetwear — chakra tees and elevated essentials with a relaxed, modest fit.",
  },
  accessories: {
    collection: "accessories",
    title: "Accessories",
    subtitle: "Complete the Look",
    path: "/accessories",
    description: "MOD#$T accessories to complete the look — masks, extras, and limited add-ons from Be More Modest.",
  },
  "new-arrivals": {
    collection: "new-arrivals",
    title: "New Arrivals",
    subtitle: "Just Dropped",
    path: "/new-arrivals",
    sortKey: "CREATED_AT",
    reverse: true,
    description: "New MOD#$T arrivals — the latest limited-run streetwear drops from Be More Modest.",
  },
  sale: {
    collection: "sale",
    title: "Sale",
    subtitle: "Marked Down",
    path: "/sale",
    description: "MOD#$T pieces currently tagged for sale in the Printify catalog.",
    emptyMessage: "No marked-down pieces at the moment. New subscribers can still use WELCOME10 on Stripe Checkout.",
  },
};

interface Props {
  collection: keyof typeof collectionConfig;
}

const Collection = ({ collection }: Props) => {
  const config = collectionConfig[collection];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={pageTitle(config.title)} description={config.description} path={config.path} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: config.title, url: `${SITE_URL}${config.path}` },
        ]}
      />
      <Header />
      <main className="pt-32">
        <ProductGrid
          title={config.title}
          subtitle={config.subtitle}
          limit={50}
          collection={config.collection}
          sortKey={config.sortKey}
          reverse={config.reverse}
          jsonLdPath={config.path}
          jsonLdDescription={config.description}
          emptyMessage={config.emptyMessage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Collection;
