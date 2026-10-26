// GET /preorders
// Mirrors GET /api/preorders. Reads public.preorders instead of a JSON file.

import { guard, json, preflight } from "../_shared/http.ts";
import { publicPreorders } from "../_shared/preorders.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "GET") {
    return Promise.resolve(json({ error: "Method not allowed" }, 405));
  }
  return guard(async () => json(await publicPreorders()));
});
