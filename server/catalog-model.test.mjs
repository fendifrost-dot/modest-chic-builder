import assert from "node:assert/strict";
import test from "node:test";
import { listProducts, resetCatalogCache } from "./catalog.mjs";
import {
  PRINTIFY_CATALOG_SHOP_ID,
  VISIBLE_CATALOG_TITLES,
  filterCatalog,
  isLegacyJacket,
  isLegacyJacketPath,
  isPrintifyVisible,
  normalizePrintifyProduct,
  previewProducts,
  resolvePrintifyShopId,
} from "./catalog-model.mjs";

function rawProduct(id, title, visible) {
  return {
    id,
    title,
    visible,
    tags: [],
    options: [],
    images: [],
    variants: [{ id: 1, price: 3200, is_enabled: true, is_available: true, options: [] }],
  };
}

test("preview catalog skips jackets and covers the live collections", () => {
  const products = previewProducts();
  assert.deepEqual(products.map((product) => product.title), VISIBLE_CATALOG_TITLES);
  assert.equal(products.some((product) => isLegacyJacket(product)), false);
  assert.ok(filterCatalog(products, { collection: "featured" }).length >= 3);
  assert.ok(filterCatalog(products, { collection: "mens" }).length >= 1);
  assert.ok(filterCatalog(products, { collection: "womens" }).length >= 1);
  assert.equal(filterCatalog(products, { collection: "accessories" }).length, 0);
  assert.equal(filterCatalog(products, { collection: "sale" }).length, 0);
});

test("hidden Printify products never enter the catalog", () => {
  assert.equal(isPrintifyVisible({ visible: true }), true);
  assert.equal(isPrintifyVisible({ visible: false }), false);
  assert.equal(isPrintifyVisible({ visible: "false" }), false);
  assert.equal(isPrintifyVisible({}), false);
  const visible = VISIBLE_CATALOG_TITLES.map((title, index) => rawProduct(`p${index}`, title, true));
  const hidden = rawProduct("hidden-1", "Unpublished piece", false);
  const products = [...visible, hidden].map((row) => normalizePrintifyProduct(row)).filter(Boolean);
  assert.deepEqual(
    products.map((product) => product.title),
    VISIBLE_CATALOG_TITLES,
  );
  assert.equal(products.some((product) => product.title === "Unpublished piece"), false);
});

test("catalog fetch uses shop 8464572 and skips visible false", async () => {
  const previousToken = process.env.PRINTIFY_API_TOKEN;
  const previousShop = process.env.PRINTIFY_SHOP_ID;
  process.env.PRINTIFY_API_TOKEN = "test-token";
  delete process.env.PRINTIFY_SHOP_ID;
  resetCatalogCache();
  const urls = [];
  try {
    const listed = await listProducts({
      force: true,
      fetchImpl: async (url) => {
        urls.push(String(url));
        return {
          ok: true,
          text: async () => "",
          json: async () => ({
            last_page: 1,
            data: [
              rawProduct("care", "MOD#$T Care Bear", true),
              rawProduct("hidden", "Unpublished piece", false),
              { ...rawProduct("missing", "Missing visibility", true), visible: undefined },
            ],
          }),
        };
      },
    });
    assert.equal(listed.mode, "printify");
    assert.match(urls[0], new RegExp(`/shops/${PRINTIFY_CATALOG_SHOP_ID}/products`));
    assert.deepEqual(listed.products.map((product) => product.title), ["MOD#$T Care Bear"]);
    process.env.PRINTIFY_SHOP_ID = "8464467";
    await assert.rejects(() => listProducts({ force: true, fetchImpl: async () => { throw new Error("should not fetch"); } }), /empty shop/);
    assert.throws(() => resolvePrintifyShopId("8464467"), /8464572/);
  } finally {
    if (previousToken == null) delete process.env.PRINTIFY_API_TOKEN;
    else process.env.PRINTIFY_API_TOKEN = previousToken;
    if (previousShop == null) delete process.env.PRINTIFY_SHOP_ID;
    else process.env.PRINTIFY_SHOP_ID = previousShop;
    resetCatalogCache();
  }
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
