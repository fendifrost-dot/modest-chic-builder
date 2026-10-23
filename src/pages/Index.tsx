import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MarqueeBanner from '@/components/MarqueeBanner';
import CollectionsSection from '@/components/CollectionsSection';
import ProductGrid from '@/components/ProductGrid';
import Signature from '@/components/Signature';
import PreorderSection from '@/components/PreorderSection';
import BrandStory from '@/components/BrandStory';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import WelcomeOfferModal from '@/components/WelcomeOfferModal';
import SeoHead from '@/components/SeoHead';
import { pageTitle, SITE_DESCRIPTION } from '@/lib/site';

const Index = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={pageTitle()} description={SITE_DESCRIPTION} path="/" />
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <ProductGrid title="Heart Chakra Collection" subtitle="Essentials" limit={8} collection="featured" />
        <Signature />
        <CollectionsSection />
        <PreorderSection />
        <BrandStory />
        <Newsletter />
      </main>
      <Footer />
      <WelcomeOfferModal />
    </div>
  );
};

export default Index;
