// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const mockFetchCatalog = vi.fn().mockResolvedValue({ mode: "printify", products: [] });

vi.mock("@/lib/catalog", () => ({
  fetchCatalog: (...args) => mockFetchCatalog(...args),
}));

import Collection from "@/pages/Collection";

describe("Collection routing", () => {
  beforeEach(() => {
    mockFetchCatalog.mockClear();
  });

  it("renders mens collection page at /mens from the Printify mens tag", () => {
    render(
      <MemoryRouter initialEntries={["/mens"]}>
        <Routes>
          <Route path="/mens" element={<Collection collection="mens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Men's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Him")).toBeInTheDocument();
    expect(mockFetchCatalog).toHaveBeenCalledWith({ collection: "mens", limit: 50, sort: undefined });
  });

  it("renders womens collection page at /womens", () => {
    render(
      <MemoryRouter initialEntries={["/womens"]}>
        <Routes>
          <Route path="/womens" element={<Collection collection="womens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Women's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Her")).toBeInTheDocument();
    expect(mockFetchCatalog).toHaveBeenCalledWith({ collection: "womens", limit: 50, sort: undefined });
  });

  it("renders accessories collection page at /accessories", () => {
    render(
      <MemoryRouter initialEntries={["/accessories"]}>
        <Routes>
          <Route path="/accessories" element={<Collection collection="accessories" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Accessories" })).toBeInTheDocument();
    expect(screen.getByText("Complete the Look")).toBeInTheDocument();
    expect(mockFetchCatalog).toHaveBeenCalledWith({ collection: "accessories", limit: 50, sort: undefined });
  });
});
