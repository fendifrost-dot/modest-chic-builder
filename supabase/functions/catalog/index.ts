// GET /catalog?collection=&query=&sort=&limit=
// Mirrors GET /api/catalog from server/api.mjs.

import { corsHeaders, guard, json, preflight } from "../_shared/http.ts";
import { queryProducts } from "../_shared/catalog.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") {
    return Promise.resolve(json({ error: "Method not allowed" }, 405));
  }

  return guard(async () => {
    const params = new URL(req.url).searchParams;
    const { mode, products } = await queryProducts({
      collection: params.get("collection") || undefined,
      query: params.get("query") || undefined,
      sort: params.get("sort") || undefined,
      limit: params.get("limit") || undefined,
    });
    return new Response(JSON.stringify({ mode, products }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  });
});
