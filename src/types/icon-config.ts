export type OdooVersion = "16.0" | "17.0" | "18.0" | "19.0";

export interface LogoOverlay {
  imageDataUrl: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  size: number; // percentage of icon width, 10-50, default 25
}

export type IconSource =
  | {
      type: "icon";
      iconSet: string;
      iconClass: string;
      unicodeChar?: string;
    }
  | {
      type: "text";
      text: string;
      fontFamily: string;
    }
  | {
      type: "image";
      imageDataUrl: string;
    };

/** Icon color modes inspired by Odoo's actual icon design system */
export type IconColorMode = "solid" | "tinted" | "complementary" | "tricolor";

export interface IconColorConfig {
  mode: IconColorMode;
  color1: string; // primary color
  color2: string; // secondary color (used in complementary/tricolor)
  color3: string; // tertiary color (used in tricolor)
}

export interface IconConfig {
  odooVersion: OdooVersion;
  source: IconSource;
  backgroundColor: string;
  iconColor: string;
  iconWidth: number;
  fontSize: number;
  fontWeight: 300 | 400 | 700 | 900;
  gradientIntensity?: number;
  shadowIntensity?: number;
  cornerRadiusOverride?: number;
  logoOverlay?: LogoOverlay;
  colorConfig?: IconColorConfig;
}

export interface SavedIcon {
  id: string;
  name: string;
  config: IconConfig;
  thumbnail: string;
  createdAt: number;
}

export interface OdooVersionConfig {
  cornerRadiusPercent: number;
  gradientAlpha: number;
  innerShadowAlpha: number;
  hardShadowDarken: number;
  dropShadowOffsetPercent: number;
  dropShadowAlpha: number;
  hasHardShadow: boolean;
}

/** Odoo standard module icon size */
export const ICON_SIZE = 128;

export const DEFAULT_CONFIG: IconConfig = {
  odooVersion: "18.0",
  source: {
    type: "icon",
    iconSet: "bootstrap-icons",
    iconClass: "bi bi-box",
  },
  backgroundColor: "transparent",
  iconColor: "#985184",
  iconWidth: ICON_SIZE,
  fontSize: 96,
  fontWeight: 900,
};
