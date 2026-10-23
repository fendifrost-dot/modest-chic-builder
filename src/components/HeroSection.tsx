const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-transparent">
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-28 md:pb-36 pt-28 md:pt-0 px-6 pointer-events-none">
        <div className="text-center max-w-4xl mx-auto">
          <p
            className="text-gold text-sm tracking-[0.4em] uppercase mb-6 opacity-0 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Chicago · September 2017
          </p>

          <h1
            aria-label="BE MORE MODEST"
            className="font-display text-5xl md:text-7xl lg:text-8xl text-cream mb-6 leading-[0.95] opacity-0 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="block" aria-hidden="true">BE MORE</span>
            <span className="block text-gradient-gold mt-1 md:mt-2" aria-hidden="true">MODEST</span>
          </h1>

          <p
            className="text-cream/70 text-lg md:text-xl max-w-xl mx-auto mb-12 font-light opacity-0 animate-fade-in"
            style={{ animationDelay: '0.7s' }}
          >
            High-end luxury streetwear that speaks without shouting.
            Crafted in Chicago for people who know true luxury is understated.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in"
            style={{ animationDelay: '0.9s' }}
          >
            <a href="#shop" className="btn-hero-primary pointer-events-auto">
              Shop Collection
            </a>
            <a href="#lookbook" className="btn-hero pointer-events-auto">
              View Lookbook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
