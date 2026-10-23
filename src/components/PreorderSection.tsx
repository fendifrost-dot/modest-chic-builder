import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface PreorderImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PreorderPiece {
  id: string;
  handle: string;
  title: string;
  colorway: string;
  summary: string;
  expectedShip: string;
  priceCents: number | null;
  currency: string;
  image: string;
  images: PreorderImage[];
  purchasable: boolean;
}

interface PreorderResponse {
  items: PreorderPiece[];
  awaitingFounder: boolean;
}

const money = (cents: number, currency: string) =>
  `${(cents / 100).toFixed(2)} ${currency}`;

const PreorderSection = ({ heading = "h2" }: { heading?: "h1" | "h2" }) => {
  const [data, setData] = useState<PreorderResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const Title = heading;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/preorders")
      .then((response) => {
        if (!response.ok) throw new Error("unavailable");
        return response.json();
      })
      .then((body) => {
        if (!cancelled) setData(body);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const preorder = async (id: string) => {
    setPendingId(id);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "preorder", items: [{ id, quantity: 1 }] }),
      });
      const body = await response.json();
      if (!response.ok || !body.url) {
        toast.error(body.error || "Pre-order checkout is unavailable.", { position: "top-center" });
        return;
      }
      window.location.assign(body.url);
    } catch {
      toast.error("Pre-order checkout is unavailable.", { position: "top-center" });
    } finally {
      setPendingId(null);
    }
  };

  const concepts = data?.items ?? [];

  return (
    <section id="whats-to-come" className="py-24 bg-background scroll-mt-28" aria-labelledby="preorder-heading">
      <div className="container mx-auto px-6 lg:px-12">
        <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">Separate from the shop</p>
        <Title id="preorder-heading" className="font-display text-5xl md:text-6xl text-cream mb-6">
          What's to Come
        </Title>
        <p className="text-cream/60 max-w-2xl leading-relaxed mb-12">
          Pre-order pieces that are not produced yet and are not in the Printify catalog. Concepts stay visible while the name, price, and ship date are still placeholders. An open piece is labeled Pre-order and carries the expected-ship note the Founder wrote.
        </p>

        {failed && <p className="text-muted-foreground">The pre-order list is unavailable right now.</p>}
        {!failed && !data && <Loader2 className="w-6 h-6 animate-spin text-gold" aria-label="Loading pre-orders" />}

        {data?.awaitingFounder && concepts.length === 0 && (
          <div className="border border-border p-8 max-w-2xl">
            <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">Pre-order</p>
            <p className="text-cream/70 leading-relaxed">
              No upcoming piece is open for pre-order. The Founder adds each one in the pre-order list, including its price and expected-ship message. The shop stays the Printify catalog.
            </p>
          </div>
        )}

        {data?.awaitingFounder && concepts.length > 0 && (
          <p className="text-cream/70 max-w-2xl leading-relaxed mb-10">
            None of these pieces is open for pre-order. Names, prices, and ship dates stay blank until the Founder sets them. The shop stays the Printify catalog.
          </p>
        )}

        {concepts.length > 0 && (
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {concepts.map((piece) => {
              const gallery = piece.images?.length ? piece.images : piece.image ? [{ src: piece.image, alt: piece.summary, width: 1200, height: 1600 }] : [];
              const noteId = `${piece.id}-preorder-note`;
              return (
                <li key={piece.id} className="border border-border">
                  {gallery.length > 0 ? (
                    <div className={gallery.length > 1 ? "grid grid-cols-2" : "grid grid-cols-1"}>
                      {gallery.map((image) => (
                        <img
                          key={image.src}
                          src={image.src}
                          alt={image.alt}
                          width={image.width}
                          height={image.height}
                          className="w-full aspect-[3/4] object-cover bg-charcoal"
                          loading="lazy"
                          decoding="async"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-charcoal flex items-end p-6">
                      <span className="text-cream/40 text-xs tracking-[0.3em] uppercase">Pre-order</span>
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">Pre-order</p>
                    {piece.colorway && (
                      <p className="text-cream/80 text-sm tracking-[0.18em] uppercase mb-3">{piece.colorway}</p>
                    )}
                    {piece.title ? (
                      <h3 className="font-display text-3xl text-cream mb-3">{piece.title}</h3>
                    ) : (
                      <h3 className="text-lg text-cream/45 mb-3">Name to be set</h3>
                    )}
                    {piece.summary && <p className="text-cream/60 leading-relaxed mb-4">{piece.summary}</p>}
                    <p className="text-cream text-sm mb-2">
                      {piece.expectedShip ? `Expected ship: ${piece.expectedShip}` : "Ship date to be set"}
                    </p>
                    <p className="text-gold mb-6">
                      {piece.purchasable && piece.priceCents != null && piece.priceCents > 0
                        ? money(piece.priceCents, piece.currency)
                        : "Price to be set"}
                    </p>
                    {!piece.purchasable && (
                      <p id={noteId} className="text-cream/45 text-xs leading-relaxed mb-4">
                        Name, price, and ship date are still placeholders.
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn-hero-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gold disabled:hover:text-obsidian"
                      onClick={() => preorder(piece.id)}
                      disabled={!piece.purchasable || pendingId === piece.id}
                      aria-describedby={piece.purchasable ? undefined : noteId}
                    >
                      {piece.purchasable && pendingId === piece.id ? "Sending…" : "Pre-order"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {heading === "h2" && (
          <Link to="/whats-to-come" className="inline-block mt-10 text-gold text-sm tracking-[0.2em] uppercase hover:underline">
            Pre-order page
          </Link>
        )}
      </div>
    </section>
  );
};

export default PreorderSection;
