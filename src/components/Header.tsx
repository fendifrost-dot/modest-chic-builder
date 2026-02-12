import { useState, useEffect } from 'react';
import { Menu, X, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartDrawer } from '@/components/CartDrawer';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Mens', href: '/mens' },
    { name: 'Womens', href: '/womens' },
    { name: 'Accessories', href: '/accessories' },
    { name: 'New Arrivals', href: '/new-arrivals' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-obsidian/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      {/* Announcement Bar */}
      <div className="bg-gold text-obsidian text-center py-2 text-xs tracking-[0.2em] uppercase font-medium">
        Enjoy Incredible Savings up to 30% Off! Discover Our Exclusive Sale at Checkout
      </div>

      <nav className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-cream hover:text-gold transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-cream text-sm tracking-[0.15em] uppercase hover:text-gold transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <span className="font-display text-3xl lg:text-4xl text-cream tracking-wider">
                MOD#$T
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent"></span>
            </div>
          </Link>

          {/* Desktop Navigation - Right */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-cream text-sm tracking-[0.15em] uppercase hover:text-gold transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="text-cream hover:text-gold transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="hidden sm:block text-cream hover:text-gold transition-colors" aria-label="Account">
              <User size={20} />
            </button>
            <CartDrawer />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[116px] bg-obsidian/98 backdrop-blur-lg transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-cream font-display text-4xl tracking-wider hover:text-gold transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
