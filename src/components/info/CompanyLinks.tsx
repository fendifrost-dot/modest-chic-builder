import { Link } from 'react-router-dom';

const links = [
  { to: '/about', label: 'About' },
  { to: '/careers', label: 'Careers' },
  { to: '/press', label: 'Press' },
  { to: '/sustainability', label: 'Sustainability' },
  { to: '/#shop', label: 'Shop' },
] as const;

const CompanyLinks = () => (
  <nav aria-label="Company pages" className="mt-16 pt-10 border-t border-border">
    <p className="text-gold text-xs tracking-[0.25em] uppercase mb-4">Explore</p>
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {links.map((link) => (
        <li key={link.to}>
          <Link
            to={link.to}
            className="text-cream/60 text-sm tracking-wider uppercase hover:text-gold transition-colors inline-flex min-h-11 items-center"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default CompanyLinks;
