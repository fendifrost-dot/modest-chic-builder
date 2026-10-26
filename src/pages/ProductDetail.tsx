import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductByHandle } from '@/lib/shopify';
import type { ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SeoHead from '@/components/SeoHead';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { trackViewItem } from '@/lib/analytics';
import { pageTitle, SITE_DESCRIPTION } from '@/lib/site';
import { productPath } from '@/seo/routes.js';
import { materialFromTags } from '@/seo/schema.js';
import { machineDescription, clampDescription } from '@/seo/product-meta.js';
import {
  findVariantForOptionChange,
  isExactCombinationAvailable,
  isOptionValueInStock,
  visibleProductOptions,
  imagePathKey,
  guessColorHex,
  isColorOption,
  isSizeOption,
} from '@/lib/variants';
import { Loader2, ChevronLeft } from 'lucide-react';

type ProductNode = ShopifyProduct['node'];

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setLoadError(false);
    setProduct(null);
    setSelectedVariant(null);
    setSelectedImage(0);
    fetchProductByHandle(handle)
      .then((p) => {
        setProduct(p);
        const variants = p?.variants?.edges || [];
        const firstAvailable = variants.find((v) => v.node.availableForSale) || variants[0];
        if (firstAvailable) {
          setSelectedVariant(firstAvailable.node.id);
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [handle]);

  const variants = (product?.variants?.edges || []).map((edge) => edge.node);
  const currentVariant = variants.find((v) => v.id === selectedVariant);
  const images = product?.images?.edges || [];

  useEffect(() => {
    if (!currentVariant?.image?.url || images.length === 0) return;
    const variantKey = imagePathKey(currentVariant.image.url);
    const matchIndex = images.findIndex((img) => imagePathKey(img.node.url) === variantKey);
    if (matchIndex !== -1) {
      setSelectedImage(matchIndex);
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (!product || !currentVariant) return;
    trackViewItem({
      id: product.id,
      name: product.title,
      price: currentVariant.price.amount,
      currency: currentVariant.price.currencyCode,
    });
  }, [product?.id, currentVariant?.id]);

  const handleSelectOption = (optionName: string, value: string) => {
    const next = findVariantForOptionChange(variants, currentVariant, optionName, value);
    if (next) {
      setSelectedVariant(next.id);
      return;
    }
    toast.error('That option is not available', { position: 'top-center' });
  };

  const handleAddToCart = async () => {
    if (!product || !currentVariant) return;
    const ok = await addItem({
      product: { node: product },
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      price: currentVariant.price,
      quantity: 1,
      selectedOptions: currentVariant.selectedOptions || [],
    });
    if (ok) {
      toast.success('Added to cart', { position: 'top-center' });
    } else {
      toast.error('Could not add to cart. Please try again.', { position: 'top-center' });
    }
  };

  // Same derivation the prerenderer uses, so the rendered head matches the raw HTML.
  const seoDescription = product
    ? machineDescription({
        title: product.title,
        productType: product.productType,
        price: product.priceRange?.minVariantPrice?.amount,
        currency: product.priceRange?.minVariantPrice?.currencyCode,
        description: product.description,
        seoDescription: product.seo?.description,
      }).text
    : SITE_DESCRIPTION;
  const seoTitle = product
    ? pageTitle(product.seo?.title || product.title)
    : pageTitle('Product');
  const path = productPath(product?.handle || handle || '');
  const productImage = images[0]?.node.url;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SeoHead title={pageTitle('Loading')} description={SITE_DESCRIPTION} path={path} />
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product || loadError) {
    return (
      <div className="min-h-screen bg-background">
        <SeoHead
          title={pageTitle('Product Not Found')}
          description="This product is unavailable or the link may have changed."
          path={path}
          noindex
        />
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] pt-32 text-cream">
          <h1 className="font-display text-4xl mb-4">Product Not Found</h1>
          <Link to="/" className="text-gold hover:underline">Back to shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const optionGroups = visibleProductOptions(product.options);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={seoTitle}
        description={clampDescription(seoDescription)}
        path={path}
        image={productImage}
        type="product"
      />
      <ProductJsonLd
        path={path}
        name={product.title}
        description={seoDescription}
        images={images.map((img) => img.node.url)}
        price={currentVariant?.price?.amount || product.priceRange.minVariantPrice.amount}
        currency={currentVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode}
        availability={Boolean(currentVariant?.availableForSale)}
        sku={currentVariant?.sku || undefined}
        material={materialFromTags(product.tags)}
        variants={variants.map((variant) => ({
          name: `${product.title} — ${variant.title}`,
          sku: variant.sku || undefined,
          price: variant.price.amount,
          currency: variant.price.currencyCode,
          availability: variant.availableForSale,
          color: variant.selectedOptions.find((o) => isColorOption(o.name))?.value,
          size: variant.selectedOptions.find((o) => isSizeOption(o.name))?.value,
          image: variant.image?.url,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: product.title, path },
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
                      key={img.node.url}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      aria-label={`View image ${i + 1} of ${images.length}`}
                      aria-pressed={i === selectedImage}
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

            <div className="flex flex-col">
              <h1 className="font-display text-4xl lg:text-5xl text-cream mb-4">{product.title}</h1>
              <p className="text-gold text-2xl font-medium mb-8">
                ${parseFloat(currentVariant?.price?.amount || product.priceRange.minVariantPrice.amount).toFixed(2)}{' '}
                {currentVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode}
              </p>

              {optionGroups.map((option) => {
                const selectedValue = currentVariant?.selectedOptions?.find(
                  (o) => o.name.toLowerCase() === option.name.toLowerCase(),
                )?.value;
                const colorOption = isColorOption(option.name);

                return (
                  <div key={option.name} className="mb-6">
                    <div className="flex items-baseline justify-between mb-3">
                      <label className="text-cream text-sm tracking-[0.15em] uppercase">
                        {option.name}
                        {selectedValue ? <span className="text-gold ml-2 tracking-normal">{selectedValue}</span> : null}
                      </label>
                      {isSizeOption(option.name) && (
                        <Link
                          to="/size-guide"
                          className="text-xs text-muted-foreground hover:text-gold tracking-wider uppercase"
                        >
                          Size guide
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2" role="listbox" aria-label={option.name}>
                      {option.values.map((value) => {
                        const exactExists = isExactCombinationAvailable(
                          variants,
                          currentVariant,
                          option.name,
                          value,
                        );
                        const inStock = isOptionValueInStock(variants, option.name, value);
                        const isSelected = selectedValue === value;
                        const swatch = colorOption ? guessColorHex(value) : null;

                        return (
                          <button
                            key={value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            aria-label={`${option.name} ${value}${!exactExists ? ' — other options will update' : ''}${!inStock ? ' — sold out' : ''}`}
                            disabled={!inStock && !exactExists}
                            onClick={() => handleSelectOption(option.name, value)}
                            className={`px-4 py-2 text-sm tracking-wider border transition-all duration-300 inline-flex items-center gap-2 ${
                              isSelected
                                ? 'border-gold text-gold bg-gold/10'
                                : exactExists
                                  ? 'border-border text-cream hover:border-gold/50'
                                  : 'border-border/60 text-cream/50 hover:border-gold/40'
                            } ${!inStock ? 'opacity-40' : ''}`}
                          >
                            {swatch && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-cream/30 shrink-0"
                                style={{ backgroundColor: swatch }}
                                aria-hidden="true"
                              />
                            )}
                            <span className={!exactExists && !isSelected ? 'line-through decoration-cream/40' : undefined}>
                              {value}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
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
