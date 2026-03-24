import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "./icon-renderer";
import opentype from "opentype.js";

// Cache loaded fonts to avoid re-fetching
const fontCache = new Map<string, opentype.Font>();

/** Font file URLs for each icon set (direct .woff/.ttf files) */
const FONT_URLS: Record<string, string> = {
  "bootstrap-icons":
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2",
  remixicon:
    "https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.woff2",
  "tabler-icons":
    "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/fonts/tabler-icons.woff2",
  "Font Awesome 6 Free":
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2",
};

/**
 * Load a font file and parse it with opentype.js.
 */
async function loadFont(fontFamily: string): Promise<opentype.Font | null> {
  if (fontCache.has(fontFamily)) return fontCache.get(fontFamily)!;

  const url = FONT_URLS[fontFamily];
  if (!url) return null;

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const font = opentype.parse(buffer);
    fontCache.set(fontFamily, font);
    return font;
  } catch (err) {
    console.warn(`Failed to load font ${fontFamily}:`, err);
    return null;
  }
}

/**
 * Get SVG path data for a unicode character from a font.
 */
function getGlyphPath(
  font: opentype.Font,
  char: string,
  size: number
): { pathData: string; width: number; height: number } | null {
  const glyph = font.charToGlyph(char);
  if (!glyph || glyph.index === 0) return null;

  const unitsPerEm = font.unitsPerEm;
  const scale = size / unitsPerEm;

  const path = glyph.getPath(0, 0, size);
  const pathData = path.toPathData(2);

  const bbox = path.getBoundingBox();
  return {
    pathData,
    width: (bbox.x2 - bbox.x1),
    height: (bbox.y2 - bbox.y1),
  };
}

/**
 * Render the icon via canvas, then wrap the result as a base64 image
 * inside an SVG. This makes the SVG fully self-contained.
 */
export function renderSvg(config: IconConfig, canvasDataUrl?: string): string {
  const size = 512;

  let dataUrl = canvasDataUrl;
  if (!dataUrl) {
    const renderer = new IconRenderer();
    const canvas = renderer.render({
      ...config,
      iconWidth: size,
      fontSize: Math.round(size * (config.fontSize / config.iconWidth)),
    });
    dataUrl = canvas.toDataURL("image/png");
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <image width="${size}" height="${size}" href="${dataUrl}"/>`,
    `</svg>`,
  ].join("\n");
}

/**
 * Render the icon as Odoo 17+ style SVG with real vector <path> elements.
 * No background, no gradient — just the icon shape on transparent canvas.
 * 50x50 viewBox matching Odoo's format.
 */
export async function renderOdoo17Svg(config: IconConfig): Promise<string> {
  const svgSize = 50;
  const source = config.source;

  if (source.type === "text") {
    // For text mode, use SVG <text> element (system fonts are available)
    return [
      `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">`,
      `  <text x="${svgSize / 2}" y="${svgSize / 2}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(source.fontFamily)}" font-size="${Math.round(svgSize * (config.fontSize / config.iconWidth))}" font-weight="${config.fontWeight}" fill="${escapeXml(config.iconColor)}">${escapeXml(source.text)}</text>`,
      `</svg>`,
    ].join("\n");
  }

  if (source.type === "icon") {
    // Try to extract real SVG path from the font file
    const char = source.unicodeChar;
    if (char) {
      const font = await loadFont(source.iconSet);
      if (font) {
        const glyphInfo = getGlyphPath(font, char, svgSize);
        if (glyphInfo && glyphInfo.pathData) {
          // Center the glyph in the 50x50 viewBox
          const path = font.charToGlyph(char).getPath(0, 0, svgSize * 0.8);
          const bbox = path.getBoundingBox();
          const glyphW = bbox.x2 - bbox.x1;
          const glyphH = bbox.y2 - bbox.y1;
          const offsetX = (svgSize - glyphW) / 2 - bbox.x1;
          const offsetY = (svgSize - glyphH) / 2 - bbox.y1;

          const centeredPath = font
            .charToGlyph(char)
            .getPath(offsetX, offsetY, svgSize * 0.8);
          const centeredPathData = centeredPath.toPathData(2);

          return [
            `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">`,
            `  <path d="${centeredPathData}" fill="${escapeXml(config.iconColor)}"/>`,
            `</svg>`,
          ].join("\n");
        }
      }
    }

    // Fallback: resolve unicode from DOM and try again
    if (!char && typeof document !== "undefined") {
      const el = document.createElement("i");
      el.className = source.iconClass;
      el.style.cssText =
        "position:absolute;top:-9999px;visibility:hidden";
      document.body.appendChild(el);
      const content = window
        .getComputedStyle(el, "::before")
        .getPropertyValue("content");
      document.body.removeChild(el);
      const resolved = content?.replace(/^["']|["']$/g, "");
      if (resolved && resolved !== "none") {
        const font = await loadFont(source.iconSet);
        if (font) {
          const path = font.charToGlyph(resolved).getPath(0, 0, svgSize * 0.8);
          const bbox = path.getBoundingBox();
          const glyphW = bbox.x2 - bbox.x1;
          const glyphH = bbox.y2 - bbox.y1;
          const offsetX = (svgSize - glyphW) / 2 - bbox.x1;
          const offsetY = (svgSize - glyphH) / 2 - bbox.y1;
          const centeredPath = font
            .charToGlyph(resolved)
            .getPath(offsetX, offsetY, svgSize * 0.8);
          const centeredPathData = centeredPath.toPathData(2);

          if (centeredPathData) {
            return [
              `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">`,
              `  <path d="${centeredPathData}" fill="${escapeXml(config.iconColor)}"/>`,
              `</svg>`,
            ].join("\n");
          }
        }
      }
    }
  }

  // Ultimate fallback: empty SVG with a colored circle placeholder
  return [
    `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">`,
    `  <circle cx="${svgSize / 2}" cy="${svgSize / 2}" r="${svgSize * 0.35}" fill="${escapeXml(config.iconColor)}"/>`,
    `</svg>`,
  ].join("\n");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Trigger a download of the SVG string as a file (with background).
 */
export function downloadSvg(
  config: IconConfig,
  filename = "odoo-icon.svg",
  canvasDataUrl?: string
): void {
  const svgString = renderSvg(config, canvasDataUrl);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Download as Odoo 17+ format: real SVG paths, transparent bg, 50x50.
 */
export async function downloadOdoo17Svg(
  config: IconConfig,
  filename = "icon.svg"
): Promise<void> {
  const svgString = await renderOdoo17Svg(config);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
