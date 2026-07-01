import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Collection from "./pages/Collection";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const infoRoutes = [
  'about', 'contact', 'shipping', 'returns', 'size-guide', 'faq',
  'privacy', 'terms', 'careers', 'press', 'sustainability',
] as const;

const AppContent = () => {
  useCartSync();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/mens" element={<Collection collection="mens" />} />
      <Route path="/womens" element={<Collection collection="womens" />} />
      <Route path="/accessories" element={<Collection collection="accessories" />} />
      <Route path="/new-arrivals" element={<Collection collection="new-arrivals" />} />
      <Route path="/sale" element={<Collection collection="sale" />} />
      <Route path="/product/:handle" element={<ProductDetail />} />
      {infoRoutes.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<InfoPage slug={slug} />} />
      ))}
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
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
