import type { IconConfig } from "@/types/icon-config";
import { getVersionConfig } from "./odoo-versions";
import { hexToRgba } from "./color-utils";

/**
 * Escape XML special characters in text content.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert a hex color + alpha to SVG-compatible rgba string.
 */
function toRgba(hex: string, alpha: number): string {
  return hexToRgba(hex, alpha);
}

/**
 * Build an SVG string that visually approximates the canvas-rendered icon.
 */
export function renderSvg(config: IconConfig): string {
  const size = 512;
  const versionConfig = getVersionConfig(config.odooVersion);

  const cornerRadius =
    config.cornerRadiusOverride !== undefined
      ? config.cornerRadiusOverride
      : size * versionConfig.cornerRadiusPercent;

  const gradientAlpha =
    config.gradientIntensity !== undefined
      ? config.gradientIntensity
      : versionConfig.gradientAlpha;

  const dropShadowOffset = Math.round(size * versionConfig.dropShadowOffsetPercent);
  const dropShadowBlur = Math.round(size * 0.04);
  const dropShadowColor = toRgba("#000000", versionConfig.dropShadowAlpha);

  // Determine text content for the SVG
  let textContent = "";
  let fontFamily = "sans-serif";
  let fontWeight: number | string = config.fontWeight;
  let fontSize = config.fontSize;

  if (config.source.type === "text") {
    textContent = escapeXml(config.source.text);
    fontFamily = config.source.fontFamily;
  } else if (config.source.type === "icon") {
    const glyph =
      config.source.unicodeChar !== undefined
        ? config.source.unicodeChar
        : config.source.iconClass;
    textContent = escapeXml(glyph);
    fontFamily = config.source.iconSet;
  }
  // For image type, we skip text rendering in SVG

  const gradientId = "svgGradient";
  const clipId = "svgClip";
  const shadowFilterId = "svgDropShadow";

  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 ${size} ${size}">`
  );

  // --- defs ---
  parts.push("  <defs>");

  // Clip path: rounded rectangle
  parts.push(`    <clipPath id="${clipId}">`);
  parts.push(
    `      <rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius.toFixed(2)}" ry="${cornerRadius.toFixed(2)}"/>`
  );
  parts.push("    </clipPath>");

  // Linear gradient: diagonal, transparent → semi-transparent white
  parts.push(
    `    <linearGradient id="${gradientId}" x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox">`
  );
  parts.push(`      <stop offset="0" stop-color="transparent" stop-opacity="0"/>`);
  parts.push(
    `      <stop offset="1" stop-color="white" stop-opacity="${gradientAlpha}"/>`
  );
  parts.push("    </linearGradient>");

  // Drop shadow filter
  parts.push(`    <filter id="${shadowFilterId}" x="-20%" y="-20%" width="140%" height="140%">`);
  parts.push(
    `      <feDropShadow dx="0" dy="${dropShadowOffset}" stdDeviation="${(dropShadowBlur / 2).toFixed(1)}" flood-color="${dropShadowColor}"/>`
  );
  parts.push("    </filter>");

  parts.push("  </defs>");

  // --- main group with clip ---
  parts.push(`  <g clip-path="url(#${clipId})">`);

  // Background rectangle
  parts.push(
    `    <rect x="0" y="0" width="${size}" height="${size}" fill="${escapeXml(config.backgroundColor)}"/>`
  );

  // Text / icon glyph
  if (textContent) {
    const cx = size / 2;
    const cy = size / 2;
    parts.push(
      `    <text` +
        ` x="${cx}"` +
        ` y="${cy}"` +
        ` text-anchor="middle"` +
        ` dominant-baseline="central"` +
        ` font-family="${escapeXml(fontFamily)}"` +
        ` font-size="${fontSize}"` +
        ` font-weight="${fontWeight}"` +
        ` fill="${escapeXml(config.iconColor)}"` +
        ` filter="url(#${shadowFilterId})"` +
        `>${textContent}</text>`
    );
  }

  // Gradient overlay
  parts.push(
    `    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#${gradientId})"/>`
  );

  parts.push("  </g>");
  parts.push("</svg>");

  return parts.join("\n");
}

/**
 * Trigger a download of the SVG string as a file.
 * Only callable in a browser environment.
 */
export function downloadSvg(config: IconConfig, filename = "odoo-icon.svg"): void {
  const svgString = renderSvg(config);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
