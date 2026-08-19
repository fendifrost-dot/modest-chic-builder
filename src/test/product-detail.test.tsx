// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const heartChakraProduct = {
  id: "gid://shopify/Product/1",
  title: "Heart Chakra Bear T-Shirt",
  description: "Minimalist black bear chest graphic.",
  handle: "heart-chakra-bear-t-shirt-minimalist-black-bear-chest-graphic",
  priceRange: { minVariantPrice: { amount: "32.00", currencyCode: "USD" } },
  images: {
    edges: [
      { node: { url: "https://cdn.shopify.com/s/files/1/berry.jpg", altText: "Berry" } },
      { node: { url: "https://cdn.shopify.com/s/files/1/ivory.jpg", altText: "Ivory" } },
    ],
  },
  options: [
    { name: "Color", values: ["Orchid", "Berry", "Ivory"] },
    { name: "Size", values: ["S", "M", "L", "XL"] },
  ],
  variants: {
    edges: [
      {
        node: {
          id: "berry-s",
          title: "Berry / S",
          price: { amount: "32.00", currencyCode: "USD" },
          availableForSale: true,
          image: { url: "https://cdn.shopify.com/s/files/1/berry.jpg?v=1", altText: "Berry" },
          selectedOptions: [
            { name: "Color", value: "Berry" },
            { name: "Size", value: "S" },
          ],
        },
      },
      {
        node: {
          id: "orchid-s",
          title: "Orchid / S",
          price: { amount: "32.00", currencyCode: "USD" },
          availableForSale: true,
          selectedOptions: [
            { name: "Color", value: "Orchid" },
            { name: "Size", value: "S" },
          ],
        },
      },
      {
        node: {
          id: "ivory-l",
          title: "Ivory / L",
          price: { amount: "32.00", currencyCode: "USD" },
          availableForSale: true,
          image: { url: "https://cdn.shopify.com/s/files/1/ivory.jpg?v=9", altText: "Ivory" },
          selectedOptions: [
            { name: "Color", value: "Ivory" },
            { name: "Size", value: "L" },
          ],
        },
      },
    ],
  },
};

vi.mock("@/lib/shopify", () => ({
  fetchProductByHandle: vi.fn(),
}));

vi.mock("@/components/Header", () => ({ default: () => <div>Header</div> }));
vi.mock("@/components/Footer", () => ({ default: () => <div>Footer</div> }));
vi.mock("@/lib/analytics", () => ({ trackViewItem: vi.fn() }));

const addItem = vi.fn().mockResolvedValue(true);
vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector) => selector({ addItem, isLoading: false }),
}));

import { fetchProductByHandle } from "@/lib/shopify";
import ProductDetail from "@/pages/ProductDetail";

describe("ProductDetail option selection", () => {
  beforeEach(() => {
    addItem.mockClear();
    fetchProductByHandle.mockResolvedValue(heartChakraProduct);
  });

  const renderPdp = () =>
    render(
      <MemoryRouter initialEntries={["/product/heart-chakra-bear-t-shirt-minimalist-black-bear-chest-graphic"]}>
        <Routes>
          <Route path="/product/:handle" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );

  it("selects a color that has no match in the current size by falling back to a valid combo", async () => {
    renderPdp();
    const ivory = await screen.findByRole("option", { name: /Color Ivory/i });
    fireEvent.click(ivory);

    await waitFor(() => {
      expect(screen.getByText("Ivory", { selector: "span.text-gold" })).toBeInTheDocument();
    });
    expect(screen.getByText("L", { selector: "span.text-gold" })).toBeInTheDocument();
  });

  it("highlights the clicked color when an exact combo exists", async () => {
    renderPdp();
    const orchid = await screen.findByRole("option", { name: /Color Orchid/i });
    fireEvent.click(orchid);
    await waitFor(() => {
      expect(orchid).toHaveAttribute("aria-selected", "true");
    });
  });
});
