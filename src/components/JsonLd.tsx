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
        name: 'Modest',
        legalName: 'Modest Streetwear Apparel Inc.',
        alternateName: ['MOD#$T', 'Be More Modest', 'BeMoreModest'],
        url: 'https://bemoremodest.com',
        logo: 'https://bemoremodest.com/favicon.svg',
        image: 'https://bemoremodest.com/og-image.jpg',
        email: 'info@bemoremodest.com',
        description:
          'Modest (displayed as MOD#$T) is Modest Streetwear Apparel Inc., a high-end luxury streetwear brand founded in Chicago in September 2017 by Terrence Cleveland. The signature detail is the rabbit-fur patch. There is no public phone.',
        foundingDate: '2017-09',
        founder: {
          '@type': 'Person',
          name: 'Terrence Cleveland',
          jobTitle: 'Founder, CEO, Lead Designer',
        },
        brand: {
          '@type': 'Brand',
          name: 'Modest',
          alternateName: 'MOD#$T',
        },
        foundingLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Chicago',
            addressRegion: 'IL',
            addressCountry: 'US',
          },
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Chicago',
          addressRegion: 'IL',
          addressCountry: 'US',
        },
        areaServed: 'US',
        priceRange: '$$$',
        sameAs: [
          'https://instagram.com/bemoremodest',
          'https://twitter.com/bemoremodest',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MOD#$T',
        alternateName: ['Modest', 'Be More Modest'],
        url: 'https://bemoremodest.com',
        inLanguage: 'en-US',
        publisher: {
          '@type': 'Organization',
          name: 'Modest Streetwear Apparel Inc.',
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
