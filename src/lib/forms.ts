import { SITE_EMAIL } from '@/lib/site';

export interface SiteFormPayload {
  subject: string;
  fields: Record<string, string>;
}

function formatBody(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value.trim()}`)
    .join('\n');
}

export function buildMailtoHref(payload: SiteFormPayload): string {
  const body = formatBody(payload.fields);
  return `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(body)}`;
}

/** Opens a prefilled email to the Modest inbox. No extra PII is stored in the app. */
export async function submitSiteForm(payload: SiteFormPayload): Promise<void> {
  const href = buildMailtoHref(payload);
  window.location.href = href;
}
