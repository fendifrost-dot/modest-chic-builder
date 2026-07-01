import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductByHandle } from '@/lib/shopify';
import type { ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { trackViewItem } from '@/lib/analytics';
import { Loader2, ChevronLeft } from 'lucide-react';

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProductByHandle(handle).then((p) => {
      setProduct(p);
      if (p?.variants?.edges?.[0]) {
        setSelectedVariant(p.variants.edges[0].node.id);
      }
      setLoading(false);
    });
  }, [handle]);

  const currentVariant = product?.variants?.edges?.find(v => v.node.id === selectedVariant)?.node;
  const images = product?.images?.edges || [];

  // Sync gallery image to selected variant's image
  useEffect(() => {
    if (!currentVariant?.image?.url || images.length === 0) return;
    const matchIndex = images.findIndex(img => img.node.url === currentVariant.image!.url);
    if (matchIndex !== -1 && matchIndex !== selectedImage) {
      setSelectedImage(matchIndex);
    }
  }, [selectedVariant, currentVariant, images, selectedImage]);

  useEffect(() => {
    if (!product || !currentVariant) return;
    trackViewItem({
      id: product.id,
      name: product.title,
      price: currentVariant.price.amount,
      currency: currentVariant.price.currencyCode,
    });
  }, [product?.id, currentVariant?.id]);

  const handleAddToCart = async () => {
    if (!product || !currentVariant) return;
    await addItem({
      product: { node: product },
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      price: currentVariant.price,
      quantity: 1,
      selectedOptions: currentVariant.selectedOptions || [],
    });
    toast.success('Added to cart', { position: 'top-center' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-32 text-cream">
          <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
          <Link to="/" className="text-gold hover:underline">Back to shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProductJsonLd
        name={product.title}
        description={product.description || product.title}
        images={images.map((img) => img.node.url)}
        price={currentVariant?.price?.amount || product.priceRange.minVariantPrice.amount}
        currency={currentVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode}
        availability={Boolean(currentVariant?.availableForSale)}
        url={`https://bemoremodest.com/product/${product.handle}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://bemoremodest.com/' },
          { name: product.title, url: `https://bemoremodest.com/product/${product.handle}` },
        ]}
      />
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm tracking-[0.15em] uppercase">Back to Shop</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div>
              <div className="aspect-[3/4] bg-charcoal overflow-hidden mb-4">
                {images[selectedImage] && (
                  <img
                    src={images[selectedImage].node.url}
                    alt={images[selectedImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                    decoding="async"
                  />
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square bg-charcoal overflow-hidden border-2 transition-colors ${
                        i === selectedImage ? 'border-gold' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.node.url}
                        alt={img.node.altText || ''}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="font-display text-4xl lg:text-5xl text-cream mb-4">{product.title}</h1>
              <p className="text-gold text-2xl font-medium mb-8">
                ${parseFloat(currentVariant?.price?.amount || product.priceRange.minVariantPrice.amount).toFixed(2)}{' '}
                {currentVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode}
              </p>

              {/* Options */}
              {product.options?.filter(o => o.name !== 'Title').map((option) => (
                <div key={option.name} className="mb-6">
                  <label className="text-cream text-sm tracking-[0.15em] uppercase mb-3 block">{option.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      // Build desired options: current selections with this option replaced
                      const desiredOptions = (currentVariant?.selectedOptions || []).map(o =>
                        o.name === option.name ? { ...o, value } : o
                      );
                      const matchingVariant = product.variants.edges.find(v =>
                        desiredOptions.every(desired =>
                          v.node.selectedOptions.some(o => o.name === desired.name && o.value === desired.value)
                        )
                      );
                      const isSelected = currentVariant?.selectedOptions?.some(o => o.name === option.name && o.value === value);
                      return (
                        <button
                          key={value}
                          onClick={() => matchingVariant && setSelectedVariant(matchingVariant.node.id)}
                          className={`px-4 py-2 text-sm tracking-wider border transition-all duration-300 ${
                            isSelected
                              ? 'border-gold text-gold bg-gold/10'
                              : 'border-border text-cream hover:border-gold/50'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddToCart}
                disabled={!currentVariant?.availableForSale || isCartLoading}
                className="btn-hero-primary mt-4 flex items-center justify-center gap-2"
              >
                {isCartLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentVariant?.availableForSale ? (
                  'Add to Cart'
                ) : (
                  'Sold Out'
                )}
              </button>

              {product.description && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="text-cream font-display text-xl tracking-wider mb-4">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
