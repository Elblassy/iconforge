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
 * 50x50 viewBox. Takes a pre-rendered canvas (from the live preview where fonts
 * are already loaded) and strips the background to produce a transparent result.
 */
export function renderOdoo17Svg(config: IconConfig, sourceCanvas: HTMLCanvasElement): string {
  const svgSize = 50;
  const renderSize = 256;

  // Re-render at higher res with transparent background
  const canvas = document.createElement("canvas");
  canvas.width = renderSize;
  canvas.height = renderSize;
  const ctx = canvas.getContext("2d")!;

  // Draw the source canvas (which has background + icon) onto our canvas
  ctx.drawImage(sourceCanvas, 0, 0, renderSize, renderSize);

  // Remove the background by making all pixels matching the bg color transparent
  const bgColor = hexToRgb(config.backgroundColor);
  if (bgColor) {
    const imageData = ctx.getImageData(0, 0, renderSize, renderSize);
    const data = imageData.data;
    const tolerance = 60; // color distance tolerance for gradient/shadow edges

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate color distance from background
      const dist = Math.sqrt(
        (r - bgColor.r) ** 2 + (g - bgColor.g) ** 2 + (b - bgColor.b) ** 2
      );

      if (dist < tolerance) {
        // Make background pixels fully transparent
        data[i + 3] = 0;
      } else if (dist < tolerance * 2) {
        // Feather edges for smooth transition
        const alpha = Math.round(((dist - tolerance) / tolerance) * data[i + 3]);
        data[i + 3] = Math.min(alpha, data[i + 3]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const dataUrl = canvas.toDataURL("image/png");

  return [
    `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">`,
    `  <image width="${svgSize}" height="${svgSize}" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
    `</svg>`,
  ].join("\n");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/.{2}/g);
  if (!match || match.length < 3) return null;
  return {
    r: parseInt(match[0], 16),
    g: parseInt(match[1], 16),
    b: parseInt(match[2], 16),
  };
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
export function downloadOdoo17Svg(config: IconConfig, sourceCanvas: HTMLCanvasElement, filename = "icon.svg"): void {
  const svgString = renderOdoo17Svg(config, sourceCanvas);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
