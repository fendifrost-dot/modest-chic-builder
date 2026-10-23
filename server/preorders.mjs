import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const defaultPath = join(dirname(fileURLToPath(import.meta.url)), "../content/preorders.json");

export function preordersPath() {
  return process.env.PREORDERS_PATH || defaultPath;
}

export function missingPreorderFields(item) {
  const missing = [];
  if (!String(item?.title || "").trim()) missing.push("title");
  if (!String(item?.expectedShip || "").trim()) missing.push("expectedShip");
  if (!Number.isInteger(item?.priceCents) || item.priceCents <= 0) missing.push("priceCents");
  if (!String(item?.id || "").trim()) missing.push("id");
  return missing;
}

export function isPurchasablePreorder(item) {
  return item?.enabled === true && missingPreorderFields(item).length === 0;
}

export function loadPreorderItems() {
  try {
    const raw = JSON.parse(readFileSync(preordersPath(), "utf8"));
    return Array.isArray(raw?.items) ? raw.items : [];
  } catch {
    return [];
  }
}

function publicImages(item) {
  const listed = Array.isArray(item?.images) ? item.images : [];
  const images = listed
    .map((image) => {
      const src = String(image?.src || "").trim();
      if (!src) return null;
      return {
        src,
        alt: String(image?.alt || "").trim(),
        width: Number.isInteger(image?.width) ? image.width : 1200,
        height: Number.isInteger(image?.height) ? image.height : 1600,
      };
    })
    .filter(Boolean);
  if (images.length === 0 && String(item?.image || "").trim()) {
    images.push({ src: String(item.image).trim(), alt: "", width: 1200, height: 1600 });
  }
  return images;
}

function isListedConcept(item) {
  if (!String(item?.id || "").trim()) return false;
  const copy = String(item.title || item.summary || item.concept || item.colorway || "").trim();
  return Boolean(copy || publicImages(item).length || isPurchasablePreorder(item));
}

export function publicPreorders() {
  const items = loadPreorderItems().filter(isListedConcept).map((item) => {
    const images = publicImages(item);
    const priceCents = Number.isInteger(item.priceCents) ? item.priceCents : null;
    return {
      id: String(item.id),
      handle: String(item.handle || item.id),
      title: String(item.title || "").trim(),
      colorway: String(item.colorway || "").trim(),
      summary: String(item.summary || item.concept || "").trim(),
      expectedShip: String(item.expectedShip || "").trim(),
      priceCents,
      currency: item.currency || "USD",
      image: images[0]?.src || "",
      images,
      purchasable: isPurchasablePreorder(item),
    };
  });
  return { items, awaitingFounder: items.every((item) => !item.purchasable) };
}

export function resolvePreorderItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    throw Object.assign(new Error("Choose a pre-order piece"), { status: 400 });
  }
  const catalog = loadPreorderItems();
  return items.map((item) => {
    const quantity = Number(item?.quantity ?? 1);
    if (!item?.id || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw Object.assign(new Error("Invalid pre-order"), { status: 400 });
    }
    const found = catalog.find((entry) => entry.id === item.id);
    if (!found || !isPurchasablePreorder(found)) {
      throw Object.assign(new Error("That pre-order is not open"), { status: 400 });
    }
    const title = String(found.title).trim();
    const expectedShip = String(found.expectedShip).trim();
    return {
      fulfillment: "preorder",
      productId: String(found.id),
      handle: String(found.handle || found.id),
      title: `Pre-order: ${title}`,
      description: `Pre-order. This piece is not in production yet. Expected ship: ${expectedShip}`,
      expectedShip,
      quantity,
      unitAmount: found.priceCents,
      currency: found.currency || "USD",
    };
  });
}
