import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "./icon-renderer";

/**
 * Maps icon set + icon class to candidate CDN URLs for the individual SVG file.
 */
function getIconSvgUrls(iconSet: string, iconClass: string): string[] {
  const parts = iconClass.split(" ");
  const urls: string[] = [];

  if (iconSet === "bootstrap-icons") {
    const name = parts.find((p) => p.startsWith("bi-"))?.replace("bi-", "");
    if (name) {
      urls.push(
        `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`
      );
    }
  }

  if (iconSet === "Font Awesome 6 Free") {
    const stylePart = parts.find((p) =>
      ["fa-solid", "fa-regular", "fa-brands"].includes(p)
    );
    const namePart = parts.find(
      (p) =>
        p.startsWith("fa-") &&
        !["fa-solid", "fa-regular", "fa-brands"].includes(p)
    );
    const style = stylePart?.replace("fa-", "") || "solid";
    const name = namePart?.replace("fa-", "");
    if (name) {
      urls.push(
        `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/${style}/${name}.svg`
      );
    }
  }

  if (iconSet === "remixicon") {
    const name = parts[0]?.replace("ri-", "");
    if (name) {
      const categories = [
        "System", "Business", "Design", "Development", "Document",
        "Editor", "Finance", "Health", "Logos", "Map", "Media",
        "Communication", "User", "Weather", "Buildings", "Device",
        "Arrows", "Others",
      ];
      for (const cat of categories) {
        urls.push(
          `https://cdn.jsdelivr.net/npm/remixicon@4.1.0/icons/${cat}/${name}.svg`
        );
      }
    }
  }

  if (iconSet === "tabler-icons") {
    const name = parts
      .find((p) => p.startsWith("ti-") && p !== "ti")
      ?.replace("ti-", "");
    if (name) {
      urls.push(
        `https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/outline/${name}.svg`
      );
      urls.push(
        `https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/filled/${name}.svg`
      );
    }
  }

  return urls;
}

/**
 * Fetch an SVG from URL and return the parsed SVG element, or null.
 */
async function fetchSvgElement(url: string): Promise<SVGSVGElement | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    return doc.querySelector("svg");
  } catch {
    return null;
  }
}

/**
 * Apply a single fill color to all shapes in an SVG element.
 */
function recolorSvg(svgEl: SVGSVGElement, fillColor: string): void {
  const shapes = svgEl.querySelectorAll(
    "path, circle, rect, polygon, polyline, line, ellipse"
  );
  shapes.forEach((shape) => {
    const currentFill = shape.getAttribute("fill");
    if (currentFill !== "none") {
      shape.setAttribute("fill", fillColor);
    }
    const currentStroke = shape.getAttribute("stroke");
    if (currentStroke && currentStroke !== "none") {
      shape.setAttribute("stroke", fillColor);
    }
  });
  svgEl.setAttribute("fill", fillColor);
}

/**
 * Apply multi-color (duo/trio) to an SVG by duplicating the icon with
 * different colors and offsets, creating the layered Odoo-style look.
 */
function applyMultiColor(
  svgEl: SVGSVGElement,
  colors: string[]
): string {
  // Get the viewBox dimensions
  let viewBox = svgEl.getAttribute("viewBox");
  if (!viewBox) {
    const w = svgEl.getAttribute("width") || "50";
    const h = svgEl.getAttribute("height") || "50";
    viewBox = `0 0 ${w} ${h}`;
  }
  const vbParts = viewBox.split(" ").map(Number);
  const vbWidth = vbParts[2] || 50;
  const vbHeight = vbParts[3] || 50;

  // Extract the inner paths as a group
  const innerContent = svgEl.innerHTML
    .replace(/<!--[\s\S]*?-->/g, "") // remove comments
    .trim();

  const layers: string[] = [];

  if (colors.length === 2) {
    // Duo: back layer shifted right+down, front layer normal
    layers.push(
      `  <g transform="translate(${vbWidth * 0.12}, ${vbHeight * 0.12}) scale(0.88)" opacity="0.85" fill="${escapeXml(colors[1])}">${recolorInnerContent(innerContent, colors[1])}</g>`
    );
    layers.push(
      `  <g transform="translate(${-vbWidth * 0.05}, ${-vbHeight * 0.05}) scale(0.88)" fill="${escapeXml(colors[0])}">${recolorInnerContent(innerContent, colors[0])}</g>`
    );
  } else if (colors.length === 3) {
    // Trio: three layers with offsets, like Odoo's Sale icon
    layers.push(
      `  <g transform="translate(${vbWidth * 0.18}, ${vbHeight * 0.15}) scale(0.78)" opacity="0.7" fill="${escapeXml(colors[2])}">${recolorInnerContent(innerContent, colors[2])}</g>`
    );
    layers.push(
      `  <g transform="translate(${vbWidth * 0.06}, ${vbHeight * 0.06}) scale(0.82)" opacity="0.85" fill="${escapeXml(colors[1])}">${recolorInnerContent(innerContent, colors[1])}</g>`
    );
    layers.push(
      `  <g transform="translate(${-vbWidth * 0.06}, ${-vbHeight * 0.06}) scale(0.82)" fill="${escapeXml(colors[0])}">${recolorInnerContent(innerContent, colors[0])}</g>`
    );
  } else {
    // Single color
    layers.push(
      `  <g fill="${escapeXml(colors[0])}">${recolorInnerContent(innerContent, colors[0])}</g>`
    );
  }

  return [
    `<svg width="50" height="50" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">`,
    ...layers,
    `</svg>`,
  ].join("\n");
}

/**
 * Replace fill/stroke colors in raw SVG content string.
 */
function recolorInnerContent(content: string, color: string): string {
  return content
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);
}

/**
 * Render a transparent-background icon via canvas and return as base64 data URL.
 * Used for text mode and image upload mode in Odoo 17+ SVG export.
 */
function renderTransparentCanvas(config: IconConfig): string {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const scaledFontSize = Math.round(
    size * (config.fontSize / config.iconWidth)
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const source = config.source;

  if (source.type === "text") {
    // Draw text layers for multi-color
    const colors = getColorArray(config);
    if (colors.length >= 3) {
      ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.fontFamily}"`;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = colors[2];
      ctx.fillText(source.text, size / 2 + size * 0.09, size / 2 + size * 0.08);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors[1];
      ctx.fillText(source.text, size / 2 + size * 0.03, size / 2 + size * 0.03);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors[0];
      ctx.fillText(source.text, size / 2 - size * 0.03, size / 2 - size * 0.03);
    } else if (colors.length === 2) {
      ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.fontFamily}"`;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors[1];
      ctx.fillText(source.text, size / 2 + size * 0.06, size / 2 + size * 0.06);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors[0];
      ctx.fillText(source.text, size / 2 - size * 0.02, size / 2 - size * 0.02);
    } else {
      ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.fontFamily}"`;
      ctx.fillStyle = config.iconColor;
      ctx.fillText(source.text, size / 2, size / 2);
    }
  } else if (source.type === "icon") {
    const renderer = new IconRenderer();
    ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.iconSet}"`;
    const glyph =
      source.unicodeChar ||
      renderer["_resolveIconUnicode"](source.iconClass);
    if (glyph) {
      const colors = getColorArray(config);
      if (colors.length >= 3) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = colors[2];
        ctx.fillText(glyph, size / 2 + size * 0.09, size / 2 + size * 0.08);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = colors[1];
        ctx.fillText(glyph, size / 2 + size * 0.03, size / 2 + size * 0.03);
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors[0];
        ctx.fillText(glyph, size / 2 - size * 0.03, size / 2 - size * 0.03);
      } else if (colors.length === 2) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = colors[1];
        ctx.fillText(glyph, size / 2 + size * 0.06, size / 2 + size * 0.06);
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors[0];
        ctx.fillText(glyph, size / 2 - size * 0.02, size / 2 - size * 0.02);
      } else {
        ctx.fillStyle = config.iconColor;
        ctx.fillText(glyph, size / 2, size / 2);
      }
    }
  } else if (source.type === "image" && source.imageDataUrl) {
    // Can't render synchronously — handled separately
  }

  return canvas.toDataURL("image/png");
}

/**
 * Get the array of colors based on multi-color config.
 */
function getColorArray(config: IconConfig): string[] {
  const mc = config.multiColor;
  if (!mc || mc.mode === "single") return [config.iconColor];
  if (mc.mode === "duo") return [config.iconColor, mc.color2];
  return [config.iconColor, mc.color2, mc.color3];
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Render the icon via canvas, then wrap as a base64 image in SVG.
 * Used for "SVG (with bg)" export — full icon with background.
 */
export function renderSvg(
  config: IconConfig,
  canvasDataUrl?: string
): string {
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
 * Render the icon as Odoo 17+ style SVG.
 * - For icon fonts: fetches real SVG from CDN, applies multi-color if set
 * - For text/image: renders on transparent canvas and embeds as base64
 * No background, no gradient.
 */
export async function renderOdoo17Svg(
  config: IconConfig
): Promise<string> {
  const source = config.source;
  const colors = getColorArray(config);

  // ── Icon font source: fetch real SVG paths ──
  if (source.type === "icon") {
    const urls = getIconSvgUrls(source.iconSet, source.iconClass);
    for (const url of urls) {
      const svgEl = await fetchSvgElement(url);
      if (svgEl) {
        if (colors.length > 1) {
          // Multi-color: duplicate icon with offsets
          return applyMultiColor(svgEl, colors);
        }
        // Single color
        recolorSvg(svgEl, config.iconColor);
        svgEl.setAttribute("width", "50");
        svgEl.setAttribute("height", "50");
        const serializer = new XMLSerializer();
        return serializer
          .serializeToString(svgEl)
          .replace(/<\?xml[^?]*\?>\s*/g, "");
      }
    }
    console.warn(
      "Odoo 17+ SVG: no SVG found for",
      source.iconClass,
      "— falling back to canvas"
    );
  }

  // ── Text mode: render on canvas, embed as base64 ──
  if (source.type === "text") {
    const dataUrl = renderTransparentCanvas(config);
    return [
      `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
      `  <image width="50" height="50" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
      `</svg>`,
    ].join("\n");
  }

  // ── Image upload: embed as base64 ──
  if (source.type === "image" && source.imageDataUrl) {
    return [
      `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
      `  <image width="50" height="50" href="${source.imageDataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
      `</svg>`,
    ].join("\n");
  }

  // ── Canvas fallback for icon fonts that couldn't be fetched ──
  const dataUrl = renderTransparentCanvas(config);
  if (dataUrl && dataUrl.length > 100) {
    return [
      `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
      `  <image width="50" height="50" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
      `</svg>`,
    ].join("\n");
  }

  // Last resort
  return [
    `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
    `  <circle cx="25" cy="25" r="17.5" fill="${escapeXml(config.iconColor)}"/>`,
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
 * Download SVG with background (canvas-based).
 */
export function downloadSvg(
  config: IconConfig,
  filename = "odoo-icon.svg",
  canvasDataUrl?: string
): void {
  const svgString = renderSvg(config, canvasDataUrl);
  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
