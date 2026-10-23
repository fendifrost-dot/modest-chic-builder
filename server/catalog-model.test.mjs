import assert from "node:assert/strict";
import test from "node:test";
import {
  filterCatalog,
  isLegacyJacket,
  isLegacyJacketPath,
  normalizePrintifyProduct,
  previewProducts,
} from "./catalog-model.mjs";

test("preview catalog skips jackets and covers the live collections", () => {
  const products = previewProducts();
  assert.equal(products.some((product) => isLegacyJacket(product)), false);
  assert.ok(filterCatalog(products, { collection: "featured" }).length >= 3);
  assert.ok(filterCatalog(products, { collection: "mens" }).length >= 1);
  assert.ok(filterCatalog(products, { collection: "womens" }).length >= 1);
  assert.ok(filterCatalog(products, { collection: "accessories" }).length >= 1);
  assert.equal(filterCatalog(products, { collection: "sale" }).length, 0);
});

test("Printify normalization drops legacy jackets and skipped SKUs", () => {
  const jacket = normalizePrintifyProduct({
    id: "jacket-1",
    title: "Ketchup Mustard Varsity Jacket",
    visible: true,
    tags: ["mens"],
    variants: [{ id: 1, price: 18000, is_enabled: true, is_available: true, sku: "JKT-OLD", options: [] }],
    images: [],
    options: [],
  });
  assert.equal(jacket, null);

  const kept = normalizePrintifyProduct(
    {
      id: "tee-1",
      title: "Studio Tee",
      visible: true,
      tags: ["mens"],
      description: "<p>Heavy cotton</p>",
      options: [{ name: "Sizes", type: "size", values: [{ id: 10, title: "M" }] }],
      variants: [
        { id: 9, price: 4800, is_enabled: true, is_available: true, sku: "OLD-JACKET-SKU", title: "M", options: [10] },
        { id: 8, price: 4800, is_enabled: true, is_available: true, sku: "TEE-M", title: "M", options: [10] },
      ],
      images: [{ src: "https://images.example/tee.jpg", variant_ids: [8], is_default: true }],
    },
    new Set(["OLD-JACKET-SKU"]),
  );
  assert.equal(kept.variants.length, 1);
  assert.equal(kept.variants[0].sku, "TEE-M");
  assert.equal(kept.variants[0].price.amount, "48.00");
  assert.equal(kept.variants[0].selectedOptions[0].name, "Size");
  assert.equal(kept.description, "Heavy cotton");
  assert.equal(isLegacyJacketPath("/product/bzo-bomber-jacket"), true);
  assert.equal(isLegacyJacketPath("/product/studio-tee"), false);
});

test("include-jacket tag keeps a future jacket drop", () => {
  const product = normalizePrintifyProduct({
    id: "later",
    title: "Future Varsity Jacket",
    visible: true,
    tags: ["include-jacket"],
    variants: [{ id: 3, price: 25000, is_enabled: true, is_available: true, options: [] }],
    images: [],
    options: [],
  });
  assert.equal(product.title, "Future Varsity Jacket");
});
