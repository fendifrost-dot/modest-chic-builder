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
        '@type': 'Organization',
        name: 'MOD#$T',
        alternateName: 'Be More Modest',
        url: 'https://bemoremodest.com',
        logo: 'https://bemoremodest.com/favicon.svg',
        email: 'hello@bemoremodest.com',
        sameAs: [
          'https://instagram.com/bemoremodest',
          'https://twitter.com/bemoremodest',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MOD#$T',
        url: 'https://bemoremodest.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://bemoremodest.com/#shop',
          'query-input': 'required name=search_term_string',
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
}: {
  name: string;
  description: string;
  images: string[];
  price: string;
  currency: string;
  availability: boolean;
  url: string;
}) => (
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image: images,
      brand: {
        '@type': 'Brand',
        name: 'MOD#$T',
      },
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: currency,
        price,
        availability: availability
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
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
