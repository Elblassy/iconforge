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
