import heroImage from '@/assets/hero-brand-upload.jpg';

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="MOD#$T Brand Hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/40"></div>
        <div className="overlay-vignette absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-28 md:pb-36 pt-28 md:pt-0 px-6">
        <div className="text-center max-w-4xl mx-auto">
          <p 
            className="text-gold text-sm tracking-[0.4em] uppercase mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Spring / Summer 2026
          </p>
          
          <h1 
            className="font-display text-5xl md:text-7xl lg:text-8xl text-cream mb-6 leading-[0.95] opacity-0 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="block">BE MORE</span>
            <span className="block text-gradient-gold mt-1 md:mt-2">MODEST</span>
          </h1>
          
          <p 
            className="text-cream/70 text-lg md:text-xl max-w-xl mx-auto mb-12 font-light opacity-0 animate-fade-in"
            style={{ animationDelay: '0.7s' }}
          >
            Premium streetwear that speaks without shouting. 
            Crafted for those who know true luxury is understated.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
            style={{ animationDelay: '0.9s' }}
          >
            <a href="#shop" className="btn-hero-primary">
              Shop Collection
            </a>
            <a href="#lookbook" className="btn-hero">
              View Lookbook
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
