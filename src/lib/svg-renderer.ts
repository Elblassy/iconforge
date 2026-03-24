import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "./icon-renderer";

/**
 * Render the icon via canvas, then wrap the result as a base64 image
 * inside an SVG. This makes the SVG fully self-contained — no external
 * fonts or resources needed.
 */
export function renderSvg(config: IconConfig, canvasDataUrl?: string): string {
  const size = 512;

  // If no pre-rendered data URL was provided, render via canvas now
  let dataUrl = canvasDataUrl;
  if (!dataUrl) {
    const renderer = new IconRenderer();
    const canvas = renderer.render({ ...config, iconWidth: size, fontSize: Math.round(size * (config.fontSize / config.iconWidth)) });
    dataUrl = canvas.toDataURL("image/png");
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <image width="${size}" height="${size}" href="${dataUrl}"/>`,
    `</svg>`,
  ].join("\n");
}

/**
 * Render the icon as Odoo 17+ style SVG: icon only on transparent background,
 * 50x50 viewBox. Odoo's web client handles the background based on theme.
 * The icon glyph is rendered via canvas then embedded as a clipped image.
 */
export function renderOdoo17Svg(config: IconConfig): string {
  const size = 50;
  const renderSize = 256; // render at higher res for quality

  const renderer = new IconRenderer();
  // Render icon only — no background (transparent), just the glyph
  const canvas = document.createElement("canvas");
  canvas.width = renderSize;
  canvas.height = renderSize;
  const ctx = canvas.getContext("2d")!;

  const scaledFontSize = Math.round(renderSize * (config.fontSize / config.iconWidth));

  // Draw the icon glyph centered on transparent canvas (no background)
  ctx.fillStyle = config.iconColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const source = config.source;
  if (source.type === "text") {
    ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.fontFamily}"`;
    ctx.fillText(source.text, renderSize / 2, renderSize / 2);
  } else if (source.type === "icon") {
    ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.iconSet}"`;
    const glyph = source.unicodeChar || renderer["_resolveIconUnicode"](source.iconClass);
    if (glyph) {
      ctx.fillText(glyph, renderSize / 2, renderSize / 2);
    }
  } else if (source.type === "image" && source.imageDataUrl) {
    // For image source, we can't easily extract — fall back to full render
    return renderSvg(config);
  }

  const dataUrl = canvas.toDataURL("image/png");

  return [
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,
    `  <image width="${size}" height="${size}" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
    `</svg>`,
  ].join("\n");
}

/**
 * Trigger a download of the SVG string as a file.
 * Pass canvasDataUrl to embed a pre-rendered canvas (e.g. with logo overlay).
 */
export function downloadSvg(config: IconConfig, filename = "odoo-icon.svg", canvasDataUrl?: string): void {
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
 * Download as Odoo 17+ format: transparent background, 50x50, icon-only.
 */
export function downloadOdoo17Svg(config: IconConfig, filename = "icon.svg"): void {
  const svgString = renderOdoo17Svg(config);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
