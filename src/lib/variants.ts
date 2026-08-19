export interface SelectedOption {
  name: string;
  value: string;
}

export interface MatchableVariant {
  id: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
}

function optionKey(name: string): string {
  return name.trim().toLowerCase();
}

export function optionsMap(options: SelectedOption[] | undefined): Record<string, string> {
  const map: Record<string, string> = {};
  for (const option of options || []) {
    map[optionKey(option.name)] = option.value;
  }
  return map;
}

export function variantMatchesDesired(
  variant: MatchableVariant,
  desired: Record<string, string>,
): boolean {
  if (variant.selectedOptions.length === 0) return false;
  return variant.selectedOptions.every(
    (option) => desired[optionKey(option.name)] === option.value,
  );
}

export function variantHasOption(
  variant: MatchableVariant,
  optionName: string,
  optionValue: string,
): boolean {
  const name = optionKey(optionName);
  return variant.selectedOptions.some(
    (option) => optionKey(option.name) === name && option.value === optionValue,
  );
}

function matchScore(
  variant: MatchableVariant,
  currentMap: Record<string, string>,
  clickedName: string,
): number {
  let score = variant.availableForSale ? 100 : 0;
  const clicked = optionKey(clickedName);
  for (const option of variant.selectedOptions) {
    const key = optionKey(option.name);
    if (key === clicked) continue;
    if (currentMap[key] === option.value) score += 10;
  }
  return score;
}

/**
 * Resolve a variant after the shopper clicks a size/color (or any option).
 * Prefers an exact combo with the current selection; if that combo does not
 * exist (sparse Shopify matrices), falls back to the closest in-stock match
 * that includes the clicked value so the click always "takes".
 */
export function findVariantForOptionChange<T extends MatchableVariant>(
  variants: T[],
  current: T | undefined,
  optionName: string,
  optionValue: string,
): T | undefined {
  if (variants.length === 0) return undefined;

  const currentMap = optionsMap(current?.selectedOptions);
  const desired = { ...currentMap, [optionKey(optionName)]: optionValue };

  const exact = variants.find((variant) => variantMatchesDesired(variant, desired));
  if (exact) return exact;

  const candidates = variants.filter((variant) =>
    variantHasOption(variant, optionName, optionValue),
  );
  if (candidates.length === 0) return undefined;

  return [...candidates].sort(
    (a, b) => matchScore(b, currentMap, optionName) - matchScore(a, currentMap, optionName),
  )[0];
}

export function isExactCombinationAvailable<T extends MatchableVariant>(
  variants: T[],
  current: T | undefined,
  optionName: string,
  optionValue: string,
): boolean {
  const currentMap = optionsMap(current?.selectedOptions);
  const desired = { ...currentMap, [optionKey(optionName)]: optionValue };
  return Boolean(variants.find((variant) => variantMatchesDesired(variant, desired)));
}

export function isOptionValueInStock<T extends MatchableVariant>(
  variants: T[],
  optionName: string,
  optionValue: string,
): boolean {
  return variants.some(
    (variant) =>
      variant.availableForSale && variantHasOption(variant, optionName, optionValue),
  );
}

export function visibleProductOptions<T extends { name: string }>(options: T[] | undefined): T[] {
  return (options || []).filter((option) => optionKey(option.name) !== 'title');
}

export function hasSelectableOptions(
  options: Array<{ name: string; values: string[] }> | undefined,
): boolean {
  return visibleProductOptions(options).some((option) => option.values.length > 0);
}

export function imagePathKey(url: string | undefined | null): string {
  if (!url) return '';
  try {
    return new URL(url).pathname;
  } catch {
    return url.split('?')[0];
  }
}

const COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f4f1ea',
  ivory: '#f3ead8',
  cream: '#efe6d0',
  natural: '#e8dcc4',
  red: '#9b1c1c',
  maroon: '#7f1d1d',
  berry: '#7c2d4a',
  orchid: '#b565a7',
  pink: '#e8b4c4',
  yellow: '#d4b84a',
  gold: '#c4a35a',
  olive: '#556b2f',
  army: '#4b5320',
  green: '#3f6b4a',
  kelly: '#2f6b4f',
  navy: '#1e2a4a',
  blue: '#4a6fa5',
  silver: '#c0c4c8',
  grey: '#6b6b6b',
  gray: '#6b6b6b',
  charcoal: '#3a3a3a',
  asphalt: '#3d3d40',
  heather: '#8a8f86',
  brown: '#6b4a32',
  mustard: '#c4a035',
};

export function guessColorHex(value: string): string | null {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (COLOR_HEX[tokens[i]]) return COLOR_HEX[tokens[i]];
  }
  return null;
}

export function isColorOption(name: string): boolean {
  return optionKey(name) === 'color' || optionKey(name) === 'colour';
}

export function isSizeOption(name: string): boolean {
  return optionKey(name) === 'size';
}
