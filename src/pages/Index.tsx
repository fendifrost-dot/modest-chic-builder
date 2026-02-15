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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <ProductGrid title="Heart Chakra Collection" subtitle="Essentials" limit={20} query="collection:heart-chakra-collection" />
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
