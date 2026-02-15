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

  it("renders mens collection page at /mens using collectionByHandle('frontpage')", () => {
    render(
      <MemoryRouter initialEntries={["/mens"]}>
        <Routes>
          <Route path="/mens" element={<Collection collection="mens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Men's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Him")).toBeInTheDocument();
    // Mens must use collectionByHandle("frontpage") for exact Shopify parity
    expect(mockFetchCollectionProducts).toHaveBeenCalledWith("frontpage", 50);
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });

  it("renders womens collection page at /womens using collectionByHandle('womens')", () => {
    render(
      <MemoryRouter initialEntries={["/womens"]}>
        <Routes>
          <Route path="/womens" element={<Collection collection="womens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Women's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Her")).toBeInTheDocument();
    expect(mockFetchCollectionProducts).toHaveBeenCalledWith("womens", 50);
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });

  it("renders accessories collection page at /accessories using collectionByHandle('accessories')", () => {
    render(
      <MemoryRouter initialEntries={["/accessories"]}>
        <Routes>
          <Route path="/accessories" element={<Collection collection="accessories" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Accessories" })).toBeInTheDocument();
    expect(screen.getByText("Complete the Look")).toBeInTheDocument();
    expect(mockFetchCollectionProducts).toHaveBeenCalledWith("accessories", 50);
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });
});
