// @ts-nocheck
import { describe, it } from "vitest";
import { fetchCollectionProducts } from "@/lib/shopify";

// Probe various collection handle candidates
describe("Collection handle discovery", () => {
  const candidates = [
    "mens", "men", "mens-collection", "men-s", "male",
    "womens", "women", "womens-collection", "women-s", "female",
    "accessories", "accessories-collection",
    "all", "frontpage", "heart-chakra-collection",
    "bear", "BEAR",
  ];

  for (const handle of candidates) {
    it(`handle: "${handle}"`, async () => {
      const products = await fetchCollectionProducts(handle, 250);
      console.log(`"${handle}" => ${products.length} products`, products.map(p => p.node.handle));
    }, 15000);
  }
});
