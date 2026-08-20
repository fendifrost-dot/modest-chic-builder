import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Collection from "./pages/Collection";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import {
  COLLECTION_ROUTES,
  INFO_ROUTES,
  COLLECTION_HANDLE_REDIRECTS,
  productPath,
} from "@/seo/routes.js";

const queryClient = new QueryClient();

const collectionSlugs = Object.keys(COLLECTION_ROUTES);
const infoSlugs = Object.keys(INFO_ROUTES);

/**
 * Shopify's own namespace is `/products/<handle>`; this storefront's authoritative
 * namespace is the singular `/product/<handle>`. Anything that lands on the plural
 * form is sent to the authoritative URL rather than being answered with content.
 * `public/_redirects` does the same at the edge with a 301 — this is the in-app
 * safety net for hosts that do not apply that file.
 */
const LegacyProductRedirect = () => {
  const { handle } = useParams<{ handle: string }>();
  return <Navigate to={productPath(handle || '')} replace />;
};

/** Shopify collection handles map onto this site's top-level category routes. */
const LegacyCollectionRedirect = () => {
  const { handle } = useParams<{ handle: string }>();
  return <Navigate to={COLLECTION_HANDLE_REDIRECTS[handle || ''] || '/'} replace />;
};

const AppContent = () => {
  useCartSync();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {collectionSlugs.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<Collection collection={slug} />} />
      ))}
      <Route path="/product/:handle" element={<ProductDetail />} />
      {infoSlugs.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
      ))}

      {/* Foreign namespaces — consolidated onto the authoritative URLs. */}
      <Route path="/products/:handle" element={<LegacyProductRedirect />} />
      <Route path="/products" element={<Navigate to="/new-arrivals" replace />} />
      <Route path="/collections/:handle" element={<LegacyCollectionRedirect />} />
      <Route path="/collections" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsProvider>
          <AppContent />
        </AnalyticsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
