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

  it("has correct width and height attributes", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain('width="512"');
    expect(svg).toContain('height="512"');
  });

  it("includes xmlns attribute", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("embeds a base64 image", () => {
    const svg = renderSvg(TEXT_CONFIG);
    expect(svg).toContain("<image");
    expect(svg).toContain("data:image/png;base64,");
  });

  it("uses a provided canvasDataUrl when given", () => {
    const fakeDataUrl = "data:image/png;base64,FAKECONTENT";
    const svg = renderSvg(TEXT_CONFIG, fakeDataUrl);
    expect(svg).toContain("FAKECONTENT");
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
});
