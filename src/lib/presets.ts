import type { IconConfig } from "@/types/icon-config";

export interface ColorPalette {
  name: string;
  pairs: { bg: string; fg: string }[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Odoo 17+ Style",
    pairs: [
      { bg: "#714BC2", fg: "#fff" }, // Purple (Sales, CRM)
      { bg: "#E8536D", fg: "#fff" }, // Coral/Pink (Dashboards)
      { bg: "#00A09D", fg: "#fff" }, // Teal (Inventory, Purchase)
      { bg: "#F39C12", fg: "#fff" }, // Amber/Gold (Accounting)
      { bg: "#2C8397", fg: "#fff" }, // Deep teal (Website)
      { bg: "#21B799", fg: "#fff" }, // Mint green
      { bg: "#3B5998", fg: "#fff" }, // Navy blue
      { bg: "#D4526E", fg: "#fff" }, // Muted rose
      { bg: "#2E4053", fg: "#fff" }, // Dark slate
      { bg: "#8E44AD", fg: "#fff" }, // Rich purple
    ],
  },
  {
    name: "Odoo Multicolor",
    pairs: [
      { bg: "#985184", fg: "#fff" }, // Muted purple
      { bg: "#FBB945", fg: "#fff" }, // Warm gold
      { bg: "#FC868B", fg: "#fff" }, // Soft coral
      { bg: "#F86126", fg: "#fff" }, // Vivid orange
      { bg: "#47C1A3", fg: "#fff" }, // Jade green
      { bg: "#3E7CB1", fg: "#fff" }, // Steel blue
      { bg: "#962B48", fg: "#fff" }, // Burgundy
      { bg: "#1B998B", fg: "#fff" }, // Deep mint
    ],
  },
  {
    name: "Professional",
    pairs: [
      { bg: "#2C3E50", fg: "#ECF0F1" },
      { bg: "#34495E", fg: "#ECF0F1" },
      { bg: "#1A5276", fg: "#fff" },
      { bg: "#7D3C98", fg: "#fff" },
      { bg: "#C0392B", fg: "#fff" },
      { bg: "#27AE60", fg: "#fff" },
      { bg: "#2980B9", fg: "#fff" },
      { bg: "#F39C12", fg: "#fff" },
    ],
  },
  {
    name: "Soft & Modern",
    pairs: [
      { bg: "#6C5CE7", fg: "#fff" },
      { bg: "#00CEC9", fg: "#fff" },
      { bg: "#FD79A8", fg: "#fff" },
      { bg: "#FDCB6E", fg: "#2C3E50" },
      { bg: "#55E6C1", fg: "#2C3E50" },
      { bg: "#74B9FF", fg: "#fff" },
      { bg: "#A29BFE", fg: "#fff" },
      { bg: "#FF7675", fg: "#fff" },
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
