import type { OdooVersion, OdooVersionConfig } from "@/types/icon-config";

const VERSION_CONFIGS: Record<OdooVersion, OdooVersionConfig> = {
  "16.0": {
    cornerRadiusPercent: 0.047,
    gradientAlpha: 0.2,
    innerShadowAlpha: 0.4,
    hardShadowDarken: -0.4,
    dropShadowOffsetPercent: 0.02,
    dropShadowAlpha: 0.4,
    hasHardShadow: true,
  },
  "17.0": {
    cornerRadiusPercent: 0.047,
    gradientAlpha: 0.15,
    innerShadowAlpha: 0.3,
    hardShadowDarken: -0.25,
    dropShadowOffsetPercent: 0.02,
    dropShadowAlpha: 0.3,
    hasHardShadow: true,
  },
  "18.0": {
    cornerRadiusPercent: 0.055,
    gradientAlpha: 0.1,
    innerShadowAlpha: 0.2,
    hardShadowDarken: 0,
    dropShadowOffsetPercent: 0.015,
    dropShadowAlpha: 0.2,
    hasHardShadow: false,
  },
  "19.0": {
    cornerRadiusPercent: 0.055,
    gradientAlpha: 0.1,
    innerShadowAlpha: 0.2,
    hardShadowDarken: 0,
    dropShadowOffsetPercent: 0.015,
    dropShadowAlpha: 0.2,
    hasHardShadow: false,
  },
};

export const ODOO_VERSIONS: OdooVersion[] = ["16.0", "17.0", "18.0", "19.0"];

export function getVersionConfig(version: OdooVersion): OdooVersionConfig {
  return VERSION_CONFIGS[version];
}
