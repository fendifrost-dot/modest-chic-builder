/** Shared response helpers and CORS for the storefront edge functions. */

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message);
}

export function json(body: unknown, status = 200, cache = "no-store"): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  });
}

export function preflight(): Response {
  return new Response(null, { headers: corsHeaders });
}

/** Wraps a handler so thrown HttpErrors become their status and everything else is a 500. */
export async function guard(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Server error";
    if (status >= 500) console.error("edge function error:", message);
    return json({ error: message }, status);
  }
}

/**
 * Path segments after the function name.
 *
 * Supabase invokes a function at /functions/v1/<name>/<rest>. Anchoring on the
 * function name keeps nested paths such as /checkout/sessions/:id working.
 */
export function subPath(req: Request, functionName: string): string[] {
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const index = segments.lastIndexOf(functionName);
  return index === -1 ? [] : segments.slice(index + 1);
}
