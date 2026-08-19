import { useEffect } from 'react';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/site';

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
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

const SeoHead = ({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
}: SeoHeadProps) => {
  useEffect(() => {
    const url = absoluteUrl(path);
    const ogImage = image || DEFAULT_OG_IMAGE;

    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type === 'product' ? 'product' : 'website');
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');

    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    upsertMeta('meta[name="twitter:site"]', 'name', 'twitter:site', '@bemoremodest');
  }, [title, description, path, image, type, noindex]);

  return null;
};

export default SeoHead;

export { SITE_URL };
