import { describe, it, expect } from 'vitest';
import {
  siteGraph,
  productNode,
  collectionNode,
  webPageNode,
  breadcrumbNode,
  faqNode,
  materialFromTags,
  BRAND_ID,
} from '@/seo/schema.js';
import { STATIC_ROUTES, routeTitle, COLLECTION_ROUTES, INFO_ROUTES } from '@/seo/routes.js';
import { absoluteUrl, canonicalPath } from '@/seo/brand.js';
import { machineDescription, isHeldProduct, clampDescription } from '@/seo/product-meta.js';

const PHONE = /\b(\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/;

const node = (graph, type) =>
  graph['@graph'].find((n) =>
    Array.isArray(n['@type']) ? n['@type'].includes(type) : n['@type'] === type,
  );

describe('Modest entity graph', () => {
  const graph = siteGraph();
  const org = node(graph, 'Organization');

  it('publishes Modest as the machine-readable name and MOD#$T as an alternate', () => {
    expect(org.name).toBe('Modest');
    expect(org.alternateName).toContain('MOD#$T');
    expect(org.legalName).toBe('Modest Streetwear Apparel Inc.');
  });

  it('carries the verified founding facts', () => {
    expect(org.foundingDate).toBe('2017-09');
    expect(node(graph, 'Person').name).toBe('Terrence Cleveland');
    expect(org.founder['@id']).toBe(node(graph, 'Person')['@id']);
  });

  it('signals Chicago without publishing a street address', () => {
    expect(org.address.addressLocality).toBe('Chicago');
    expect(org.address.addressRegion).toBe('IL');
    expect(org.address.streetAddress).toBeUndefined();
  });

  it('publishes info@ and no other contact channel', () => {
    const serialized = JSON.stringify(graph);
    expect(org.email).toBe('info@bemoremodest.com');
    expect(serialized).not.toMatch(/support@/i);
    expect(serialized).not.toMatch(/"telephone"/);
    expect(serialized.replace(/2017-09/g, '')).not.toMatch(PHONE);
  });

  it('keeps Fendi Frost out of the graph entirely', () => {
    expect(JSON.stringify(graph)).not.toMatch(/fendi/i);
    expect(org.sameAs.every((url) => !/fendi/i.test(url))).toBe(true);
  });

  it('claims no TikTok account — the @bemoremodest handle is not ours', () => {
    expect(JSON.stringify(graph)).not.toMatch(/tiktok/i);
    expect(org.sameAs.every((url) => !/tiktok/i.test(url))).toBe(true);
  });

  it('links Organization, Brand and WebSite through stable @ids', () => {
    expect(org.brand['@id']).toBe(BRAND_ID);
    expect(node(graph, 'WebSite').publisher['@id']).toBe(org['@id']);
    expect(node(graph, 'Brand')['@id']).toBe(BRAND_ID);
  });

  it('resolves every @id reference to a node the page actually defines', () => {
    // The full set of nodes a product page carries: the entity graph plus the
    // page-level nodes rendered alongside it.
    const page = [
      ...graph['@graph'],
      productNode({
        path: '/product/x',
        name: 'X',
        description: 'd',
        images: [],
        price: '1.00',
        currency: 'USD',
        availability: true,
        variants: [{ name: 'S', price: '1.00', currency: 'USD', availability: true }],
      }),
      collectionNode({
        path: '/mens',
        name: 'M',
        description: 'd',
        items: [{ name: 'X', url: 'https://bemoremodest.com/product/x', price: '1', currency: 'USD' }],
      }),
      webPageNode({ path: '/about', name: 'A', description: 'd', type: 'AboutPage' }),
    ];

    const defined = new Set<string>();
    const referenced = new Set<string>();
    const walk = (value: unknown) => {
      if (Array.isArray(value)) return value.forEach(walk);
      if (!value || typeof value !== 'object') return;
      const obj = value as Record<string, unknown>;
      const id = obj['@id'] as string | undefined;
      // A node with only an @id is a reference; a node with other fields defines it.
      if (id) (Object.keys(obj).length === 1 ? referenced : defined).add(id);
      Object.values(obj).forEach(walk);
    };
    walk(page);

    const dangling = [...referenced].filter((id) => !defined.has(id));
    expect(dangling, `unresolved @id reference(s): ${dangling.join(', ')}`).toEqual([]);
  });
});

describe('route metadata', () => {
  it('gives every indexable route a unique title and description', () => {
    const titles = STATIC_ROUTES.map(routeTitle);
    const descriptions = STATIC_ROUTES.map((r) => r.description);
    expect(new Set(titles).size).toBe(STATIC_ROUTES.length);
    expect(new Set(descriptions).size).toBe(STATIC_ROUTES.length);
  });

  it('self-references its canonical', () => {
    for (const route of STATIC_ROUTES) {
      expect(absoluteUrl(route.path)).toBe(`https://bemoremodest.com${route.path}`);
    }
  });

  it('normalises trailing slashes and query strings out of the canonical', () => {
    expect(canonicalPath('/about/')).toBe('/about');
    expect(canonicalPath('/mens?utm_source=x')).toBe('/mens');
    expect(canonicalPath('/faq#top')).toBe('/faq');
    expect(canonicalPath('/')).toBe('/');
  });

  it('never exposes a phone number or support@ in any route copy', () => {
    const copy = JSON.stringify([COLLECTION_ROUTES, INFO_ROUTES]);
    expect(copy).not.toMatch(/support@/i);
    expect(copy.replace(/2017/g, '')).not.toMatch(PHONE);
  });

  it('keeps Fendi Frost out of all route copy', () => {
    expect(JSON.stringify([COLLECTION_ROUTES, INFO_ROUTES])).not.toMatch(/fendi/i);
  });
});

describe('product schema', () => {
  const base = {
    path: '/product/test-item',
    name: 'Test Item',
    description: 'A real description.',
    images: ['https://cdn.shopify.com/a.jpg'],
    price: '40.00',
    currency: 'USD',
    availability: true,
  };

  it('emits an Offer with the real price, currency, availability and canonical URL', () => {
    const p = productNode(base);
    expect(p.offers['@type']).toBe('Offer');
    expect(p.offers.price).toBe('40.00');
    expect(p.offers.priceCurrency).toBe('USD');
    expect(p.offers.availability).toBe('https://schema.org/InStock');
    expect(p.offers.url).toBe('https://bemoremodest.com/product/test-item');
    expect(p.url).toBe('https://bemoremodest.com/product/test-item');
  });

  it('uses AggregateOffer with a real low/high range when variants differ', () => {
    const p = productNode({
      ...base,
      variants: [
        { name: 'S', price: '40.00', currency: 'USD', availability: true },
        { name: 'M', price: '45.00', currency: 'USD', availability: false },
      ],
    });
    expect(p.offers['@type']).toBe('AggregateOffer');
    expect(p.offers.lowPrice).toBe('40.00');
    expect(p.offers.highPrice).toBe('45.00');
    expect(p.offers.offerCount).toBe(2);
  });

  it('omits sku entirely when the merchant has no real SKU', () => {
    expect(productNode(base).sku).toBeUndefined();
    expect(productNode({ ...base, sku: '1cashmere1F-1' }).sku).toBe('1cashmere1F-1');
  });

  it('invents no ratings, reviews, origin or condition', () => {
    const p = JSON.stringify(productNode({ ...base, sku: 'X1' }));
    for (const field of [
      'aggregateRating',
      'review',
      'countryOfOrigin',
      'itemCondition',
      'manufacturer',
      'award',
    ]) {
      expect(p).not.toContain(field);
    }
  });

  it('points every product at the shared Brand node', () => {
    expect(productNode(base).brand['@id']).toBe(BRAND_ID);
  });
});

describe('material is only taken from merchant tags', () => {
  it('reads a whitelisted material tag', () => {
    expect(materialFromTags(['Cotton', 'Crew neck', 'DTG'])).toEqual(['Cotton']);
  });

  it('never guesses material from a product name', () => {
    expect(materialFromTags(['mens', 'womens'])).toBeUndefined();
    expect(materialFromTags([])).toBeUndefined();
  });
});

describe('product descriptions', () => {
  it('skips a leading size chart and uses the first real prose', () => {
    const { text, source } = machineDescription({
      handle: 'chart-first',
      title: 'Chart First Tee',
      productType: 'T-Shirt',
      price: '25.00',
      currency: 'USD',
      description:
        'S M L XL 2XL 3XL Width, in 18.25 20.25 22.00 24.00 26.00 27.75 Length, in 26.62 28.00 ' +
        'A garment-dyed cotton tee with a subtle hand drawn bear emblem at the chest.',
    });
    expect(source).toBe('prose-extract');
    expect(text.startsWith('A garment-dyed cotton tee')).toBe(true);
  });

  it('keeps a normal description untouched', () => {
    const { text, source } = machineDescription({
      handle: 'normal',
      title: 'Normal',
      description: 'Wrap yourself in luxury with the Big Bear Cashmere Sweater, a timeless piece.',
    });
    expect(source).toBe('shopify');
    expect(text).toContain('Big Bear Cashmere Sweater');
  });

  it('falls back to a composed factual line for a held product', () => {
    const { text, source } = machineDescription({
      handle: 'nutrition-album-tee',
      title: 'Nutrition Album Tee',
      productType: 'T-Shirt',
      price: '40.00',
      currency: 'USD',
      description: 'Official T-Shirt of a held collaboration. More prose that should not ship.',
    });
    expect(source).toBe('composed-held');
    expect(text).toBe('Nutrition Album Tee — t-shirt from MOD#$T (Modest). $40.00 USD.');
    expect(isHeldProduct('nutrition-album-tee')).toBe(true);
  });

  it('clamps on a word boundary', () => {
    const long = `${'word '.repeat(60)}end`;
    const clamped = clampDescription(long);
    expect(clamped.length).toBeLessThanOrEqual(160);
    expect(clamped.endsWith('…')).toBe(true);
  });
});

describe('page-level nodes', () => {
  it('ties every page back to the site and organisation', () => {
    const page = webPageNode({ path: '/about', name: 'About', description: 'x', type: 'AboutPage' });
    expect(page['@type']).toBe('AboutPage');
    expect(page['@id']).toBe('https://bemoremodest.com/about#webpage');
    expect(page.isPartOf['@id']).toBe('https://bemoremodest.com/#website');
    expect(page.about['@id']).toBe('https://bemoremodest.com/#organization');
  });

  it('builds absolute breadcrumb items from route paths', () => {
    const crumbs = breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Men', path: '/mens' },
    ]);
    expect(crumbs.itemListElement[0].item).toBe('https://bemoremodest.com/');
    expect(crumbs.itemListElement[1].item).toBe('https://bemoremodest.com/mens');
    expect(crumbs.itemListElement[1].position).toBe(2);
  });

  it('lists collection members as Products with their real offers', () => {
    const coll = collectionNode({
      path: '/mens',
      name: "Men's Collection",
      description: 'x',
      items: [
        {
          name: 'Big Bear Cashmere Sweater',
          url: 'https://bemoremodest.com/product/big-bear-cashmere-sweater',
          price: '550.0',
          currency: 'USD',
          availability: true,
        },
      ],
    });
    expect(coll.mainEntity.numberOfItems).toBe(1);
    const first = coll.mainEntity.itemListElement[0];
    expect(first.item['@type']).toBe('Product');
    expect(first.item.offers.price).toBe('550.0');
    expect(first.item.brand['@id']).toBe(BRAND_ID);
  });

  it('builds an FAQPage from real question/answer pairs', () => {
    const faq = faqNode([{ question: 'Q?', answer: 'A.' }]);
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });
});
