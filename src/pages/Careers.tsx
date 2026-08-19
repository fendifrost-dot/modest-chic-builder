import PageShell from '@/components/info/PageShell';
import InquiryForm from '@/components/info/InquiryForm';
import { CAREERS_COPY } from '@/lib/policies';
import { SITE_CITY, SITE_EMAIL, SITE_NAME } from '@/lib/site';

const marketingFocus = [
  'Social media',
  'Content',
  'Creator / influencer research',
  'Campaign planning',
  'Email support',
  'Fashion / culture research',
  'Analytics',
  'Community / event support',
];

const marketingFit = [
  'Interested in fashion, streetwear, music, culture, or luxury branding',
  'Clear written communication',
  'Understands Instagram, TikTok, and social culture',
  'Organized and willing to learn',
  'Portfolio, school projects, personal pages, or prior experience are helpful — not required',
];

const techPackFocus = [
  'Manufacturer-ready tech packs',
  'Garment flat sketches',
  'Front / back technical drawings',
  'Measurement / spec sheets',
  'Grading notes where supplied',
  'Colorways',
  'Material and fabric callouts',
  'Trims and hardware details',
  'Label / branding placement',
  'Stitching and construction notes',
  'BOM / bill of materials',
  'Packaging instructions',
  'Revision tracking',
  'Organizing reference imagery',
  'Communicating corrections between designer and manufacturer',
];

const techPackSkills = [
  'Adobe Illustrator or equivalent',
  'Apparel technical design',
  'Garment construction',
  'Measurement / spec sheets',
  'Manufacturer communication',
  'Fashion production workflow',
];

const techPackPreferred = [
  'Outerwear',
  'Streetwear',
  'Knitwear',
  'Cashmere',
  'Leather, fur, and detail applications',
  'Luxury apparel',
];

const Careers = () => (
  <PageShell
    title={`Careers at Modest (${SITE_NAME})`}
    description={`Work with Modest (${SITE_NAME}) in ${SITE_CITY}. Openings in marketing internship and fashion tech pack / production design support.`}
    path="/careers"
    eyebrow="Join the House"
    heading={`Work With ${SITE_NAME}`}
    wide
  >
    <p className="text-cream/70 text-lg leading-relaxed mb-12">
      {SITE_NAME} is an independent luxury streetwear brand looking for creative people
      interested in fashion, design, marketing, content, production, and brand-building.
      We are a small team. The work is real.
    </p>

    <article className="border border-border p-6 md:p-8 mb-8" id="marketing-intern">
      <p className="text-gold text-xs tracking-[0.25em] uppercase mb-2">{CAREERS_COPY.marketingEmploymentLabel}</p>
      <h2 className="font-display text-3xl text-cream tracking-wider mb-4">Marketing Internship</h2>
      <p className="text-cream/60 leading-relaxed mb-6">
        An educational, portfolio-building role supporting how Modest shows up in culture —
        from content and research to launch planning. You will work alongside the brand, not
        in a corporate HR pipeline.
      </p>
      <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-3">Focus areas</h3>
      <ul className="grid sm:grid-cols-2 gap-2 text-cream/60 text-sm mb-6">
        {marketingFocus.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-3">Ideal candidate</h3>
      <ul className="space-y-2 text-cream/60 text-sm mb-6">
        {marketingFit.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <aside className="border border-gold/30 bg-gold/5 px-4 py-4 text-cream/70 text-sm leading-relaxed">
        {CAREERS_COPY.internCompensationCallout}
      </aside>
    </article>

    <article className="border border-border p-6 md:p-8 mb-12" id="tech-pack">
      <p className="text-gold text-xs tracking-[0.25em] uppercase mb-2">{CAREERS_COPY.techPackEmploymentLabel}</p>
      <h2 className="font-display text-3xl text-cream tracking-wider mb-4">
        Fashion Tech Pack / Production Design Assistant
      </h2>
      <p className="text-cream/60 leading-relaxed mb-4">
        Help turn Modest concepts into manufacturer-ready production documents. This is
        technical design support — flats, specs, BOMs, and clear revision trails — not
        independent product invention.
      </p>
      <p className="text-cream/50 text-sm leading-relaxed mb-6">
        The role does not independently invent production specifications that have not been
        supplied or approved by {SITE_NAME}.
      </p>
      <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-3">Responsibilities</h3>
      <ul className="grid sm:grid-cols-2 gap-2 text-cream/60 text-sm mb-6">
        {techPackFocus.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-3">You should understand</h3>
      <ul className="grid sm:grid-cols-2 gap-2 text-cream/60 text-sm mb-6">
        {techPackSkills.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
      <h3 className="text-cream text-sm tracking-[0.15em] uppercase mb-3">Preferred experience</h3>
      <ul className="grid sm:grid-cols-2 gap-2 text-cream/60 text-sm">
        {techPackPreferred.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </article>

    <section id="apply">
      <h2 className="font-display text-3xl text-cream tracking-wider mb-3">Apply</h2>
      <p className="text-cream/60 text-sm leading-relaxed mb-8">
        Applications open your email to {SITE_EMAIL}. Attach a resume or sample pack there if
        you have one — this site does not host file uploads. Portfolio and tech-pack links
        are preferred.
      </p>
      <InquiryForm
        subjectPrefix="Careers"
        submitLabel="Submit Application"
        successTitle="Application drafted"
        successBody="Your email app should open with the application. Send it to complete. We read every note that arrives."
        fields={[
          { name: 'fullName', label: 'Full Name', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'location', label: 'City / Location', required: true },
          {
            name: 'position',
            label: 'Position Interested In',
            type: 'select',
            required: true,
            options: [
              { value: 'Marketing Internship', label: 'Marketing Internship' },
              { value: 'Fashion Tech Pack / Production Design', label: 'Fashion Tech Pack / Production Design' },
              { value: 'General Interest', label: 'General Interest' },
            ],
          },
          { name: 'school', label: 'School' },
          { name: 'major', label: 'Major / Area of Study' },
          { name: 'portfolio', label: 'Portfolio URL', type: 'url', placeholder: 'https://' },
          { name: 'social', label: 'Instagram / LinkedIn' },
          { name: 'availability', label: 'Availability', required: true, placeholder: 'Hours / start date / timezone' },
          {
            name: 'techPackSample',
            label: 'Link to a tech pack or technical-design sample',
            type: 'url',
            showWhen: { field: 'position', value: 'Fashion Tech Pack / Production Design' },
          },
          {
            name: 'why',
            label: `Why do you want to work with ${SITE_NAME}?`,
            type: 'textarea',
            required: true,
            rows: 6,
          },
        ]}
      />
    </section>
  </PageShell>
);

export default Careers;
