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
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/30"></div>
        <div className="overlay-vignette absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-24 md:pb-32 pt-32 md:pt-0 px-6">
        <div className="text-center max-w-4xl mx-auto">
          <p 
            className="text-gold text-sm tracking-[0.4em] uppercase mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Winter 2025 Collection
          </p>
          
          <h1 
            className="font-display text-5xl md:text-8xl lg:text-9xl text-cream mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            BE MORE
            <br />
            <span className="text-gradient-gold">MODEST</span>
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-cream/50 text-xs tracking-[0.3em] uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-cream/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
