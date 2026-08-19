import { describe, it, expect, beforeEach } from "vitest";
import {
  META_ADS_OPT_OUT_KEY,
  isMetaAdvertisingOptedOut,
  setMetaAdvertisingOptOut,
} from "@/lib/ad-choices";

describe("Meta advertising opt-out", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to allowing the pixel", () => {
    expect(isMetaAdvertisingOptedOut()).toBe(false);
  });

  it("persists an opt-out in localStorage", () => {
    setMetaAdvertisingOptOut(true);
    expect(localStorage.getItem(META_ADS_OPT_OUT_KEY)).toBe("1");
    expect(isMetaAdvertisingOptedOut()).toBe(true);
  });

  it("clears the opt-out flag when allowing the pixel again", () => {
    setMetaAdvertisingOptOut(true);
    setMetaAdvertisingOptOut(false);
    expect(localStorage.getItem(META_ADS_OPT_OUT_KEY)).toBeNull();
    expect(isMetaAdvertisingOptedOut()).toBe(false);
  });
});
