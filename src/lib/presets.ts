import type { IconConfig, IconColorConfig } from "@/types/icon-config";

export interface ColorPalette {
  name: string;
  pairs: { bg: string; fg: string }[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Odoo 17+ Style",
    pairs: [
      { bg: "#985184", fg: "#fff" },
      { bg: "#E8536D", fg: "#fff" },
      { bg: "#00A09D", fg: "#fff" },
      { bg: "#F39C12", fg: "#fff" },
      { bg: "#2C8397", fg: "#fff" },
      { bg: "#21B799", fg: "#fff" },
      { bg: "#3B5998", fg: "#fff" },
      { bg: "#D4526E", fg: "#fff" },
      { bg: "#2E4053", fg: "#fff" },
      { bg: "#8E44AD", fg: "#fff" },
    ],
  },
  {
    name: "Odoo Multicolor",
    pairs: [
      { bg: "#985184", fg: "#fff" },
      { bg: "#FBB945", fg: "#fff" },
      { bg: "#FC868B", fg: "#fff" },
      { bg: "#F86126", fg: "#fff" },
      { bg: "#47C1A3", fg: "#fff" },
      { bg: "#3E7CB1", fg: "#fff" },
      { bg: "#962B48", fg: "#fff" },
      { bg: "#1B998B", fg: "#fff" },
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
      backgroundColor: "transparent",
      iconColor: "#985184",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-graph-up-arrow",
        unicodeChar: "\uF5E3",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#985184",
        color2: "#F86126",
        color3: "#FBB945",
        blend: false,
      },
    },
  },
  {
    name: "Inventory",
    config: {
      backgroundColor: "transparent",
      iconColor: "#985184",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-box-seam",
        unicodeChar: "\uF1C1",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#FBB945",
        color2: "#F86126",
        color3: "#985184",
        blend: false,
      },
    },
  },
  {
    name: "HR",
    config: {
      backgroundColor: "transparent",
      iconColor: "#985184",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-people",
        unicodeChar: "\uF4CF",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#985184",
        color2: "#FBB945",
        color3: "#1AD3BB",
        blend: false,
      },
    },
  },
  {
    name: "Accounting",
    config: {
      backgroundColor: "transparent",
      iconColor: "#088BF5",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-calculator",
        unicodeChar: "\uF20F",
      },
      colorConfig: {
        mode: "tinted",
        color1: "#088BF5",
        color2: "#144496",
        color3: "#2EBCFA",
        blend: false,
      },
    },
  },
  {
    name: "CRM",
    config: {
      backgroundColor: "transparent",
      iconColor: "#985184",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-person-lines-fill",
        unicodeChar: "\uF4D4",
      },
      colorConfig: {
        mode: "complementary",
        color1: "#985184",
        color2: "#F86126",
        color3: "#FBB945",
        blend: true,
      },
    },
  },
  {
    name: "Website",
    config: {
      backgroundColor: "transparent",
      iconColor: "#2C8397",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-globe",
        unicodeChar: "\uF38F",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#2C8397",
        color2: "#21B799",
        color3: "#FBB945",
        blend: true,
      },
    },
  },
  {
    name: "Manufacturing",
    config: {
      backgroundColor: "transparent",
      iconColor: "#985184",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-gear",
        unicodeChar: "\uF3E5",
      },
      colorConfig: {
        mode: "complementary",
        color1: "#985184",
        color2: "#FBB945",
        color3: "#F86126",
        blend: false,
      },
    },
  },
  {
    name: "Purchase",
    config: {
      backgroundColor: "transparent",
      iconColor: "#00A09D",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-cart3",
        unicodeChar: "\uF237",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#00A09D",
        color2: "#985184",
        color3: "#2E4053",
        blend: false,
      },
    },
  },
  {
    name: "Project",
    config: {
      backgroundColor: "transparent",
      iconColor: "#F39C12",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-kanban",
        unicodeChar: "\uF41D",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#F39C12",
        color2: "#E8536D",
        color3: "#985184",
        blend: true,
      },
    },
  },
  {
    name: "Discuss",
    config: {
      backgroundColor: "transparent",
      iconColor: "#F86126",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-chat-dots",
        unicodeChar: "\uF252",
      },
      colorConfig: {
        mode: "tinted",
        color1: "#F86126",
        color2: "#F86126",
        color3: "#F86126",
        blend: false,
      },
    },
  },
  {
    name: "Calendar",
    config: {
      backgroundColor: "transparent",
      iconColor: "#E8536D",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-calendar-event",
        unicodeChar: "\uF1EA",
      },
      colorConfig: {
        mode: "complementary",
        color1: "#E8536D",
        color2: "#FBB945",
        color3: "#FBB945",
        blend: true,
      },
    },
  },
  {
    name: "Settings",
    config: {
      backgroundColor: "transparent",
      iconColor: "#2E4053",
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-sliders",
        unicodeChar: "\uF578",
      },
      colorConfig: {
        mode: "tricolor",
        color1: "#2E4053",
        color2: "#3E7CB1",
        color3: "#21B799",
        blend: true,
      },
    },
  },
];
