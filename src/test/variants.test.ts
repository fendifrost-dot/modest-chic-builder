import { describe, it, expect } from 'vitest';
import {
  findVariantForOptionChange,
  isExactCombinationAvailable,
  isOptionValueInStock,
  visibleProductOptions,
  hasSelectableOptions,
  imagePathKey,
  guessColorHex,
} from '@/lib/variants';

const heartChakra = [
  { id: 'berry-s', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Berry' }, { name: 'Size', value: 'S' }] },
  { id: 'orchid-s', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Orchid' }, { name: 'Size', value: 'S' }] },
  { id: 'berry-m', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Berry' }, { name: 'Size', value: 'M' }] },
  { id: 'ivory-l', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Ivory' }, { name: 'Size', value: 'L' }] },
  { id: 'ivory-xl', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Ivory' }, { name: 'Size', value: 'XL' }] },
];

const hoodie = [
  { id: 'dh-s', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Dark Heather' }, { name: 'Size', value: 'S' }] },
  { id: 'black-s', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'S' }] },
  { id: 'black-4xl', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '4XL' }] },
  { id: 'gold-5xl', availableForSale: false, selectedOptions: [{ name: 'Color', value: 'Gold' }, { name: 'Size', value: '5XL' }] },
  { id: 'black-5xl', availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '5XL' }] },
];

describe('findVariantForOptionChange', () => {
  it('selects an exact color/size combo when it exists', () => {
    const current = heartChakra[0];
    const next = findVariantForOptionChange(heartChakra, current, 'Color', 'Orchid');
    expect(next?.id).toBe('orchid-s');
  });

  it('falls back to the nearest in-stock combo when the matrix is sparse', () => {
    const current = heartChakra[0]; // Berry / S
    const next = findVariantForOptionChange(heartChakra, current, 'Color', 'Ivory');
    expect(next?.id).toBe('ivory-l');
  });

  it('switches color when the clicked size is unavailable in the current color', () => {
    const current = hoodie[0]; // Dark Heather / S
    const next = findVariantForOptionChange(hoodie, current, 'Size', '4XL');
    expect(next?.id).toBe('black-4xl');
  });

  it('prefers in-stock variants over sold-out matches for the same option', () => {
    const current = hoodie[0];
    const next = findVariantForOptionChange(hoodie, current, 'Size', '5XL');
    expect(next?.id).toBe('black-5xl');
  });

  it('returns undefined when the option value does not exist at all', () => {
    const next = findVariantForOptionChange(heartChakra, heartChakra[0], 'Color', 'Neon');
    expect(next).toBeUndefined();
  });
});

describe('availability helpers', () => {
  it('marks missing exact combos as unavailable without blocking a fallback click', () => {
    expect(isExactCombinationAvailable(heartChakra, heartChakra[0], 'Color', 'Ivory')).toBe(false);
    expect(isOptionValueInStock(heartChakra, 'Color', 'Ivory')).toBe(true);
  });

  it('hides the Shopify Title option from pickers', () => {
    const visible = visibleProductOptions([
      { name: 'Size', values: ['S'] },
      { name: 'Title', values: ['Default Title'] },
    ]);
    expect(visible).toHaveLength(1);
    expect(visible[0].name).toBe('Size');
  });

  it('detects selectable options vs default-title-only products', () => {
    expect(hasSelectableOptions([{ name: 'Title', values: ['Default Title'] }])).toBe(false);
    expect(hasSelectableOptions([{ name: 'Size', values: ['S', 'M'] }])).toBe(true);
  });
});

describe('image and color helpers', () => {
  it('compares Shopify CDN images by pathname, ignoring query params', () => {
    const a = 'https://cdn.shopify.com/s/files/1/foo.jpg?v=1';
    const b = 'https://cdn.shopify.com/s/files/1/foo.jpg?v=99';
    expect(imagePathKey(a)).toBe(imagePathKey(b));
  });

  it('guesses a swatch hex from color names like BLACK BEAR', () => {
    expect(guessColorHex('BLACK BEAR')).toBe('#1a1a1a');
    expect(guessColorHex('Heather Olive')).toBe('#556b2f');
    expect(guessColorHex('Unknown')).toBeNull();
  });
});
