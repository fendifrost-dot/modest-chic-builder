import { Link } from 'react-router-dom';
import sweaterImg from '@/assets/product-sweater.jpg';
import hoodieImg from '@/assets/product-hoodie.jpg';
import varsityImg from '@/assets/product-varsity.jpg';
import bomberImg from '@/assets/product-bomber.jpg';
import capImg from '@/assets/product-cap.jpg';
import skimaskImg from '@/assets/product-skimask.jpg';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Big Bear Cashmere Sweater',
    price: 550,
    image: sweaterImg,
    category: 'mens',
    isNew: true,
  },
  {
    id: '2',
    name: 'M-BEAR Heavy Blend Hoodie',
    price: 100,
    image: hoodieImg,
    category: 'mens',
  },
  {
    id: '3',
    name: 'Ketchup & Mustard Varsity Jacket',
    price: 395,
    image: varsityImg,
    category: 'mens',
    isNew: true,
  },
  {
    id: '4',
    name: 'BZO Bomber Jacket',
    price: 299,
    image: bomberImg,
    category: 'mens',
  },
  {
    id: '5',
    name: 'MOD#$T Bear Leather Patch Cap',
    price: 30,
    image: capImg,
    category: 'accessories',
  },
  {
    id: '6',
    name: 'Big Bear Head Ski Mask',
    price: 100,
    image: skimaskImg,
    category: 'accessories',
    isSale: true,
    originalPrice: 120,
  },
];

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="product-card group block">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-charcoal">
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <button className="btn-hero px-8 py-3 text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            Quick View
          </button>
        </div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-gold text-obsidian text-[10px] tracking-[0.2em] uppercase px-3 py-1 font-medium">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-destructive text-cream text-[10px] tracking-[0.2em] uppercase px-3 py-1 font-medium">
              Sale
            </span>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-cream text-sm font-medium mb-2 group-hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-cream font-medium">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-sm">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  limit?: number;
}

const ProductGrid = ({ 
  title = "Shop Now", 
  subtitle = "Featured",
  products: productList = products,
  limit 
}: ProductGridProps) => {
  const displayProducts = limit ? productList.slice(0, limit) : productList;

  return (
    <section id="shop" className="py-24 bg-charcoal">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
            {subtitle}
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-cream">
            {title}
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 stagger-children">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        {limit && limit < productList.length && (
          <div className="text-center mt-16">
            <Link to="/shop" className="btn-hero">
              View All Products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
