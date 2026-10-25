/** Environment access. The only platform-specific part of the shared modules. */

export function env(name: string): string | undefined {
  const value = Deno.env.get(name);
  return value == null || value === "" ? undefined : value;
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function envFlag(name: string): boolean {
  return (env(name) || "").toLowerCase() === "true";
}

/**
 * The public site origin, used to build Stripe return URLs.
 *
 * Never derived from request headers. `X-Forwarded-Host` and `Origin` are
 * caller-supplied, so trusting them lets anyone mint a Checkout Session whose
 * success_url points at their own domain.
 */
export function publicOrigin(): string {
  return requireEnv("PUBLIC_ORIGIN").replace(/\/$/, "");
}
