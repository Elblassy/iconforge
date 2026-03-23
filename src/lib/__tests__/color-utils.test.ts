import { describe, it, expect } from "vitest";
import { shadeColor, hexToRgba } from "../color-utils";

describe("shadeColor", () => {
  it("darkens a color when percent is negative", () => {
    const result = shadeColor("#ffffff", -50);
    // darkening white by 50% should give a grey-ish color
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    // The result should be darker than white
    const r = parseInt(result.slice(1, 3), 16);
    expect(r).toBeLessThan(255);
  });

  it("lightens a color when percent is positive", () => {
    const result = shadeColor("#000000", 50);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    // The result should be lighter than black
    const r = parseInt(result.slice(1, 3), 16);
    expect(r).toBeGreaterThan(0);
  });

  it("returns same color when percent is zero", () => {
    const result = shadeColor("#714BC2", 0);
    expect(result.toLowerCase()).toBe("#714bc2");
  });
});

describe("hexToRgba", () => {
  it("converts hex to rgba string", () => {
    const result = hexToRgba("#ff0000", 0.5);
    expect(result).toBe("rgba(255, 0, 0, 0.5)");
  });

  it("converts hex with full opacity", () => {
    const result = hexToRgba("#000000", 1);
    expect(result).toBe("rgba(0, 0, 0, 1)");
  });

  it("converts hex with zero opacity", () => {
    const result = hexToRgba("#ffffff", 0);
    expect(result).toBe("rgba(255, 255, 255, 0)");
  });
});
