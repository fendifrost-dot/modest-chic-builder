import { useState, useEffect, useCallback } from 'react';
import { Menu, X, Search, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartDrawer } from '@/components/CartDrawer';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  // Close menu and restore scroll on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileMenuOpen, closeMenu]);

  // Navigate with instant menu close
  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    console.log('nav link click', href);
    closeMenu();
    requestAnimationFrame(() => navigate(href));
  }, [closeMenu, navigate]);

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
            onClick={() => {
              console.log('hamburger click');
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
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

      {/* Mobile Menu — full-screen drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-[70] bg-black/60"
            onClick={closeMenu}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="lg:hidden fixed inset-0 z-[71] bg-obsidian flex flex-col overflow-y-auto">
            {/* Drawer header with close button */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-border shrink-0">
              <span className="font-display text-3xl text-cream tracking-wider">MOD#$T</span>
              <button onClick={closeMenu} className="text-cream hover:text-gold transition-colors" aria-label="Close menu">
                <X size={28} />
              </button>
            </div>
            {/* Nav links — stacked, push layout */}
            <nav className="flex flex-col items-center justify-center flex-1 gap-8 py-12">
            {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-cream font-display text-4xl tracking-wider hover:text-gold transition-colors"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
