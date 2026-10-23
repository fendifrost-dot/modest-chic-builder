import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const ROOTS = ["src", "server", "scripts", "public"];
const FORBIDDEN = [
  /myshopify\.com/i,
  /storefrontApiRequest/,
  /X-Shopify-Storefront-Access-Token/,
  /a2c0b8ea61ed91424a63a92e2135e275/,
  /VITE_SHOPIFY_/,
  /SHOPIFY_STOREFRONT/,
  /SHOPIFY_ACCESS_TOKEN/,
];

function files(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, acc);
    else acc.push(path);
  }
  return acc;
}

test("runtime source has no Shopify client, token, or checkout host", () => {
  const hits = [];
  for (const root of ROOTS) {
    for (const path of files(root)) {
      if (path.endsWith(".test.mjs") || path.endsWith(".test.ts") || path.endsWith(".test.tsx")) continue;
      const text = readFileSync(path, "utf8");
      for (const pattern of FORBIDDEN) {
        if (pattern.test(text)) hits.push(`${path} matches ${pattern}`);
      }
    }
  }
  assert.deepEqual(hits, []);
});
