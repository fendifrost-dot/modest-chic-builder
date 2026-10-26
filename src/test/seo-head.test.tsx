import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SeoHead from '@/components/SeoHead';

const head = (selector: string) => document.head.querySelector(selector);

beforeEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('SeoHead — rendered DOM head management', () => {
  it('writes a self-referencing canonical and matching og:url', async () => {
    render(<SeoHead title="About Modest | MOD#$T" description="About copy." path="/about" />);
    await waitFor(() => {
      expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://bemoremodest.com/about',
      );
    });
    expect(head('meta[property="og:url"]')?.getAttribute('content')).toBe(
      'https://bemoremodest.com/about',
    );
    expect(document.title).toBe('About Modest | MOD#$T');
    expect(head('meta[name="description"]')?.getAttribute('content')).toBe('About copy.');
  });

  it('normalises a path with a trailing slash or query string', async () => {
    render(<SeoHead title="t" description="d" path="/mens/?utm_source=ig" />);
    await waitFor(() => {
      expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://bemoremodest.com/mens',
      );
    });
  });

  it('updates rather than duplicates tags when the route changes', async () => {
    const { rerender } = render(<SeoHead title="a" description="a" path="/mens" />);
    await waitFor(() => expect(head('link[rel="canonical"]')).toBeTruthy());
    rerender(<SeoHead title="b" description="b" path="/womens" />);
    await waitFor(() => {
      expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
        'https://bemoremodest.com/womens',
      );
    });
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:url"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });

  it('retires prerendered JSON-LD so the graph is never emitted twice', async () => {
    const stale = document.createElement('script');
    stale.type = 'application/ld+json';
    stale.setAttribute('data-prerendered-ld', '');
    stale.textContent = '{"@type":"WebPage","url":"https://bemoremodest.com/mens"}';
    document.head.appendChild(stale);

    render(<SeoHead title="t" description="d" path="/womens" />);
    await waitFor(() => {
      expect(
        document.head.querySelectorAll('script[type="application/ld+json"][data-prerendered-ld]'),
      ).toHaveLength(0);
    });
  });

  it('marks a page noindex without withholding link equity', async () => {
    render(<SeoHead title="t" description="d" path="/gone" noindex />);
    await waitFor(() => {
      expect(head('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    });
  });

  it('passes an absolute product image straight through as og:image', async () => {
    render(
      <SeoHead
        title="t"
        description="d"
        path="/product/x"
        image="https://cdn.shopify.com/s/files/1/a.jpg"
        type="product"
      />,
    );
    await waitFor(() => {
      expect(head('meta[property="og:image"]')?.getAttribute('content')).toBe(
        'https://cdn.shopify.com/s/files/1/a.jpg',
      );
    });
    expect(head('meta[property="og:type"]')?.getAttribute('content')).toBe('product');
  });
});
