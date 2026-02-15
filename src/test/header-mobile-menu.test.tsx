// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/Header";

// Mock CartDrawer to avoid Shopify dependency
vi.mock("@/components/CartDrawer", () => ({
  CartDrawer: () => <div data-testid="cart-drawer">Cart</div>,
}));

describe("Header – mobile hamburger menu", () => {
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
    const btn = screen.getByLabelText("Toggle menu");
    fireEvent.click(btn);

    // Drawer should now show nav links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Mens")).toBeInTheDocument();
    expect(screen.getByText("Womens")).toBeInTheDocument();
    expect(screen.getByText("Accessories")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();

    // Close button should be present
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("closes mobile menu when close button is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
  });

  it("closes mobile menu when a nav link is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // Click a link inside the drawer (all links call closeMenu onClick)
    const mensLinks = screen.getAllByText("Mens");
    // The drawer link is the last one rendered
    fireEvent.click(mensLinks[mensLinks.length - 1]);

    // Drawer should be gone
    expect(screen.queryByLabelText("Close menu")).not.toBeInTheDocument();
  });

  it("mobile menu drawer z-index is above welcome modal (z-[71])", () => {
    renderHeader();
    fireEvent.click(screen.getByLabelText("Toggle menu"));

    // The drawer element should have z-[71] class
    const drawer = screen.getByLabelText("Close menu").closest(
      ".fixed.inset-0"
    );
    expect(drawer?.className).toContain("z-[71]");
  });
});
