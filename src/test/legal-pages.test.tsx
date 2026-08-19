// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/Header", () => ({ default: () => <div>Header</div> }));
vi.mock("@/components/Footer", () => ({ default: () => <div>Footer</div> }));

import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import PrivacyChoices from "@/pages/PrivacyChoices";
import EmailPreferences from "@/pages/EmailPreferences";
import Newsletter from "@/components/Newsletter";

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Legal and email preference pages", () => {
  it("renders a codebase-specific privacy policy, not a generic we-do-not-sell claim", () => {
    wrap(<Privacy />);
    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByText(/Effective date: August 19, 2026/)).toBeInTheDocument();
    expect(screen.getAllByText(/Shopify checkout/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mailchimp/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Modest Streetwear Apparel Inc\./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8402 S Burley Ave/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Stripe/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Meta Pixel/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/does not send SMS/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/We therefore do not state/i)).toBeInTheDocument();
    expect(screen.getByText(/do not sell personal information/i)).toBeInTheDocument();
  });

  it("renders terms as a draft pending legal review", () => {
    wrap(<Terms />);
    expect(screen.getByRole("heading", { name: "Terms of Use" })).toBeInTheDocument();
    expect(screen.getByText(/Draft for legal review/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Modest Streetwear Apparel Inc\./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8402 S Burley Ave/).length).toBeGreaterThan(0);
    expect(screen.getByText(/governing jurisdiction/i)).toBeInTheDocument();
  });

  it("renders a working Meta Pixel opt-out, not a decorative Do Not Sell label", () => {
    wrap(<PrivacyChoices />);
    expect(screen.getByRole("heading", { name: "Your Privacy Choices" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Access My Information" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Correct My Information" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Delete My Information" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email Preferences" })).toHaveAttribute("href", "/email-preferences");
    expect(screen.getByText(/Shopify Storefront API/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Turn off Meta Pixel on this browser/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /do not sell/i })).not.toBeInTheDocument();
  });

  it("lets visitors unsubscribe without logging in or giving a reason", () => {
    wrap(<EmailPreferences />);
    expect(screen.getByRole("heading", { name: "Email Preferences" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Keep Me Updated/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Unsubscribe From Marketing Emails/i })).toBeInTheDocument();
    expect(screen.queryByText(/why are you unsubscribing/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
});

describe("Newsletter capture language", () => {
  it("explains the list and links the privacy policy", () => {
    wrap(<Newsletter />);
    expect(screen.getByRole("heading", { name: /Join the MOD#\$T list/i })).toBeInTheDocument();
    expect(screen.getByText(/New releases, private drops, restocks and brand updates/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute("href", "/privacy");
  });
});
