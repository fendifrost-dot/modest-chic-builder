// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock shopify fetch
vi.mock("@/lib/shopify", () => ({
  fetchProducts: vi.fn().mockResolvedValue([
    {
      node: {
        id: "1",
        handle: "test-product",
        title: "BOMBER JACKET",
        images: { edges: [] },
        priceRange: { minVariantPrice: { amount: "99.00", currencyCode: "USD" } },
        variants: { edges: [{ node: { id: "v1", title: "Default", price: { amount: "99.00", currencyCode: "USD" }, availableForSale: true, selectedOptions: [] } }] },
      },
    },
  ]),
}));

import ProductGrid from "@/components/ProductGrid";

describe("ProductGrid", () => {
  it("renders with correct heading and subtitle", async () => {
    render(
      <MemoryRouter>
        <ProductGrid title="Heart Chakra Collection" subtitle="Essentials" limit={4} />
      </MemoryRouter>
    );
    expect(screen.getByText("Heart Chakra Collection")).toBeInTheDocument();
    expect(screen.getByText("Essentials")).toBeInTheDocument();
  });

  it("transforms product titles to title case", async () => {
    render(
      <MemoryRouter>
        <ProductGrid title="Heart Chakra Collection" subtitle="Essentials" limit={4} />
      </MemoryRouter>
    );
    // Wait for products to load
    const title = await screen.findByText("Bomber Jacket");
    expect(title).toBeInTheDocument();
  });
});
