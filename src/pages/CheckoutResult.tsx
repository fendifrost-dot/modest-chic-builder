import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";
import { pageTitle } from "@/lib/site";
import { useCartStore } from "@/stores/cartStore";
import { callFunction } from "@/lib/functions";

interface SessionBody {
  id?: string;
  mode?: string;
  payment_status?: string;
  note?: string;
  customer_email?: string | null;
  source?: string;
}

const CheckoutResult = ({ status }: { status: "success" | "cancelled" }) => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);
  const [session, setSession] = useState<SessionBody | null>(null);

  useEffect(() => {
    if (status !== "success" || !sessionId) return;
    let cancelled = false;
    callFunction(`checkout/sessions/${encodeURIComponent(sessionId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled) setSession(body);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, status]);

  useEffect(() => {
    if (status === "success" && session && session.mode === "stripe" && session.payment_status === "paid" && session.source !== "preorder") {
      clearCart();
    }
  }, [status, session, clearCart]);

  const paid = session?.payment_status === "paid";
  const mock = session?.mode === "mock";
  const title = status === "success" ? "Order received" : "Checkout cancelled";

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={pageTitle(title)}
        description={status === "success" ? "Your MOD#$T checkout result." : "Checkout was cancelled before payment."}
        path={status === "success" ? "/checkout/success" : "/checkout/cancelled"}
        noindex
      />
      <Header />
      <main className="pt-40 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">Checkout</p>
          <h1 className="font-display text-5xl text-cream mb-6">{title}</h1>
          {status === "cancelled" ? (
            <p className="text-cream/70 leading-relaxed">No payment was taken. Your cart is still here whenever you are ready.</p>
          ) : mock ? (
            <p className="text-cream/70 leading-relaxed">
              {session?.note || "No payment was captured. Stripe is not configured on this server."}
            </p>
          ) : paid && session?.source === "preorder" ? (
            <p className="text-cream/70 leading-relaxed">
              Pre-order payment is confirmed. This piece is not in production yet and is not sent to Printify. Ship timing is the expected-ship note from the pre-order page. A receipt goes to {session?.customer_email || "your email"}.
            </p>
          ) : paid ? (
            <p className="text-cream/70 leading-relaxed">
              Payment is confirmed. Production is handed to Printify from the paid checkout webhook. A receipt goes to {session?.customer_email || "your email"}.
            </p>
          ) : (
            <p className="text-cream/70 leading-relaxed">
              If Stripe completed the payment, the receipt arrives by email. This page does not confirm a charge until the session is paid.
            </p>
          )}
          <Link to="/" className="inline-block mt-10 text-gold text-sm tracking-[0.2em] uppercase hover:underline">
            Back to the edit
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutResult;
