import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';

const collections = [
  {
    name: 'Mens',
    description: 'Bold statements, refined execution',
    image: {
      src: '/images/collection-mens-500.webp',
      srcSet: '/images/collection-mens-500.webp 500w, /images/collection-mens-900.webp 900w',
      sizes: '(max-width: 768px) 100vw, 33vw',
      width: 900,
      height: 600,
    },
    href: '/mens',
  },
  {
    name: 'Womens',
    description: 'Elegance meets urban edge',
    image: {
      src: '/images/collection-womens-480.webp',
      srcSet: '/images/collection-womens-480.webp 480w, /images/collection-womens-800.webp 800w',
      sizes: '(max-width: 768px) 100vw, 33vw',
      width: 533,
      height: 800,
    },
    href: '/womens',
  },
  {
    name: 'Accessories',
    description: 'Complete the look',
    image: {
      src: '/images/collection-accessories-480.webp',
      srcSet: '/images/collection-accessories-480.webp 480w, /images/collection-accessories-800.webp 800w',
      sizes: '(max-width: 768px) 100vw, 33vw',
      width: 800,
      height: 800,
    },
    href: '/accessories',
  },
];

const CollectionsSection = () => {
  return (
    <section id="lookbook" className="py-24 bg-background scroll-mt-28">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
            Explore
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-cream">
            Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <Link
              key={collection.name}
              to={collection.href}
              className="group relative overflow-hidden aspect-[3/4] animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <OptimizedImage
                src={collection.image.src}
                srcSet={collection.image.srcSet}
                sizes={collection.image.sizes}
                alt={`${collection.name} collection`}
                width={collection.image.width}
                height={collection.image.height}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent transition-opacity duration-500"></div>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-gold/80 text-xs tracking-[0.2em] uppercase mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {collection.description}
                </p>
                <h3 className="font-display text-4xl text-cream mb-4">
                  {collection.name}
                </h3>
                <span className="inline-flex items-center gap-2 text-cream text-sm tracking-[0.2em] uppercase group-hover:text-gold transition-colors duration-300">
                  Shop Now
                  <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
