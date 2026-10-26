import { useEffect } from 'react';
import { SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl, canonicalPath } from '@/lib/site';

interface SeoHeadProps {
  title: string;
  description: string;
  /** Route path. The canonical is always self-referencing to this path. */
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-route head management.
 *
 * The prerenderer writes the same tags into the raw HTML for the initial request;
 * this keeps them correct across client-side navigation. Both read the same route
 * manifest, so the rendered DOM and the raw HTML agree.
 */
/**
 * The prerenderer writes the route's JSON-LD into <head> so non-JS retrievers see
 * it. Once React mounts it renders its own, always-current graph, so the
 * prerendered copies are retired here — otherwise every page would carry the graph
 * twice, and after a client-side navigation the head copy would describe the
 * previous route.
 */
function retirePrerenderedJsonLd() {
  document.head
    .querySelectorAll('script[type="application/ld+json"][data-prerendered-ld]')
    .forEach((el) => el.remove());
}

const SeoHead = ({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
}: SeoHeadProps) => {
  useEffect(() => {
    retirePrerenderedJsonLd();

    const url = absoluteUrl(canonicalPath(path));
    const ogImage = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta(
      'name',
      'robots',
      noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    );
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type === 'product' ? 'product' : 'website');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_US');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:site', '@bemoremodest');
  }, [title, description, path, image, type, noindex]);

  return null;
};

export default SeoHead;
