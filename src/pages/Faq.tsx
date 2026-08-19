import PageShell from '@/components/info/PageShell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FaqJsonLd } from '@/components/JsonLd';
import { SHIPPING_POLICY } from '@/lib/policies';
import {
  ENTITY_NAME,
  FOUNDER_DISPLAY,
  FOUNDER_ROLE,
  SITE_CITY,
  SITE_EMAIL,
  SITE_FOUNDED,
  SITE_NAME,
} from '@/lib/site';

const groups: Array<{
  id: string;
  title: string;
  items: Array<{ q: string; a: string }>;
}> = [
  {
    id: 'orders',
    title: 'Orders',
    items: [
      {
        q: 'How do I know my order was received?',
        a: 'Shopify sends an order confirmation to the email used at checkout. If it is not in inbox or spam, write us with the name and email on the order.',
      },
      {
        q: 'Can I change or cancel an order?',
        a: `Maybe, if fulfillment has not started. Email ${SITE_EMAIL} immediately with your order number. Once a label is created, changes are often not possible.`,
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    items: [
      {
        q: 'How can I track my order?',
        a: SHIPPING_POLICY.trackingNote,
      },
      {
        q: 'Do you ship internationally?',
        a: 'If international shipping is offered for your address, it appears as an option at checkout with the rate and estimate. If it does not appear, we cannot ship that destination on this order.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns',
    items: [
      {
        q: 'How do I start a return or exchange?',
        a: `Use the returns page or email ${SITE_EMAIL} with your order number and what you need. We confirm eligibility on that order.`,
      },
    ],
  },
  {
    id: 'products',
    title: 'Products',
    items: [
      {
        q: 'How should I choose my size?',
        a: 'Start with the size guide and the size options on the product page. Fit is relaxed streetwear. Size up for an oversized look.',
      },
      {
        q: `How should I care for ${SITE_NAME} pieces?`,
        a: 'Follow the care label on the garment. Cashmere, fur details, and outerwear often need gentler handling than a standard tee — when unsure, write us with the product name before washing or dry-cleaning.',
      },
    ],
  },
  {
    id: 'brand',
    title: 'Brand',
    items: [
      {
        q: `What is ${SITE_NAME}?`,
        a: `${ENTITY_NAME} (${SITE_NAME}) is an independent luxury streetwear house from ${SITE_CITY}, known for outerwear, cashmere, sweatshirts, T-shirts, and accessories.`,
      },
      {
        q: `Who founded ${SITE_NAME}?`,
        a: `${FOUNDER_DISPLAY}, ${FOUNDER_ROLE.toLowerCase()}. The house was founded in ${SITE_CITY} in ${SITE_FOUNDED}.`,
      },
    ],
  },
];

const Faq = () => {
  return (
    <PageShell
      title={`FAQs | ${SITE_NAME}`}
      description={`Orders, shipping, returns, sizing, and brand questions for Modest (${SITE_NAME}).`}
      path="/faq"
      eyebrow="Common Questions"
      heading="FAQs"
    >
      <FaqJsonLd faqs={groups.flatMap((group) => group.items.map((item) => ({ question: item.q, answer: item.a })))} />

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="font-display text-2xl text-cream tracking-wider mb-2">{group.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {group.items.map((item, index) => (
                <AccordionItem key={item.q} value={`${group.id}-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-cream hover:text-gold hover:no-underline text-sm tracking-wide min-h-11">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-cream/60 leading-relaxed text-sm">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </PageShell>
  );
};

export default Faq;
