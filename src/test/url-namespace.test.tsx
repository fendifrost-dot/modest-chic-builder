import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { COLLECTION_HANDLE_REDIRECTS, productPath, STATIC_PATHS } from '@/seo/routes.js';

vi.mock('@/lib/shopify', () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
  fetchCollectionProducts: vi.fn().mockResolvedValue([]),
  fetchProductByHandle: vi.fn().mockResolvedValue(null),
  storefrontApiRequest: vi.fn().mockResolvedValue({}),
  createShopifyCart: vi.fn(),
  addLineToShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  removeLineFromShopifyCart: vi.fn(),
  CART_QUERY: '',
}));

const renderAt = async (path: string) => {
  const { default: App } = await import('@/App');
  // App owns its BrowserRouter; render AppContent's route table through MemoryRouter
  // by driving the real app with a pushed history entry instead.
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('URL namespace consolidation', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('routes products under the singular /product namespace', () => {
    expect(productPath('big-bear-cashmere-sweater')).toBe('/product/big-bear-cashmere-sweater');
  });

  it('maps every Shopify collection handle onto a real site route', () => {
    for (const [handle, target] of Object.entries(COLLECTION_HANDLE_REDIRECTS)) {
      expect(STATIC_PATHS, `handle "${handle}" points at a route that does not exist`).toContain(
        target,
      );
    }
  });

  it('sends /products/<handle> to the authoritative product URL', async () => {
    await renderAt('/products/big-bear-cashmere-sweater');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/product/big-bear-cashmere-sweater');
    });
  });

  it('sends /collections/<handle> to the matching category route', async () => {
    await renderAt('/collections/womens');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/womens');
    });
  });

  it('sends an unknown Shopify collection handle to the homepage', async () => {
    await renderAt('/collections/some-handle-that-does-not-exist');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  it('marks an unknown URL noindex', async () => {
    await renderAt('/definitely-not-a-route');
    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
        'noindex, follow',
      );
    });
  });
});
