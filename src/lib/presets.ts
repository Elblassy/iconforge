import type { IconConfig } from "@/types/icon-config";

export interface ColorPalette {
  name: string;
  pairs: { bg: string; fg: string }[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Odoo Official",
    pairs: [
      { bg: "#714BC2", fg: "#ffffff" },
      { bg: "#017E84", fg: "#ffffff" },
      { bg: "#F06050", fg: "#ffffff" },
      { bg: "#2C8397", fg: "#ffffff" },
      { bg: "#00A09D", fg: "#ffffff" },
      { bg: "#875A7B", fg: "#ffffff" },
      { bg: "#547F93", fg: "#ffffff" },
      { bg: "#E9AB17", fg: "#ffffff" },
    ],
  },
  {
    name: "Pastel",
    pairs: [
      { bg: "#A8D8EA", fg: "#2C3E50" },
      { bg: "#AA96DA", fg: "#ffffff" },
      { bg: "#FCBAD3", fg: "#2C3E50" },
      { bg: "#FFFFD2", fg: "#2C3E50" },
      { bg: "#B5EAD7", fg: "#2C3E50" },
      { bg: "#C7CEEA", fg: "#2C3E50" },
    ],
  },
  {
    name: "Vibrant",
    pairs: [
      { bg: "#FF6B6B", fg: "#ffffff" },
      { bg: "#4ECDC4", fg: "#ffffff" },
      { bg: "#45B7D1", fg: "#ffffff" },
      { bg: "#96CEB4", fg: "#ffffff" },
      { bg: "#FFEAA7", fg: "#2C3E50" },
      { bg: "#DDA0DD", fg: "#ffffff" },
    ],
  },
  {
    name: "Monochrome",
    pairs: [
      { bg: "#2C3E50", fg: "#ECF0F1" },
      { bg: "#34495E", fg: "#ECF0F1" },
      { bg: "#7F8C8D", fg: "#ffffff" },
      { bg: "#95A5A6", fg: "#ffffff" },
      { bg: "#BDC3C7", fg: "#2C3E50" },
      { bg: "#1A1A2E", fg: "#ECF0F1" },
    ],
  },
  {
    name: "Earth Tones",
    pairs: [
      { bg: "#8D6E63", fg: "#ffffff" },
      { bg: "#A1887F", fg: "#ffffff" },
      { bg: "#795548", fg: "#ffffff" },
      { bg: "#4E342E", fg: "#ffffff" },
      { bg: "#6D4C41", fg: "#ffffff" },
      { bg: "#3E2723", fg: "#D7CCC8" },
    ],
  },
];

export interface PresetTemplate {
  name: string;
  config: Partial<IconConfig>;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    name: "Sales",
    config: {
      backgroundColor: "#714BC2",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-graph-up-arrow",
        unicodeChar: "\uF5E3",
      },
    },
  },
  {
    name: "Inventory",
    config: {
      backgroundColor: "#00A09D",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-box-seam",
        unicodeChar: "\uF1C1",
      },
    },
  },
  {
    name: "HR",
    config: {
      backgroundColor: "#E9AB17",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-people",
        unicodeChar: "\uF4CF",
      },
    },
  },
  {
    name: "Accounting",
    config: {
      backgroundColor: "#017E84",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-calculator",
        unicodeChar: "\uF20F",
      },
    },
  },
  {
    name: "CRM",
    config: {
      backgroundColor: "#875A7B",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-person-lines-fill",
        unicodeChar: "\uF4D4",
      },
    },
  },
  {
    name: "Website",
    config: {
      backgroundColor: "#2C8397",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-globe",
        unicodeChar: "\uF38F",
      },
    },
  },
  {
    name: "Manufacturing",
    config: {
      backgroundColor: "#8D6E63",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-gear",
        unicodeChar: "\uF3E5",
      },
    },
  },
  {
    name: "Purchase",
    config: {
      backgroundColor: "#F06050",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-cart3",
        unicodeChar: "\uF237",
      },
    },
  },
  {
    name: "Project",
    config: {
      backgroundColor: "#547F93",
      iconColor: "#ffffff",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-kanban",
        unicodeChar: "\uF41D",
      },
    },
  },
];
