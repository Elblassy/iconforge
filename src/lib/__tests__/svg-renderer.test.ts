import { describe, it, expect } from "vitest";
import { renderSvg } from "../svg-renderer";
import { DEFAULT_CONFIG } from "@/types/icon-config";
import type { IconConfig } from "@/types/icon-config";

const TEXT_CONFIG: IconConfig = {
  ...DEFAULT_CONFIG,
  source: { type: "text", text: "CRM", fontFamily: "Arial" },
  backgroundColor: "#714BC2",
  iconColor: "#ffffff",
  iconWidth: 512,
  fontSize: 150,
  fontWeight: 900,
};

describe("renderSvg()", () => {
  it("output contains <svg and </svg>", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("has correct width=\"512\" and height=\"512\" attributes", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain('width="512"');
    expect(svg).toContain('height="512"');
  });

  it("includes background color when set to #FF0000", () => {
    const config: IconConfig = { ...TEXT_CONFIG, backgroundColor: "#FF0000" };
    const svg = renderSvg(config);
    expect(svg).toContain("#FF0000");
  });

  it("includes text content CRM", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("CRM");
  });

  it("includes xmlns attribute", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("includes viewBox attribute", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("viewBox=");
  });

  it("includes a clipPath element for rounded corners", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("<clipPath");
  });

  it("includes a linearGradient element", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("<linearGradient");
  });

  it("includes a drop shadow filter", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("<filter");
    expect(svg).toContain("feDropShadow");
  });

  it("includes the icon color for text fill", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("#ffffff");
  });

  it("escapes XML entities in text content", () => {
    const config: IconConfig = {
      ...TEXT_CONFIG,
      source: { type: "text", text: "<B&W>", fontFamily: "Arial" },
    };
    const svg = renderSvg(config);
    expect(svg).not.toContain("<B&W>");
    expect(svg).toContain("&lt;B&amp;W&gt;");
  });

  it("renders without throwing for all Odoo versions", () => {
    const versions = ["16.0", "17.0", "18.0", "19.0"] as const;
    for (const version of versions) {
      const config: IconConfig = { ...TEXT_CONFIG, odooVersion: version };
      expect(() => renderSvg(config)).not.toThrow();
    }
  });

  it("renders icon source type without throwing", () => {
    const config: IconConfig = {
      ...DEFAULT_CONFIG,
      source: {
        type: "icon",
        iconSet: "bootstrap-icons",
        iconClass: "bi bi-box",
        unicodeChar: "\uF1F7",
      },
    };
    expect(() => renderSvg(config)).not.toThrow();
  });

  it("renders image source type without throwing", () => {
    const config: IconConfig = {
      ...DEFAULT_CONFIG,
      source: {
        type: "image",
        imageDataUrl: "data:image/png;base64,AAAA",
      },
    };
    expect(() => renderSvg(config)).not.toThrow();
  });

  it("respects cornerRadiusOverride", () => {
    const config: IconConfig = { ...TEXT_CONFIG, cornerRadiusOverride: 100 };
    const svg = renderSvg(config);
    expect(svg).toContain("100.00");
  });
});
