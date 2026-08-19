import { describe, it, expect } from 'vitest';
import { buildMailtoHref } from '@/lib/forms';

describe('buildMailtoHref', () => {
  it('encodes a careers application to info@bemoremodest.com', () => {
    const href = buildMailtoHref({
      subject: 'Careers — Marketing Internship — Jane Doe',
      fields: {
        'Full Name': 'Jane Doe',
        Email: 'jane@example.com',
        'Position Interested In': 'Marketing Internship',
      },
    });
    expect(href.startsWith('mailto:info@bemoremodest.com?')).toBe(true);
    expect(href).toContain(encodeURIComponent('Careers — Marketing Internship — Jane Doe'));
    expect(href).toContain(encodeURIComponent('Jane Doe'));
  });
});
