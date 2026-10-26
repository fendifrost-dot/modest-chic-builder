// GET /products/:handle
// Mirrors GET /api/products/:handle from server/api.mjs.

import { corsHeaders, guard, json, preflight, subPath } from "../_shared/http.ts";
import { productByHandle } from "../_shared/catalog.ts";
import { LEGACY_JACKET_HANDLES } from "../_shared/catalog-model.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") {
    return Promise.resolve(json({ error: "Method not allowed" }, 405));
  }

  return guard(async () => {
    const [raw] = subPath(req, "products");
    if (!raw) return json({ error: "Product not found" }, 404);
    const handle = decodeURIComponent(raw);

    // Legacy jacket SKUs were never migrated. 410 tells crawlers they are gone
    // for good, rather than 404 implying it might come back.
    if (LEGACY_JACKET_HANDLES.includes(handle)) {
      return json({ error: "This piece is no longer offered", gone: true }, 410);
    }

    const { mode, product } = await productByHandle(handle);
    if (!product) return json({ error: "Product not found" }, 404);

    return new Response(JSON.stringify({ mode, product }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  });
});
