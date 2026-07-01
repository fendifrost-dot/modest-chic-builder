import { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MarqueeBanner from '@/components/MarqueeBanner';
import CollectionsSection from '@/components/CollectionsSection';
import ProductGrid from '@/components/ProductGrid';
import BrandStory from '@/components/BrandStory';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import WelcomeOfferModal from '@/components/WelcomeOfferModal';

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
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <ProductGrid title="Heart Chakra Collection" subtitle="Essentials" limit={10} query="id:8965877104817 OR id:8965878087857 OR id:8965883068593 OR id:8966533677233" />
        <CollectionsSection />
        <BrandStory />
        <Newsletter />
      </main>
      <Footer />
      <WelcomeOfferModal />
    </div>
  );
};

export default Index;
