// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "@/components/Footer";

describe("Footer company and support links", () => {
  it("uses permanent routes instead of hash placeholders", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const expected = [
      ["Contact Us", "/contact"],
      ["Shipping Info", "/shipping"],
      ["Returns & Exchanges", "/returns"],
      ["Size Guide", "/size-guide"],
      ["FAQs", "/faq"],
      ["About Us", "/about"],
      ["Careers", "/careers"],
      ["Press", "/press"],
      ["Sustainability", "/sustainability"],
    ];

    for (const [name, href] of expected) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(href.startsWith("#")).toBe(false);
    }
  });
});
