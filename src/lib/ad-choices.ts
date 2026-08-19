/** Browser-level opt-out for Meta Pixel advertising on bemoremodest.com. */

export const META_ADS_OPT_OUT_KEY = 'modest_meta_ads_opt_out';

export function hasGlobalPrivacyControl(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function isMetaAdvertisingOptedOut(): boolean {
  if (hasGlobalPrivacyControl()) return true;
  try {
    return localStorage.getItem(META_ADS_OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMetaAdvertisingOptOut(optOut: boolean): void {
  try {
    if (optOut) {
      localStorage.setItem(META_ADS_OPT_OUT_KEY, '1');
    } else {
      localStorage.removeItem(META_ADS_OPT_OUT_KEY);
    }
  } catch {
    // Private mode may block storage; GPC still applies when present.
  }
}
