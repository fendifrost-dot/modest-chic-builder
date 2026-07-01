import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

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
        body: 'MOD#$T was born from a simple belief: true style does not need to scream. We craft premium streetwear for those who understand that real luxury is felt, not flaunted.',
      },
      {
        heading: 'Our Mission',
        body: 'Every piece we release is designed with intention — from fabric selection to fit — so you can move through the world with quiet confidence. We believe modesty is not limitation; it is refinement.',
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
        body: 'We would love to hear from you. Whether you have a question about your order, sizing, or a collaboration inquiry, our team is here to help.',
      },
      {
        heading: 'Email',
        body: 'hello@bemoremodest.com',
      },
      {
        heading: 'Location',
        body: 'Los Angeles, CA',
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
        body: 'Email hello@bemoremodest.com with your order number and reason for return. We will send you a prepaid return label when eligible.',
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
        body: 'Measure chest at the fullest point. Compare to the size chart on each product page for the most accurate fit.',
      },
      {
        heading: 'Need Help?',
        body: 'Email hello@bemoremodest.com with your height, weight, and preferred fit — we are happy to recommend a size.',
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
        heading: 'Do you offer payment plans?',
        body: 'Yes — Affirm is available at checkout on eligible orders.',
      },
      {
        heading: 'Are your drops limited?',
        body: 'Many of our collections are produced in limited quantities. Once they sell out, restocks are not guaranteed.',
      },
      {
        heading: 'How do I use a discount code?',
        body: 'Enter your code at Shopify checkout after adding items to your cart.',
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
        body: 'Name, email, shipping address, and payment details (processed securely by Shopify). Newsletter signups are managed through our email provider.',
      },
      {
        heading: 'Your Rights',
        body: 'You may request access to or deletion of your personal data by contacting hello@bemoremodest.com.',
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
        body: 'Orders are fulfilled through Shopify. Payment is charged at checkout. We reserve the right to cancel orders suspected of fraud.',
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
        body: 'We are a growing brand based in Los Angeles. While we do not have open roles listed right now, we are always interested in connecting with creative talent.',
      },
      {
        heading: 'Get in Touch',
        body: 'Send your portfolio and a brief introduction to hello@bemoremodest.com with the subject line "Careers".',
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
        body: 'hello@bemoremodest.com — subject line "Press"',
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

  return (
    <div className="min-h-screen bg-background">
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
