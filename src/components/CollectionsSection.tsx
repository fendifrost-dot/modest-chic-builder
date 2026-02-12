import { Link } from 'react-router-dom';
import mensImage from '@/assets/collection-mens-brand.jpg';
import womensImage from '@/assets/collection-womens-brand.jpg';
import accessoriesImage from '@/assets/collection-accessories-brand.jpg';

const collections = [
  {
    name: 'Mens',
    description: 'Bold statements, refined execution',
    image: mensImage,
    href: '/mens',
  },
  {
    name: 'Womens',
    description: 'Elegance meets urban edge',
    image: womensImage,
    href: '/womens',
  },
  {
    name: 'Accessories',
    description: 'Complete the look',
    image: accessoriesImage,
    href: '/accessories',
  },
];

const CollectionsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
            Explore
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-cream">
            Collections
          </h2>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <Link
              key={collection.name}
              to={collection.href}
              className="group relative overflow-hidden aspect-[3/4] opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Image */}
              <img
                src={collection.image}
                alt={collection.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent transition-opacity duration-500"></div>
              
              {/* Content */}
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
