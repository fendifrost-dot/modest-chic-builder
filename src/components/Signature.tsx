const Signature = () => {
  return (
    <section aria-labelledby="signature-heading" className="bg-charcoal border-y border-border">
      <div className="container mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
        <div className="lg:col-span-5">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-5">The mark</p>
          <h2 id="signature-heading" className="font-display text-5xl md:text-7xl text-cream leading-[0.9]">
            Rabbit fur
            <br />
            patches
          </h2>
        </div>
        <div className="lg:col-span-7 space-y-6 text-cream/70 text-lg leading-relaxed max-w-2xl">
          <p>
            A MOD#$T piece is known by the rabbit-fur patch: a small, tactile emblem sewn where a logo would shout. You feel it before you read it. That is the Chicago studio detail — quiet, physical, and impossible to fake with a print.
          </p>
          <p className="text-cream/45 text-sm tracking-wide">
            Modest Streetwear Apparel Inc. · Founded September 2017 in Chicago by Terrence Cleveland, Founder, CEO, and Lead Designer.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signature;
