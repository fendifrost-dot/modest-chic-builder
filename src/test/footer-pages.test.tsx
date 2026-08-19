// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/Header", () => ({ default: () => <div>Header</div> }));
vi.mock("@/components/Footer", () => ({ default: () => <div>Footer</div> }));

import About from "@/pages/About";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Shipping from "@/pages/Shipping";
import Returns from "@/pages/Returns";
import SizeGuide from "@/pages/SizeGuide";
import Faq from "@/pages/Faq";
import Press from "@/pages/Press";
import Sustainability from "@/pages/Sustainability";

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Footer destination pages", () => {
  it("renders About with confirmed brand facts", () => {
    wrap(<About />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("MOD#$T");
    expect(screen.getByText(/Premium streetwear that speaks without shouting/i)).toBeInTheDocument();
    expect(screen.getByText(/Founded in September 2017, the brand creates elevated streetwear/i)).toBeInTheDocument();
    expect(screen.getByText("Terrence Cleveland")).toBeInTheDocument();
    expect(screen.getAllByText(/Fendi Frost/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /Discover Fendi Frost/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Shop MOD#\$T/i })[0]).toHaveAttribute("href", "/#shop");
  });

  it("renders both career openings and an application form", () => {
    wrap(<Careers />);
    expect(screen.getByRole("heading", { name: "Marketing Internship" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Fashion Tech Pack \/ Production Design Assistant/i })).toBeInTheDocument();
    expect(screen.queryByText(/unpaid internship/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Internship structure: Educational objectives, schedule, school-credit considerations where applicable/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position Interested In/i)).toBeInTheDocument();
  });

  it("renders contact topics including order number when needed", () => {
    wrap(<Contact />);
    expect(screen.getByRole("heading", { name: "Contact Us" })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Topic/i)).toBeInTheDocument();
  });

  it("renders shipping, returns, size guide, FAQ, press, and sustainability headings", () => {
    wrap(<Shipping />);
    expect(screen.getByRole("heading", { name: "Shipping Info" })).toBeInTheDocument();
    wrap(<Returns />);
    expect(screen.getByRole("heading", { name: "Returns & Exchanges" })).toBeInTheDocument();
    wrap(<SizeGuide />);
    expect(screen.getByRole("heading", { name: "Size Guide" })).toBeInTheDocument();
    expect(screen.getByText(/How to Measure/i)).toBeInTheDocument();
    wrap(<Faq />);
    expect(screen.getByRole("heading", { name: "FAQs" })).toBeInTheDocument();
    expect(screen.getByText(/Who founded/i)).toBeInTheDocument();
    wrap(<Press />);
    expect(screen.getByRole("heading", { name: "Press & Media" })).toBeInTheDocument();
    expect(screen.queryByText(/Forbes/i)).not.toBeInTheDocument();
    wrap(<Sustainability />);
    expect(screen.getByRole("heading", { name: /Materials, Production & Responsibility/i })).toBeInTheDocument();
    expect(screen.queryByText(/carbon neutral/i)).not.toBeInTheDocument();
  });
});
