import { describe, expect, it } from "vitest";
import { storefrontUrl } from "@/lib/functions";

describe("storefront function URLs", () => {
  const base = "https://example.supabase.co";

  it("calls functions/v1 instead of /api", () => {
    expect(storefrontUrl("catalog?collection=featured", base)).toBe(
      "https://example.supabase.co/functions/v1/catalog?collection=featured",
    );
    expect(storefrontUrl("products/mod-t-bear-classic-logo-sweatshirt", `${base}/`)).toBe(
      "https://example.supabase.co/functions/v1/products/mod-t-bear-classic-logo-sweatshirt",
    );
    expect(storefrontUrl("checkout", base)).toBe("https://example.supabase.co/functions/v1/checkout");
    expect(storefrontUrl("checkout/sessions/cs_test_123", base)).not.toContain("/api/");
    expect(storefrontUrl("preorders", base)).toBe("https://example.supabase.co/functions/v1/preorders");
  });
});
