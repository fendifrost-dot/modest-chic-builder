// @ts-nocheck
import { describe, it, expect } from "vitest";
import { fetchProducts, fetchCollectionProducts } from "@/lib/shopify";

// This test performs a LIVE API audit — comparing tag-based vs collectionByHandle results.
// Run once to generate the diff, then switch implementation.

describe("Inventory parity audit: tag-based vs collectionByHandle", () => {
  const TIMEOUT = 30_000;

  const collections = [
    { handle: "mens", tag: "mens", label: "Mens" },
    { handle: "womens", tag: "womens", label: "Womens" },
    { handle: "accessories", tag: "accessories", label: "Accessories" },
  ];

  for (const col of collections) {
    it(`${col.label}: collectionByHandle("${col.handle}") vs tag:${col.tag}`, async () => {
      const [tagProducts, handleProducts] = await Promise.all([
        fetchProducts(250, `tag:${col.tag}`),
        fetchCollectionProducts(col.handle, 250),
      ]);

      const tagHandles = new Set(tagProducts.map((p) => p.node.handle));
      const collHandles = new Set(handleProducts.map((p) => p.node.handle));

      const missingInLovable = [...collHandles].filter((h) => !tagHandles.has(h));
      const extraInLovable = [...tagHandles].filter((h) => !collHandles.has(h));

      console.log(`\n=== ${col.label} AUDIT ===`);
      console.log(`Tag query count: ${tagProducts.length}`);
      console.log(`collectionByHandle count: ${handleProducts.length}`);
      console.log(`Tag handles:`, [...tagHandles].sort());
      console.log(`Collection handles:`, [...collHandles].sort());
      console.log(`Missing in Lovable (in Shopify collection but not tag query):`, missingInLovable);
      console.log(`Extra in Lovable (in tag query but not Shopify collection):`, extraInLovable);

      // Just log — don't assert yet so we get all data
      expect(true).toBe(true);
    }, TIMEOUT);
  }
});
