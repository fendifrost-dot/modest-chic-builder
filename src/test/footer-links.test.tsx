// @ts-nocheck
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "@/components/Footer";

const expectRoute = (name, href, { exact = false } = {}) => {
  const links = screen.getAllByRole("link", { name, exact });
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link).toHaveAttribute("href", href);
  }
};

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
      ["Privacy Policy", "/privacy"],
      ["Terms of Use", "/terms"],
    ];

    for (const [name, href] of expected) {
      expectRoute(name, href);
    }

    expectRoute("Privacy", "/privacy", { exact: true });
    expectRoute("Terms", "/terms", { exact: true });
    expectRoute("Privacy Choices", "/privacy-choices");
    expectRoute("Email Preferences", "/email-preferences");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs.every((href) => href && href !== "#")).toBe(true);
    expect(screen.getByText(/© \d{4} MOD#\$T\. All rights reserved\./)).toBeInTheDocument();
  });
});
