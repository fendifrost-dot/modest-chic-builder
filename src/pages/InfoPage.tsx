import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';
import { FaqJsonLd } from '@/components/JsonLd';
import { pageTitle, SITE_DESCRIPTION, SITE_EMAIL, SITE_LOCATION, LEGAL_NAME, FOUNDER_NAME, FOUNDER_ROLE, FOUNDED } from '@/lib/site';

interface PageContent {
  title: string;
  subtitle?: string;
  sections: Array<{ heading?: string; body: string }>;
}

const pages: Record<string, PageContent> = {
  about: {
    title: 'About MOD#$T',
    subtitle: 'Our Story',
    sections: [
      {
        body: `Modest, displayed as MOD#$T, is ${LEGAL_NAME}. ${FOUNDER_NAME} — ${FOUNDER_ROLE} — founded the house in Chicago in ${FOUNDED}. True style does not need to scream. High-end luxury streetwear is felt, not flaunted.`,
      },
      {
        heading: 'Rabbit-fur patches',
        body: 'The brand signature is the rabbit-fur patch: a small tactile emblem sewn where a logo would shout. It is the detail the Chicago studio is known for.',
      },
      {
        heading: 'Our Mission',
        body: 'Every piece is designed with intention — from material to fit — so you can move through the world with quiet confidence. Modesty is not limitation; it is refinement.',
      },
      {
        heading: 'Craft & Quality',
        body: 'We obsess over the details others overlook. Premium materials, thoughtful construction, and limited runs ensure each drop feels exclusive without being excessive.',
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'Get in Touch',
    sections: [
      {
        body: 'Write to us about an order, a size, or a collaboration. Modest has no public phone number.',
      },
      {
        heading: 'Email',
        body: SITE_EMAIL,
      },
      {
        heading: 'Location',
        body: SITE_LOCATION,
      },
      {
        heading: 'Response Time',
        body: 'We typically respond within 1–2 business days.',
      },
    ],
  },
  shipping: {
    title: 'Shipping Info',
    subtitle: 'Delivery',
    sections: [
      {
        body: 'Orders are processed within 1–3 business days. You will receive a confirmation email with tracking once your order ships.',
      },
      {
        heading: 'Domestic Shipping',
        body: 'Standard delivery within the U.S. typically takes 5–7 business days. Free shipping on orders over $200.',
      },
      {
        heading: 'International',
        body: 'International shipping is available to select countries. Rates and delivery times are calculated at checkout.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    subtitle: 'Our Policy',
    sections: [
      {
        body: 'We want you to love your MOD#$T pieces. If something is not right, we accept returns on unworn items with original tags within 14 days of delivery.',
      },
      {
        heading: 'How to Start a Return',
        body: 'Email info@bemoremodest.com with your order number and reason for return. We will send you a prepaid return label when eligible.',
      },
      {
        heading: 'Exchanges',
        body: 'Need a different size? Contact us within 14 days and we will help arrange an exchange based on availability.',
      },
    ],
  },
  'size-guide': {
    title: 'Size Guide',
    subtitle: 'Find Your Fit',
    sections: [
      {
        body: 'Our pieces are designed with a relaxed, elevated streetwear fit. When in doubt, size up for an oversized look or stay true to size for a classic fit.',
      },
      {
        heading: 'Tops & Hoodies',
        body: 'Measure chest at the fullest point. Compare available sizes on each product page — click any size even if it is crossed out for the current color, and we will switch you to a matching pair.',
      },
      {
        heading: 'Approximate unisex tee fit',
        body: 'XS extra fitted • S fitted • M regular streetwear • L relaxed • XL oversized • 2XL–5XL extended. Jackets and cashmere follow standard US sizing. If you prefer an oversized look, size up. Email info@bemoremodest.com with height, weight, and preferred fit for a recommendation.',
      },
    ],
  },
  faq: {
    title: 'FAQs',
    subtitle: 'Common Questions',
    sections: [
      {
        heading: 'Where is my order?',
        body: 'Check your confirmation email for tracking. Orders ship within 1–3 business days.',
      },
      {
        heading: 'Who founded Modest?',
        body: 'Terrence Cleveland, Founder, CEO, and Lead Designer, founded Modest Streetwear Apparel Inc. in Chicago in September 2017. The brand is displayed as MOD#$T.',
      },
      {
        heading: 'How do I contact the brand?',
        body: 'Email info@bemoremodest.com. There is no public phone. Social profiles are Instagram @bemoremodest and X @bemoremodest.',
      },
      {
        heading: 'Do you offer payment plans?',
        body: 'Checkout is Stripe. Card wallets enabled on the Modest Stripe account appear there. A payment plan such as Affirm appears only if that method is turned on in Stripe.',
      },
      {
        heading: 'What is a pre-order?',
        body: 'What\'s to Come is separate from the shop. Those pieces are not in the Printify catalog and are not in production yet. The current concepts are four snakeskin-textured 6-panel caps (grey/white, tan, golden, and brown/black) with a brass-buckle strap and an optional bear enamel pin, plus a six-finish bear mascot pin set. Each one is labeled Pre-order. Name, price, and ship timing stay blank until the Founder sets them, and checkout stays closed until then. A paid pre-order is charged in Stripe and is not sent to Printify.',
      },
      {
        heading: 'Are your drops limited?',
        body: 'Many of our collections are produced in limited quantities. Once they sell out, restocks are not guaranteed.',
      },
      {
        heading: 'How do I use a discount code?',
        body: 'Enter your code on the Stripe Checkout page. New subscribers can use WELCOME10 for 10% off the first order once that promotion code exists in Stripe.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Legal',
    sections: [
      {
        body: 'MOD#$T respects your privacy. We collect only the information needed to process orders, send updates you opt into, and improve your shopping experience.',
      },
      {
        heading: 'What We Collect',
        body: 'Name, email, shipping address, and phone if you choose to provide one at checkout. Card numbers are processed by Stripe and are not stored by Modest. Newsletter signups are managed through our email provider.',
      },
      {
        heading: 'Your Rights',
        body: 'You may request access to or deletion of your personal data by contacting info@bemoremodest.com.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Legal',
    sections: [
      {
        body: 'By using bemoremodest.com, you agree to these terms. All products are subject to availability. Prices and promotions may change without notice.',
      },
      {
        heading: 'Orders & Payment',
        body: 'Payment is charged by Stripe Checkout. After payment, the order is handed to Printify for production. We reserve the right to cancel orders suspected of fraud.',
      },
      {
        heading: 'Intellectual Property',
        body: 'All MOD#$T branding, designs, and content are protected. Unauthorized use is prohibited.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    subtitle: 'Join the Team',
    sections: [
      {
        body: 'We are a growing brand based in Chicago. While we do not have open roles listed right now, we are always interested in connecting with creative talent.',
      },
      {
        heading: 'Get in Touch',
        body: 'Send your portfolio and a brief introduction to info@bemoremodest.com with the subject line "Careers".',
      },
    ],
  },
  press: {
    title: 'Press',
    subtitle: 'Media Inquiries',
    sections: [
      {
        body: 'For press kits, interview requests, and media collaborations, please reach out to our team.',
      },
      {
        heading: 'Contact',
        body: 'info@bemoremodest.com — subject line "Press"',
      },
    ],
  },
  sustainability: {
    title: 'Sustainability',
    subtitle: 'Our Commitment',
    sections: [
      {
        body: 'We believe quality over quantity is the most sustainable choice. By producing in limited runs with durable materials, we aim to reduce waste and encourage pieces that last.',
      },
      {
        heading: 'Materials',
        body: 'We prioritize responsible sourcing where possible and work with suppliers who meet our quality and ethical standards.',
      },
    ],
  },
};

interface Props {
  slug: keyof typeof pages;
}

const InfoPage = ({ slug }: Props) => {
  const page = pages[slug];

  if (!page) {
    return null;
  }

  const description = page.sections[0]?.body || SITE_DESCRIPTION;
  const faqs = slug === 'faq'
    ? page.sections
        .filter((section) => section.heading)
        .map((section) => ({ question: section.heading as string, answer: section.body }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={pageTitle(page.title)}
        description={description.slice(0, 160)}
        path={`/${slug}`}
      />
      {faqs.length > 0 && <FaqJsonLd faqs={faqs} />}
      <Header />
      <main className="pt-36 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          {page.subtitle && (
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">{page.subtitle}</p>
          )}
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-12">{page.title}</h1>

          <div className="space-y-8">
            {page.sections.map((section, index) => (
              <div key={index}>
                {section.heading && (
                  <h2 className="font-display text-xl text-cream tracking-wider mb-3">{section.heading}</h2>
                )}
                <p className="text-cream/60 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="inline-block mt-12 text-gold text-sm tracking-[0.2em] uppercase hover:underline"
          >
            ← Back to Shop
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
