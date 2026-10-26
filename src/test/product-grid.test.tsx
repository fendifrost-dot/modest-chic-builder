// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/lib/catalog", () => ({
  fetchCatalog: vi.fn().mockResolvedValue({
    mode: "printify",
    products: [
      {
        id: "1",
        handle: "test-product",
        title: "HEART CHAKRA BEAR T-SHIRT",
        images: [],
        priceRange: { minVariantPrice: { amount: "25.00", currencyCode: "USD" } },
        options: [],
        variants: [{ id: "v1", title: "Default", price: { amount: "25.00", currencyCode: "USD" }, availableForSale: true, selectedOptions: [], printifyVariantId: 1 }],
        printifyProductId: "1",
      },
    ],
  }),
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
    const title = await screen.findByText("Heart Chakra Bear T-Shirt");
    expect(title).toBeInTheDocument();
  });
});
