// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";

// Mock CartDrawer to avoid Shopify dependency
vi.mock("@/components/CartDrawer", () => ({
  CartDrawer: () => <div data-testid="cart-drawer">Cart</div>,
}));

// Spy on navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Header – mobile hamburger menu", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderHeader = () =>
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

  it("renders the hamburger button", () => {
    renderHeader();
    const btn = screen.getByLabelText("Toggle menu");
    expect(btn).toBeInTheDocument();
  });

  it("opens mobile menu drawer on click", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Mens")).toBeInTheDocument();
    expect(screen.getByText("Womens")).toBeInTheDocument();
    expect(screen.getByText("Accessories")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("closes mobile menu when close button is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
  });

  it("closes menu and navigates on nav link click (single tap)", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // Click the "Mens" link in the drawer
    const mensLinks = screen.getAllByText("Mens");
    fireEvent.click(mensLinks[mensLinks.length - 1]);

    // Drawer should close immediately
    expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
  });

  it("backdrop is removed from DOM after menu closes", () => {
    const { container } = renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // Backdrop should exist
    const backdrop = container.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(backdrop).not.toBeNull();

    // Close
    fireEvent.click(screen.getByLabelText("Close menu"));

    // Backdrop must be gone
    const backdropAfter = container.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(backdropAfter).toBeNull();
  });

  it("mobile menu drawer z-index is above welcome modal (z-[71])", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    const drawer = screen.getByLabelText("Close menu").closest(".fixed.inset-0");
    expect(drawer?.className).toContain("z-[71]");
  });
});
