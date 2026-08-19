import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, MapPin } from 'lucide-react';
import { SITE_EMAIL, SITE_LOCATION, SOCIAL_URLS } from '@/lib/site';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'Mens', href: '/mens' },
      { name: 'Womens', href: '/womens' },
      { name: 'Accessories', href: '/accessories' },
      { name: 'New Arrivals', href: '/new-arrivals' },
      { name: 'Sale', href: '/sale' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'FAQs', href: '/faq' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Sustainability', href: '/sustainability' },
    ],
  };

  return (
    <footer className="bg-obsidian border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl text-cream">MOD#$T</span>
            </Link>
            <p className="text-cream/50 text-sm leading-relaxed mb-6 max-w-sm">
              Premium streetwear for those who understand that true luxury is understated. 
              Crafted with intention, worn with confidence.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-3 text-cream/50 hover:text-gold transition-colors">
                <Mail size={16} />
                {SITE_EMAIL}
              </a>
              <div className="flex items-center gap-3 text-cream/50">
                <MapPin size={16} />
                {SITE_LOCATION}
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-cream/40 text-xs">
              © {currentYear} MOD#$T. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_URLS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={SOCIAL_URLS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-gold transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter size={18} />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-xs">
              <Link to="/privacy" className="text-cream/40 hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-cream/40 hover:text-gold transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-center gap-6 text-cream/30 text-xs tracking-wider">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>AMEX</span>
            <span>AFFIRM</span>
            <span>PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
