import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: ShopifyProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { node } = product;
  const image = node.images?.edges?.[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const firstVariant = node.variants?.edges?.[0]?.node;
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
    toast.success('Added to cart', { position: 'top-center' });
  };

  return (
    <Link to={`/product/${node.handle}`} className="group block">
      <div className="relative overflow-hidden aspect-[3/4]">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
            No Image
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !firstVariant?.availableForSale}
            className="text-cream text-xs tracking-[0.2em] uppercase border border-cream/40 px-6 py-2.5 bg-background/60 backdrop-blur-sm hover:bg-cream hover:text-obsidian transition-all duration-300"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-cream text-sm tracking-wide group-hover:text-gold transition-colors duration-300">
          {node.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
        </p>
      </div>
    </Link>
  );
};

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  query?: string;
}

const ProductGrid = ({
  title = "Shop Now",
  subtitle = "Featured",
  limit = 20,
  query,
}: ProductGridProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(limit, query).then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [limit, query]);

  return (
    <section id="shop" className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">{subtitle}</p>
          <h2 className="font-display text-5xl md:text-6xl text-cream">{title}</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14 stagger-children">
            {products.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
