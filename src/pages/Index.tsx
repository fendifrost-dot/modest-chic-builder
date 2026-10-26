import { lazy, Suspense, useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MarqueeBanner from '@/components/MarqueeBanner';
import ProductGrid from '@/components/ProductGrid';
import SeoHead from '@/components/SeoHead';
import { pageTitle, SITE_DESCRIPTION } from '@/lib/site';

const Signature = lazy(() => import('@/components/Signature'));
const CollectionsSection = lazy(() => import('@/components/CollectionsSection'));
const PreorderSection = lazy(() => import('@/components/PreorderSection'));
const BrandStory = lazy(() => import('@/components/BrandStory'));
const Newsletter = lazy(() => import('@/components/Newsletter'));
const Footer = lazy(() => import('@/components/Footer'));
const WelcomeOfferModal = lazy(() => import('@/components/WelcomeOfferModal'));

const Index = () => {
  const [belowFold, setBelowFold] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  useEffect(() => {
    const start = () => setBelowFold(true);
    const idle = window.requestIdleCallback?.bind(window);
    if (idle) {
      const id = idle(start, { timeout: 1200 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(start, 300);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="min-h-screen">
      <SeoHead title={pageTitle()} description={SITE_DESCRIPTION} path="/" />
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <ProductGrid title="Heart Chakra Collection" subtitle="Essentials" limit={8} collection="featured" />
        {belowFold && (
          <Suspense fallback={null}>
            <Signature />
            <CollectionsSection />
            <PreorderSection />
            <BrandStory />
            <Newsletter />
          </Suspense>
        )}
      </main>
      {belowFold && (
        <Suspense fallback={null}>
          <Footer />
          <WelcomeOfferModal />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
