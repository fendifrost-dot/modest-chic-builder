// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const mockFetchProducts = vi.fn().mockResolvedValue([]);
const mockFetchCollectionProducts = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/shopify", () => ({
  fetchProducts: (...args) => mockFetchProducts(...args),
  fetchCollectionProducts: (...args) => mockFetchCollectionProducts(...args),
}));

vi.mock("@/hooks/useCartSync", () => ({
  useCartSync: vi.fn(),
}));

import Collection from "@/pages/Collection";

describe("Collection routing", () => {
  beforeEach(() => {
    mockFetchProducts.mockClear();
    mockFetchCollectionProducts.mockClear();
  });

  it("renders mens collection page at /mens using tag query (no Shopify collection)", () => {
    render(
      <MemoryRouter initialEntries={["/mens"]}>
        <Routes>
          <Route path="/mens" element={<Collection collection="mens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Men's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Him")).toBeInTheDocument();
    // Mens has no Shopify collection — must use tag-based fetchProducts
    expect(mockFetchProducts).toHaveBeenCalledWith(50, "tag:mens");
    expect(mockFetchCollectionProducts).not.toHaveBeenCalled();
  });

  it("renders womens collection page at /womens using collectionByHandle", () => {
    render(
      <MemoryRouter initialEntries={["/womens"]}>
        <Routes>
          <Route path="/womens" element={<Collection collection="womens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Women's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Her")).toBeInTheDocument();
    // Womens must use collectionByHandle for exact Shopify parity
    expect(mockFetchCollectionProducts).toHaveBeenCalledWith("womens", 50);
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });

  it("renders accessories collection page at /accessories using collectionByHandle", () => {
    render(
      <MemoryRouter initialEntries={["/accessories"]}>
        <Routes>
          <Route path="/accessories" element={<Collection collection="accessories" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Accessories")).toBeInTheDocument();
    expect(screen.getByText("Complete the Look")).toBeInTheDocument();
    // Accessories must use collectionByHandle for exact Shopify parity
    expect(mockFetchCollectionProducts).toHaveBeenCalledWith("accessories", 50);
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });
});
