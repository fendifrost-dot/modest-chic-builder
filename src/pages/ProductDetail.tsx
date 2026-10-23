import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductByHandle, type CatalogProduct } from "@/lib/catalog";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { trackViewItem } from "@/lib/analytics";
import { pageTitle, SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import {
  findVariantForOptionChange,
  isExactCombinationAvailable,
  isOptionValueInStock,
  visibleProductOptions,
  imagePathKey,
  guessColorHex,
  isColorOption,
  isSizeOption,
} from "@/lib/variants";
import { Loader2, ChevronLeft } from "lucide-react";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setLoadError(false);
    setProduct(null);
    setSelectedVariant(null);
    setSelectedImage(0);
    fetchProductByHandle(handle)
      .then((next) => {
        setProduct(next);
        const variants = next?.variants || [];
        const firstAvailable = variants.find((variant) => variant.availableForSale) || variants[0];
        if (firstAvailable) setSelectedVariant(firstAvailable.id);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [handle]);

  const variants = product?.variants || [];
  const currentVariant = variants.find((variant) => variant.id === selectedVariant);
  const images = product?.images || [];

  useEffect(() => {
    const gallery = product?.images || [];
    if (!currentVariant?.image?.url || gallery.length === 0) return;
    const variantKey = imagePathKey(currentVariant.image.url);
    const matchIndex = gallery.findIndex((image) => imagePathKey(image.url) === variantKey);
    if (matchIndex !== -1) setSelectedImage(matchIndex);
  }, [currentVariant, product]);

  useEffect(() => {
    if (!product || !currentVariant) return;
    trackViewItem({
      id: product.id,
      name: product.title,
      price: currentVariant.price.amount,
      currency: currentVariant.price.currencyCode,
    });
  }, [product, currentVariant]);

  const handleSelectOption = (optionName: string, value: string) => {
    const next = findVariantForOptionChange(variants, currentVariant, optionName, value);
    if (next) {
      setSelectedVariant(next.id);
      return;
    }
    toast.error("That option is not available", { position: "top-center" });
  };

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;
    const ok = addItem({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      image: images[selectedImage]?.url || images[0]?.url,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      printifyProductId: product.printifyProductId,
      printifyVariantId: currentVariant.printifyVariantId,
      price: currentVariant.price,
      quantity: 1,
      selectedOptions: currentVariant.selectedOptions || [],
    });
    if (ok) toast.success("Added to cart", { position: "top-center" });
    else toast.error("Could not add to cart. Please try again.", { position: "top-center" });
  };

  const seoDescription = product?.description || SITE_DESCRIPTION;
  const seoTitle = product ? pageTitle(product.title) : pageTitle("Product");
  const productPath = `/product/${product?.handle || handle || ""}`;
  const productImage = images[0]?.url;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SeoHead title={pageTitle("Loading")} description={SITE_DESCRIPTION} path={productPath} />
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
          title={pageTitle("Product Not Found")}
          description="This product is unavailable or the link may have changed."
          path={productPath}
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
  const price = currentVariant?.price || product.priceRange.minVariantPrice;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={seoTitle}
        description={seoDescription.slice(0, 160)}
        path={productPath}
        image={productImage}
        type="product"
      />
      <ProductJsonLd
        name={product.title}
        description={product.description || product.title}
        images={images.map((image) => image.url)}
        price={price.amount}
        currency={price.currencyCode}
        availability={Boolean(currentVariant?.availableForSale)}
        url={`${SITE_URL}/product/${product.handle}`}
        sku={currentVariant?.sku || currentVariant?.id}
        brand="Modest"
        variants={variants.map((variant) => ({
          name: `${product.title} — ${variant.title}`,
          sku: variant.sku || variant.id,
          price: variant.price.amount,
          currency: variant.price.currencyCode,
          availability: variant.availableForSale,
          color: variant.selectedOptions.find((option) => isColorOption(option.name))?.value,
          size: variant.selectedOptions.find((option) => isSizeOption(option.name))?.value,
          image: variant.image?.url,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Shop", url: `${SITE_URL}/#shop` },
          { name: product.title, url: `${SITE_URL}/product/${product.handle}` },
        ]}
      />
      <Header />
      <main className="pt-32 pb-24">
        <article className="container mx-auto px-6 lg:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm tracking-[0.15em] uppercase">Back to Shop</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="aspect-[3/4] bg-charcoal overflow-hidden mb-4">
                {images[selectedImage] && (
                  <img
                    src={images[selectedImage].url}
                    alt={images[selectedImage].alt || product.title}
                    width={1200}
                    height={1600}
                    className="w-full h-full object-cover"
                    decoding="async"
                  />
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1} of ${images.length}`}
                      aria-pressed={index === selectedImage}
                      className={`aspect-square bg-charcoal overflow-hidden border-2 transition-colors ${
                        index === selectedImage ? "border-gold" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || ""}
                        width={200}
                        height={200}
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
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">MOD#$T</p>
              <h1 className="font-display text-4xl lg:text-5xl text-cream mb-4">{product.title}</h1>
              <p className="text-gold text-2xl font-medium mb-8">
                ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
              </p>

              {optionGroups.map((option) => {
                const selectedValue = currentVariant?.selectedOptions?.find(
                  (entry) => entry.name.toLowerCase() === option.name.toLowerCase(),
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
                        <Link to="/size-guide" className="text-xs text-muted-foreground hover:text-gold tracking-wider uppercase">
                          Size guide
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2" role="listbox" aria-label={option.name}>
                      {option.values.map((value) => {
                        const exactExists = isExactCombinationAvailable(variants, currentVariant, option.name, value);
                        const inStock = isOptionValueInStock(variants, option.name, value);
                        const isSelected = selectedValue === value;
                        const swatch = colorOption ? guessColorHex(value) : null;

                        return (
                          <button
                            key={value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            aria-label={`${option.name} ${value}${!exactExists ? " — other options will update" : ""}${!inStock ? " — sold out" : ""}`}
                            disabled={!inStock && !exactExists}
                            onClick={() => handleSelectOption(option.name, value)}
                            className={`px-4 py-2 text-sm tracking-wider border transition-all duration-300 inline-flex items-center gap-2 ${
                              isSelected
                                ? "border-gold text-gold bg-gold/10"
                                : exactExists
                                  ? "border-border text-cream hover:border-gold/50"
                                  : "border-border/60 text-cream/50 hover:border-gold/40"
                            } ${!inStock ? "opacity-40" : ""}`}
                          >
                            {swatch && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-cream/30 shrink-0"
                                style={{ backgroundColor: swatch }}
                                aria-hidden="true"
                              />
                            )}
                            <span className={!exactExists && !isSelected ? "line-through decoration-cream/40" : undefined}>
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
                disabled={!currentVariant?.availableForSale || isLoading}
                className="btn-hero-primary mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : currentVariant?.availableForSale ? "Add to Cart" : "Sold Out"}
              </button>

              {product.description && (
                <div className="mt-10 pt-8 border-t border-border">
                  <h2 className="text-cream font-display text-xl tracking-wider mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
