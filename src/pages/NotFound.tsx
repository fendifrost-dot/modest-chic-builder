import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[60vh] pt-36 pb-24 text-center px-6">
        <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">404</p>
        <h1 className="font-display text-5xl text-cream mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link to="/" className="btn-hero-primary">
          Return Home
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
