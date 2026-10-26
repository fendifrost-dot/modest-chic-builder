/**
 * Storefront calls to the Lovable Cloud edge functions.
 *
 * Same project URL and publishable key as `@/integrations/supabase/client`.
 * Paths are `/functions/v1/<name>`. The retired Node routes are not called.
 */

export function storefrontUrl(path: string, base = import.meta.env.VITE_SUPABASE_URL): string {
  if (!base) throw new Error("VITE_SUPABASE_URL is not set");
  const root = String(base).replace(/\/$/, "");
  const clean = path.replace(/^\//, "");
  return `${root}/functions/v1/${clean}`;
}

export async function callFunction(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (key) {
    if (!headers.has("apikey")) headers.set("apikey", key);
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${key}`);
  }
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(storefrontUrl(path), { ...init, headers });
}
