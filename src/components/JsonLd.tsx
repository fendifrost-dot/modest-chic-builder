interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export const SiteJsonLd = () => (
  <JsonLd
    data={[
      {
        '@context': 'https://schema.org',
        '@type': ['Organization', 'ClothingStore'],
        name: 'MOD#$T',
        alternateName: ['Be More Modest', 'BeMoreModest', 'Modest'],
        url: 'https://bemoremodest.com',
        logo: 'https://bemoremodest.com/favicon.svg',
        image: 'https://bemoremodest.com/og-image.jpg',
        email: 'hello@bemoremodest.com',
        description:
          'MOD#$T (Be More Modest) is a Los Angeles luxury streetwear brand crafting limited-run cashmere, varsity jackets, tees, and accessories for understated confidence.',
        foundingLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Los Angeles',
            addressRegion: 'CA',
            addressCountry: 'US',
          },
        },
        areaServed: 'US',
        priceRange: '$$',
        sameAs: [
          'https://instagram.com/bemoremodest',
          'https://twitter.com/bemoremodest',
          'https://www.tiktok.com/@bemoremodest',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MOD#$T',
        alternateName: 'Be More Modest',
        url: 'https://bemoremodest.com',
        inLanguage: 'en-US',
        publisher: {
          '@type': 'Organization',
          name: 'MOD#$T',
        },
      },
    ]}
  />
);

export const ProductJsonLd = ({
  name,
  description,
  images,
  price,
  currency,
  availability,
  url,
  sku,
  brand = 'MOD#$T',
  variants = [],
}: {
  name: string;
  description: string;
  images: string[];
  price: string;
  currency: string;
  availability: boolean;
  url: string;
  sku?: string;
  brand?: string;
  variants?: Array<{
    name: string;
    sku?: string | null;
    price: string;
    currency: string;
    availability: boolean;
    color?: string;
    size?: string;
    image?: string;
  }>;
}) => (
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image: images,
      sku,
      brand: {
        '@type': 'Brand',
        name: brand,
      },
      offers: {
        '@type': variants.length > 1 ? 'AggregateOffer' : 'Offer',
        url,
        priceCurrency: currency,
        ...(variants.length > 1
          ? {
              lowPrice: Math.min(...variants.map((v) => parseFloat(v.price))).toFixed(2),
              highPrice: Math.max(...variants.map((v) => parseFloat(v.price))).toFixed(2),
              offerCount: variants.length,
            }
          : { price }),
        availability: availability
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
      ...(variants.length > 0
        ? {
            hasVariant: variants.map((variant) => ({
              '@type': 'Product',
              name: variant.name,
              sku: variant.sku,
              image: variant.image || images[0],
              color: variant.color,
              size: variant.size,
              offers: {
                '@type': 'Offer',
                url,
                priceCurrency: variant.currency,
                price: variant.price,
                availability: variant.availability
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              },
            })),
          }
        : {}),
    }}
  />
);

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) => (
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }}
  />
);

export const FaqJsonLd = ({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) => (
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }}
  />
);

export const CollectionJsonLd = ({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string; image?: string }>;
}) => (
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      url,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: item.url,
          name: item.name,
          image: item.image,
        })),
      },
    }}
  />
);
