/**
 * Thin React wrappers over the shared schema builders in `src/seo/schema.js`.
 * The prerenderer emits the same graphs into raw HTML, so rendered DOM and
 * raw retrieval agree.
 */
import {
  siteGraph,
  breadcrumbNode,
  webPageNode,
  faqNode,
  collectionNode,
  productNode,
  serializeJsonLd,
} from '@/seo/schema.js';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
  />
);

/** Organization + Brand + Person(founder) + WebSite. Rendered on every route. */
export const SiteJsonLd = () => <JsonLd data={siteGraph()} />;

export const WebPageJsonLd = (props: {
  path: string;
  name: string;
  description: string;
  type?: string;
  primaryImage?: string;
}) => <JsonLd data={webPageNode(props)} />;

export const ProductJsonLd = (props: {
  path: string;
  name: string;
  description: string;
  images: string[];
  price: string;
  currency: string;
  availability: boolean;
  sku?: string;
  material?: string[];
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
}) => <JsonLd data={productNode(props)} />;

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: Array<{ name: string; url?: string; path?: string }>;
}) => <JsonLd data={breadcrumbNode(items)} />;

export const FaqJsonLd = ({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) => <JsonLd data={faqNode(faqs)} />;

export const CollectionJsonLd = (props: {
  path: string;
  name: string;
  description: string;
  items: Array<{
    name: string;
    url: string;
    image?: string;
    price?: string;
    currency?: string;
    availability?: boolean;
  }>;
}) => <JsonLd data={collectionNode(props)} />;

export default JsonLd;
