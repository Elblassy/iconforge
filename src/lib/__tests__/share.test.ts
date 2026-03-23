import { describe, it, expect } from "vitest";
import { encodeConfig, decodeConfig } from "../share";
import { DEFAULT_CONFIG } from "@/types/icon-config";
import type { IconConfig } from "@/types/icon-config";

describe("share.ts", () => {
  describe("encodeConfig / decodeConfig round-trip", () => {
    it("round-trips the default config exactly", () => {
      const encoded = encodeConfig(DEFAULT_CONFIG);
      const decoded = decodeConfig(encoded);
      expect(decoded).toEqual(DEFAULT_CONFIG);
    });

    it("round-trips a text source config", () => {
      const config: IconConfig = {
        ...DEFAULT_CONFIG,
        source: { type: "text", text: "AB", fontFamily: "Georgia" },
        backgroundColor: "#FF6B6B",
      };
      const decoded = decodeConfig(encodeConfig(config));
      expect(decoded).toEqual(config);
    });

    it("round-trips an image source config (imageDataUrl stripped)", () => {
      const config: IconConfig = {
        ...DEFAULT_CONFIG,
        source: { type: "image", imageDataUrl: "data:image/png;base64,AAAA" },
      };
      const decoded = decodeConfig(encodeConfig(config));
      // imageDataUrl is stripped during encoding
      expect(decoded?.source).toEqual({ type: "image", imageDataUrl: "" });
    });
  });

  describe("encoded string length", () => {
    it("encodes the default config in under 4000 chars", () => {
      const encoded = encodeConfig(DEFAULT_CONFIG);
      // The encoded param value alone (not the full URL) must leave room for the URL prefix
      // Full share URL must be < 4000 chars, so just the encoded portion must be well under that
      expect(encoded.length).toBeLessThan(4000);
    });
  });

  describe("image data stripping", () => {
    it("strips imageDataUrl before encoding", () => {
      const config: IconConfig = {
        ...DEFAULT_CONFIG,
        source: {
          type: "image",
          imageDataUrl: "data:image/png;base64," + "A".repeat(1000),
        },
      };
      const decoded = decodeConfig(encodeConfig(config));
      expect(decoded).not.toBeNull();
      if (decoded && decoded.source.type === "image") {
        expect(decoded.source.imageDataUrl).toBe("");
      }
    });
  });

  describe("decodeConfig error handling", () => {
    it("returns null for an invalid encoded string", () => {
      expect(decodeConfig("not-valid-base64!!!")).toBeNull();
    });

    it("returns null for an empty string", () => {
      expect(decodeConfig("")).toBeNull();
    });

    it("returns null for a random valid base64 string that is not valid JSON", () => {
      // "hello" in base64
      expect(decodeConfig(btoa("hello world"))).toBeNull();
    });
  });
});
