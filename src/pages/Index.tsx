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
import SeoHead from '@/components/SeoHead';
import { WebPageJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { HOME_ROUTE } from '@/seo/routes.js';

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
      <SeoHead title={HOME_ROUTE.title} description={HOME_ROUTE.description} path="/" />
      <WebPageJsonLd
        path="/"
        name={HOME_ROUTE.title}
        description={HOME_ROUTE.description}
        type="WebPage"
      />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }]} />
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
