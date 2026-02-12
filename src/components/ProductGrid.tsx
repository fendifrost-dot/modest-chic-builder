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
    <Link to={`/product/${node.handle}`} className="product-card group block">
      <div className="relative overflow-hidden aspect-[3/4] bg-charcoal">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            className="product-card-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !firstVariant?.availableForSale}
            className="btn-hero px-8 py-3 text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-cream text-sm font-medium mb-2 group-hover:text-gold transition-colors duration-300">
          {node.title}
        </h3>
        <span className="text-cream font-medium">
          ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
        </span>
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
    <section id="shop" className="py-24 bg-charcoal">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 stagger-children">
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
