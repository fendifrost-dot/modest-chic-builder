import { MEASURE_STEPS, FIT_NOTES } from '@/lib/sizing';

const HowToMeasure = () => (
  <div className="space-y-10">
    <section>
      <h2 className="font-display text-2xl text-cream tracking-wider mb-4">How to Measure</h2>
      <p className="text-cream/60 leading-relaxed mb-6">
        Use a soft tape. Stand naturally. These are body measurements, not garment measurements.
        Confirmed spec charts will be published per style when they are available — we do not post guessed numbers here.
      </p>
      <ul className="space-y-5">
        {MEASURE_STEPS.map((step) => (
          <li key={step.name}>
            <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-1">{step.name}</h3>
            <p className="text-cream/60 text-sm leading-relaxed">{step.how}</p>
          </li>
        ))}
      </ul>
    </section>

    <section>
      <h2 className="font-display text-2xl text-cream tracking-wider mb-4">Fit Notes</h2>
      <div className="space-y-5">
        {FIT_NOTES.map((note) => (
          <div key={note.name}>
            <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-1">{note.name}</h3>
            <p className="text-cream/60 text-sm leading-relaxed">{note.body}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default HowToMeasure;
