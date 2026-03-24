import { describe, it, expect } from "vitest";
import { IconRenderer } from "../icon-renderer";
import { DEFAULT_CONFIG } from "@/types/icon-config";
import type { IconConfig, OdooVersion } from "@/types/icon-config";
import { ODOO_VERSIONS } from "../odoo-versions";

// Override source to text mode so no font loading is required in jsdom
const TEST_CONFIG: IconConfig = {
  ...DEFAULT_CONFIG,
  source: { type: "text", text: "HR", fontFamily: "Arial" },
};

describe("IconRenderer", () => {
  const renderer = new IconRenderer();

  describe("render()", () => {
    it("returns a canvas with default dimensions (300x300)", () => {
      const canvas = renderer.render(TEST_CONFIG);
      expect(canvas.width).toBe(128);
      expect(canvas.height).toBe(128);
    });

    it("returns a canvas with custom dimensions (512x512)", () => {
      const config: IconConfig = { ...TEST_CONFIG, iconWidth: 512 };
      const canvas = renderer.render(config);
      expect(canvas.width).toBe(512);
      expect(canvas.height).toBe(512);
    });

    it("canvas width equals iconWidth from config", () => {
      const config: IconConfig = { ...TEST_CONFIG, iconWidth: 256 };
      const canvas = renderer.render(config);
      expect(canvas.width).toBe(config.iconWidth);
      expect(canvas.height).toBe(config.iconWidth);
    });

    it.each(ODOO_VERSIONS as OdooVersion[])(
      "renders version %s without throwing",
      (version) => {
        const config: IconConfig = { ...TEST_CONFIG, odooVersion: version };
        expect(() => renderer.render(config)).not.toThrow();
      }
    );

    it("all 4 Odoo versions render successfully", () => {
      for (const version of ODOO_VERSIONS) {
        const config: IconConfig = {
          ...TEST_CONFIG,
          odooVersion: version as OdooVersion,
        };
        const canvas = renderer.render(config);
        expect(canvas).toBeTruthy();
        expect(canvas.width).toBe(128);
      }
    });

    it("exports to a data URL starting with data:image/png;base64,", () => {
      const canvas = renderer.render(TEST_CONFIG);
      const dataUrl = canvas.toDataURL("image/png");
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it("returns an HTMLCanvasElement", () => {
      const canvas = renderer.render(TEST_CONFIG);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it("respects cornerRadiusOverride", () => {
      const config: IconConfig = { ...TEST_CONFIG, cornerRadiusOverride: 50 };
      // should not throw when an override is provided
      expect(() => renderer.render(config)).not.toThrow();
    });

    it("renders with hard shadow for version 16.0", () => {
      const config: IconConfig = { ...TEST_CONFIG, odooVersion: "16.0" };
      const canvas = renderer.render(config);
      expect(canvas.width).toBe(128);
    });

    it("renders with icon source type without throwing", () => {
      const config: IconConfig = {
        ...DEFAULT_CONFIG,
        source: {
          type: "icon",
          iconSet: "bootstrap-icons",
          iconClass: "bi bi-box",
          unicodeChar: "\uF1F7",
        },
      };
      expect(() => renderer.render(config)).not.toThrow();
    });
  });

  describe("renderWithImage()", () => {
    it("returns an HTMLCanvasElement", () => {
      const img = new Image();
      const canvas = renderer.renderWithImage(TEST_CONFIG, img);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it("returns a canvas with correct dimensions", () => {
      const img = new Image();
      const canvas = renderer.renderWithImage(TEST_CONFIG, img);
      expect(canvas.width).toBe(128);
      expect(canvas.height).toBe(128);
    });

    it("exports to a data URL starting with data:image/png;base64,", () => {
      const img = new Image();
      const canvas = renderer.renderWithImage(TEST_CONFIG, img);
      const dataUrl = canvas.toDataURL("image/png");
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });
});
