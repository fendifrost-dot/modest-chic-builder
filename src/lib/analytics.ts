declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(gaScript);
  }

  if (META_PIXEL_ID) {
    const fbq = function fbq(...args: unknown[]) {
      if ((fbq as typeof fbq & { callMethod?: (...a: unknown[]) => void }).callMethod) {
        (fbq as typeof fbq & { callMethod: (...a: unknown[]) => void }).callMethod(...args);
      } else {
        (fbq as typeof fbq & { queue: unknown[] }).queue.push(args);
      }
    } as typeof window.fbq & { queue: unknown[]; loaded?: boolean; version?: string; callMethod?: (...a: unknown[]) => void };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    window._fbq = fbq;

    const pixelScript = document.createElement('script');
    pixelScript.async = true;
    pixelScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(pixelScript);

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
}

export function trackPageView(path: string) {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
  if (META_PIXEL_ID && window.fbq) {
    window.fbq('track', 'PageView');
  }
}

export function trackViewItem({
  id,
  name,
  price,
  currency,
}: {
  id: string;
  name: string;
  price: string;
  currency: string;
}) {
  if (GA_ID && window.gtag) {
    window.gtag('event', 'view_item', {
      currency,
      value: parseFloat(price),
      items: [{ item_id: id, item_name: name, price: parseFloat(price) }],
    });
  }
  if (META_PIXEL_ID && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [id],
      content_name: name,
      content_type: 'product',
      value: parseFloat(price),
      currency,
    });
  }
}

export function isAnalyticsConfigured() {
  return Boolean(GA_ID || META_PIXEL_ID);
}
