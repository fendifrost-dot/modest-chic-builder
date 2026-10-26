import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AnalyticsProvider from "@/components/AnalyticsProvider";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collection = lazy(() => import("./pages/Collection"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const CheckoutResult = lazy(() => import("./pages/CheckoutResult"));
const WhatsToCome = lazy(() => import("./pages/WhatsToCome"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const infoRoutes = [
  'about', 'contact', 'shipping', 'returns', 'size-guide', 'faq',
  'privacy', 'terms', 'careers', 'press', 'sustainability',
] as const;

const AppContent = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/mens" element={<Collection collection="mens" />} />
      <Route path="/womens" element={<Collection collection="womens" />} />
      <Route path="/accessories" element={<Collection collection="accessories" />} />
      <Route path="/new-arrivals" element={<Collection collection="new-arrivals" />} />
      <Route path="/sale" element={<Collection collection="sale" />} />
      <Route path="/whats-to-come" element={<WhatsToCome />} />
      <Route path="/product/:handle" element={<ProductDetail />} />
      <Route path="/checkout/success" element={<CheckoutResult status="success" />} />
      <Route path="/checkout/cancelled" element={<CheckoutResult status="cancelled" />} />
      {infoRoutes.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
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
