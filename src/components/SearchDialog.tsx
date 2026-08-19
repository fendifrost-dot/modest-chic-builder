import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { fetchProducts, type ShopifyProduct } from '@/lib/shopify';

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetchProducts(20, term)
        .then((products) => {
          if (!cancelled) {
            setResults(products);
            setSearched(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
            setSearched(true);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[81] flex items-start justify-center p-4 pt-[15vh] pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          className="pointer-events-auto w-full max-w-xl bg-card border border-border shadow-luxury"
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tees, jackets, colors…"
              className="flex-1 bg-transparent py-4 text-cream placeholder:text-muted-foreground focus:outline-none text-sm"
              aria-label="Search products"
            />
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-cream p-2 min-w-11 min-h-11 flex items-center justify-center"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            )}

            {!loading && query.trim().length < 2 && (
              <p className="text-muted-foreground text-sm px-5 py-8 text-center">
                Type at least 2 characters to search the catalog.
              </p>
            )}

            {!loading && searched && results.length === 0 && (
              <p className="text-muted-foreground text-sm px-5 py-8 text-center">
                No products matched “{query.trim()}”.
              </p>
            )}

            {!loading && results.length > 0 && (
              <ul>
                {results.map((product) => {
                  const image = product.node.images?.edges?.[0]?.node;
                  const price = product.node.priceRange.minVariantPrice;
                  return (
                    <li key={product.node.id}>
                      <Link
                        to={`/product/${product.node.handle}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-secondary transition-colors"
                      >
                        <div className="w-14 h-16 bg-charcoal overflow-hidden shrink-0">
                          {image && (
                            <img
                              src={image.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-cream text-sm truncate">{product.node.title}</p>
                          <p className="text-gold text-xs mt-1">
                            ${parseFloat(price.amount).toFixed(2)} {price.currencyCode}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchDialog;
