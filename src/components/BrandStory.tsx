const BrandStory = () => {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[40rem] text-cream pointer-events-none select-none">
          M
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-6">
            Our Philosophy
          </p>
          
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-cream mb-8">
            Luxury Whispers,
            <br />
            <span className="text-gradient-gold">It Never Shouts</span>
          </h2>
          
          <p className="text-cream/60 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            MOD#$T was born from a simple belief: true style doesn't need to scream. 
            We craft premium streetwear for those who understand that real luxury 
            is felt, not flaunted. Every piece tells a story of understated confidence.
          </p>
          
          <p className="text-cream/40 text-base leading-relaxed mb-12 max-w-xl mx-auto">
            From the finest cashmere to hand-selected materials, we obsess over 
            every detail so you can be effortlessly exceptional.
          </p>

          <a href="#lookbook" className="btn-hero inline-block">
            Explore Collections
          </a>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
