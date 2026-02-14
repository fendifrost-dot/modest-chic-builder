// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("@/lib/shopify", () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/hooks/useCartSync", () => ({
  useCartSync: vi.fn(),
}));

import Collection from "@/pages/Collection";

describe("Collection routing", () => {
  it("renders mens collection page at /mens", () => {
    render(
      <MemoryRouter initialEntries={["/mens"]}>
        <Routes>
          <Route path="/mens" element={<Collection collection="mens" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Men's Collection")).toBeInTheDocument();
    expect(screen.getByText("For Him")).toBeInTheDocument();
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
  });

  it("renders accessories collection page at /accessories", () => {
    render(
      <MemoryRouter initialEntries={["/accessories"]}>
        <Routes>
          <Route path="/accessories" element={<Collection collection="accessories" />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Accessories")).toBeInTheDocument();
    expect(screen.getByText("Complete the Look")).toBeInTheDocument();
  });
});
