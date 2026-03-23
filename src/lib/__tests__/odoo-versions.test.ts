import { describe, it, expect } from "vitest";
import { getVersionConfig, ODOO_VERSIONS } from "../odoo-versions";

describe("getVersionConfig", () => {
  it("returns correct params for 16.0", () => {
    const config = getVersionConfig("16.0");
    expect(config.cornerRadiusPercent).toBe(0.047);
    expect(config.gradientAlpha).toBe(0.2);
    expect(config.innerShadowAlpha).toBe(0.4);
    expect(config.hardShadowDarken).toBe(-0.4);
    expect(config.dropShadowOffsetPercent).toBe(0.02);
    expect(config.dropShadowAlpha).toBe(0.4);
    expect(config.hasHardShadow).toBe(true);
  });

  it("returns correct params for 18.0", () => {
    const config = getVersionConfig("18.0");
    expect(config.cornerRadiusPercent).toBe(0.055);
    expect(config.gradientAlpha).toBe(0.1);
    expect(config.innerShadowAlpha).toBe(0.2);
    expect(config.hardShadowDarken).toBe(0);
    expect(config.dropShadowOffsetPercent).toBe(0.015);
    expect(config.dropShadowAlpha).toBe(0.2);
    expect(config.hasHardShadow).toBe(false);
  });

  it("v19 aliases v18 config", () => {
    const config18 = getVersionConfig("18.0");
    const config19 = getVersionConfig("19.0");
    expect(config19).toEqual(config18);
  });
});

describe("ODOO_VERSIONS", () => {
  it("has 4 entries", () => {
    expect(ODOO_VERSIONS).toHaveLength(4);
  });

  it("contains all expected versions", () => {
    expect(ODOO_VERSIONS).toContain("16.0");
    expect(ODOO_VERSIONS).toContain("17.0");
    expect(ODOO_VERSIONS).toContain("18.0");
    expect(ODOO_VERSIONS).toContain("19.0");
  });
});
