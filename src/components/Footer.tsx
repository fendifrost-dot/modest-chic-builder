import { Link } from 'react-router-dom';
import { Instagram, Twitter, Mail, MapPin } from 'lucide-react';
import { SITE_EMAIL, LEGAL_ADDRESS, SOCIAL_URLS } from '@/lib/site';

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
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Use', href: '/terms' },
    { name: 'Privacy Choices', href: '/privacy-choices' },
    { name: 'Email Preferences', href: '/email-preferences' },
  ],
};

const bottomLegalLinks = [
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy Choices', href: '/privacy-choices' },
  { name: 'Email Preferences', href: '/email-preferences' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-obsidian border-t border-border">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl text-cream">MOD#$T</span>
            </Link>
            <p className="text-cream/50 text-sm leading-relaxed mb-6 max-w-sm">
              Premium streetwear for those who understand that true luxury is understated.
              Crafted with intention, worn with confidence.
            </p>

            <div className="space-y-3 text-sm">
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-3 text-cream/50 hover:text-gold transition-colors">
                <Mail size={16} />
                {SITE_EMAIL}
              </a>
              <div className="flex items-start gap-3 text-cream/50">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{LEGAL_ADDRESS}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors inline-flex min-h-11 items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors inline-flex min-h-11 items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors inline-flex min-h-11 items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-cream mb-6 tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-cream/50 text-sm hover:text-gold transition-colors inline-flex min-h-11 items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

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

      <div className="border-t border-border">
        <div className="container mx-auto px-6 lg:px-12 py-6 space-y-4">
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs">
            {bottomLegalLinks.map((link, index) => (
              <span key={link.href} className="inline-flex items-center gap-3">
                {index > 0 ? <span className="text-cream/25" aria-hidden="true">·</span> : null}
                <Link to={link.href} className="text-cream/50 hover:text-gold transition-colors min-h-11 inline-flex items-center">
                  {link.name}
                </Link>
              </span>
            ))}
          </nav>

          <p className="text-cream/40 text-xs text-center">
            © {currentYear} MOD#$T. All rights reserved.
          </p>

          <div className="flex items-center justify-center gap-4">
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
