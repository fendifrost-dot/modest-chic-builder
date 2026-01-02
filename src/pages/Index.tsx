import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import MarqueeBanner from '@/components/MarqueeBanner';
import CollectionsSection from '@/components/CollectionsSection';
import ProductGrid from '@/components/ProductGrid';
import BrandStory from '@/components/BrandStory';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <ProductGrid title="Shop Now" subtitle="Featured" limit={6} />
        <CollectionsSection />
        <BrandStory />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
