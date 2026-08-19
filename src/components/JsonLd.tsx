import {
  ENTITY_ID,
  ENTITY_NAME,
  LEGAL_ENTITY_NAME,
  LEGAL_STREET,
  SITE_ALT_NAME,
  SITE_CITY,
  SITE_EMAIL,
  SITE_FOUNDED,
  SITE_NAME,
  SITE_REGION,
  SITE_URL,
  SOCIAL_URLS,
} from '@/lib/site';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export const JsonLd = ({ data }: JsonLdProps) => (
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
        '@id': ENTITY_ID,
        '@type': ['Organization', 'Brand', 'ClothingStore'],
        name: ENTITY_NAME,
        legalName: LEGAL_ENTITY_NAME,
        alternateName: [SITE_NAME, SITE_ALT_NAME, 'BeMoreModest'],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        image: `${SITE_URL}/og-image.jpg`,
        email: SITE_EMAIL,
        description:
          `${ENTITY_NAME} (${SITE_NAME}) is a Chicago luxury streetwear brand founded in ${SITE_FOUNDED}, known for outerwear, cashmere, sweatshirts, T-shirts, and accessories.`,
        foundingDate: '2017-09',
        address: {
          '@type': 'PostalAddress',
          streetAddress: LEGAL_STREET,
          addressLocality: SITE_CITY,
          addressRegion: SITE_REGION,
          addressCountry: 'US',
        },
        foundingLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: SITE_CITY,
            addressRegion: SITE_REGION,
            addressCountry: 'US',
          },
        },
        areaServed: 'US',
        priceRange: '$$',
        sameAs: [
          SOCIAL_URLS.instagram,
          SOCIAL_URLS.twitter,
          SOCIAL_URLS.tiktok,
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: [ENTITY_NAME, SITE_ALT_NAME],
        url: SITE_URL,
        inLanguage: 'en-US',
        publisher: { '@id': ENTITY_ID },
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
