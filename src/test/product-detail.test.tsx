// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const heartChakraProduct = {
  id: "printify-1",
  title: "Heart Chakra Bear T-Shirt",
  description: "Minimalist black bear chest graphic.",
  handle: "heart-chakra-bear-t-shirt-minimalist-black-bear-chest-graphic",
  printifyProductId: "printify-1",
  priceRange: { minVariantPrice: { amount: "32.00", currencyCode: "USD" } },
  images: [
    { url: "https://images.example/berry.jpg", alt: "Berry", variantIds: [] },
    { url: "https://images.example/ivory.jpg", alt: "Ivory", variantIds: [] },
  ],
  options: [
    { name: "Color", values: ["Orchid", "Berry", "Ivory"] },
    { name: "Size", values: ["S", "M", "L", "XL"] },
  ],
  variants: [
    {
      id: "berry-s",
      title: "Berry / S",
      price: { amount: "32.00", currencyCode: "USD" },
      unitAmount: 3200,
      availableForSale: true,
      printifyVariantId: 1,
      image: { url: "https://images.example/berry.jpg?v=1", alt: "Berry" },
      selectedOptions: [
        { name: "Color", value: "Berry" },
        { name: "Size", value: "S" },
      ],
    },
    {
      id: "orchid-s",
      title: "Orchid / S",
      price: { amount: "32.00", currencyCode: "USD" },
      unitAmount: 3200,
      availableForSale: true,
      printifyVariantId: 2,
      selectedOptions: [
        { name: "Color", value: "Orchid" },
        { name: "Size", value: "S" },
      ],
    },
    {
      id: "ivory-l",
      title: "Ivory / L",
      price: { amount: "32.00", currencyCode: "USD" },
      unitAmount: 3200,
      availableForSale: true,
      printifyVariantId: 3,
      image: { url: "https://images.example/ivory.jpg?v=9", alt: "Ivory" },
      selectedOptions: [
        { name: "Color", value: "Ivory" },
        { name: "Size", value: "L" },
      ],
    },
  ],
};

vi.mock("@/lib/catalog", () => ({
  fetchProductByHandle: vi.fn(),
}));

vi.mock("@/components/Header", () => ({ default: () => <div>Header</div> }));
vi.mock("@/components/Footer", () => ({ default: () => <div>Footer</div> }));
vi.mock("@/lib/analytics", () => ({ trackViewItem: vi.fn() }));

const addItem = vi.fn().mockReturnValue(true);
vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector) => selector({ addItem, isLoading: false }),
}));

import { fetchProductByHandle } from "@/lib/catalog";
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
