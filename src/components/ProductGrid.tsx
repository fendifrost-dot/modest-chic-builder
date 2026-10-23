import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCatalog, type CatalogMode, type CatalogProduct } from "@/lib/catalog";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { hasSelectableOptions } from "@/lib/variants";
import { CollectionJsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

interface ProductCardProps {
  product: CatalogProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const image = product.images?.[0];
  const price = product.priceRange.minVariantPrice;
  const firstVariant = product.variants?.[0];
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const needsOptions = hasSelectableOptions(product.options);

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!firstVariant) return;
    const ok = addItem({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      image: image?.url,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      printifyProductId: product.printifyProductId,
      printifyVariantId: firstVariant.printifyVariantId,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });
    if (ok) toast.success("Added to cart", { position: "top-center" });
    else toast.error("Could not add to cart. Please try again.", { position: "top-center" });
  };

  return (
    <Link to={`/product/${product.handle}`} className="group block">
      <div className="relative overflow-hidden aspect-[3/4] bg-charcoal">
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product.title}
            width={900}
            height={1200}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
          {needsOptions ? (
            <span className="text-cream text-xs tracking-[0.2em] uppercase border border-cream/40 px-6 py-2.5 bg-background/60 backdrop-blur-sm group-hover:bg-cream group-hover:text-obsidian transition-all duration-300">
              Select Options
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading || !firstVariant?.availableForSale}
              className="text-cream text-xs tracking-[0.2em] uppercase border border-cream/40 px-6 py-2.5 bg-background/60 backdrop-blur-sm hover:bg-cream hover:text-obsidian transition-all duration-300"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : firstVariant?.availableForSale ? "Add to Cart" : "Sold Out"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-cream text-sm tracking-wide group-hover:text-gold transition-colors duration-300">
          {product.title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}
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
  collection?: string;
  sortKey?: string;
  reverse?: boolean;
  jsonLdPath?: string;
  jsonLdDescription?: string;
  emptyMessage?: string;
}

const ProductGrid = ({
  title = "Shop Now",
  subtitle = "Featured",
  limit = 20,
  query,
  collection,
  sortKey,
  reverse,
  jsonLdPath,
  jsonLdDescription,
  emptyMessage = "No products found",
}: ProductGridProps) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [mode, setMode] = useState<CatalogMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchCatalog({
      limit,
      query,
      collection,
      sort: sortKey === "CREATED_AT" && reverse ? "created" : undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setProducts(result.products || []);
        setMode(result.mode);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit, query, collection, sortKey, reverse]);

  return (
    <section id="shop" className="py-24 bg-background scroll-mt-28">
      {jsonLdPath && !loading && (
        <CollectionJsonLd
          name={title}
          description={jsonLdDescription || `${title} from MOD#$T.`}
          url={absoluteUrl(jsonLdPath)}
          items={products.map((product) => ({
            name: product.title,
            url: absoluteUrl(`/product/${product.handle}`),
            image: product.images?.[0]?.url,
          }))}
        />
      )}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">{subtitle}</p>
          <h2 className="font-display text-5xl md:text-6xl text-cream">{title}</h2>
        </div>

        {mode === "preview" && !loading && (
          <p className="text-center text-cream/50 text-sm max-w-xl mx-auto mb-12 leading-relaxed">
            Preview assortment. Live products and prices load from Printify when the server has its catalog credentials. Checkout stays in test mode until Stripe is configured.
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : failed ? (
          <div className="text-center py-20 max-w-lg mx-auto">
            <p className="text-muted-foreground text-lg leading-relaxed">The catalog is unavailable right now.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 max-w-lg mx-auto">
            <p className="text-muted-foreground text-lg leading-relaxed">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14 stagger-children">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
