import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "./icon-renderer";

/**
 * Maps icon set + icon class to candidate CDN URLs for the individual SVG file.
 * Returns multiple candidates to try in order (first success wins).
 */
function getIconSvgUrls(iconSet: string, iconClass: string): string[] {
  const parts = iconClass.split(" ");
  const urls: string[] = [];

  if (iconSet === "bootstrap-icons") {
    // "bi bi-box-seam" → "box-seam"
    const name = parts.find((p) => p.startsWith("bi-"))?.replace("bi-", "");
    if (name) {
      urls.push(`https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`);
    }
  }

  if (iconSet === "Font Awesome 6 Free") {
    // "fa-solid fa-house" → style="solid", name="house"
    const stylePart = parts.find((p) =>
      ["fa-solid", "fa-regular", "fa-brands"].includes(p)
    );
    const namePart = parts.find(
      (p) => p.startsWith("fa-") && !["fa-solid", "fa-regular", "fa-brands"].includes(p)
    );
    const style = stylePart?.replace("fa-", "") || "solid";
    const name = namePart?.replace("fa-", "");
    if (name) {
      urls.push(`https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/${style}/${name}.svg`);
    }
  }

  if (iconSet === "remixicon") {
    // Remix organizes by category — try common categories
    const name = parts[0]?.replace("ri-", "");
    if (name) {
      const categories = [
        "System", "Business", "Design", "Development", "Document",
        "Editor", "Finance", "Health", "Logos", "Map", "Media",
        "Communication", "User", "Weather", "Buildings", "Device",
        "Arrows", "Others",
      ];
      for (const cat of categories) {
        urls.push(`https://cdn.jsdelivr.net/npm/remixicon@4.1.0/icons/${cat}/${name}.svg`);
      }
    }
  }

  if (iconSet === "tabler-icons") {
    // "ti ti-home" → "home"
    const name = parts.find((p) => p.startsWith("ti-") && p !== "ti")?.replace("ti-", "");
    if (name) {
      urls.push(`https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/outline/${name}.svg`);
      urls.push(`https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/filled/${name}.svg`);
    }
  }

  return urls;
}

/**
 * Fetch an SVG from URL, extract the path/shape elements, and recolor them.
 */
async function fetchAndRecolorSvg(
  url: string,
  fillColor: string
): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    let svgText = await response.text();

    // Parse the SVG to extract content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) return null;

    // Get the original viewBox or derive from width/height
    let viewBox = svgEl.getAttribute("viewBox");
    if (!viewBox) {
      const w = svgEl.getAttribute("width") || "50";
      const h = svgEl.getAttribute("height") || "50";
      viewBox = `0 0 ${w} ${h}`;
    }

    // Recolor all paths, circles, rects, polygons to the user's chosen color
    const shapes = svgEl.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    shapes.forEach((shape) => {
      const currentFill = shape.getAttribute("fill");
      // Don't override "none" fills (strokes only) or "currentColor"
      if (currentFill !== "none") {
        shape.setAttribute("fill", fillColor);
      }
      // Also recolor strokes if present
      const currentStroke = shape.getAttribute("stroke");
      if (currentStroke && currentStroke !== "none") {
        shape.setAttribute("stroke", fillColor);
      }
    });

    // Also set fill on the root SVG for icons that inherit color
    svgEl.setAttribute("fill", fillColor);

    // Build clean output SVG with 50x50 display size
    svgEl.setAttribute("width", "50");
    svgEl.setAttribute("height", "50");

    // Remove comments and unnecessary attributes
    const serializer = new XMLSerializer();
    let output = serializer.serializeToString(svgEl);

    // Clean up XML declaration if present
    output = output.replace(/<\?xml[^?]*\?>\s*/g, "");

    return output;
  } catch (err) {
    console.warn("Failed to fetch/recolor SVG:", err);
    return null;
  }
}

/**
 * Render the icon via canvas, then wrap as a base64 image in SVG.
 * Used for "SVG (with bg)" export — full icon with background.
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
 * Render the icon as Odoo 17+ style SVG: fetch the actual SVG from CDN,
 * recolor it, and output as a clean vector SVG. No background, no gradient.
 */
export async function renderOdoo17Svg(config: IconConfig): Promise<string> {
  const source = config.source;

  if (source.type === "text") {
    // Text mode: output SVG <text>
    const fontSize = Math.round(50 * (config.fontSize / config.iconWidth));
    return [
      `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
      `  <text x="25" y="25" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(source.fontFamily)}" font-size="${fontSize}" font-weight="${config.fontWeight}" fill="${escapeXml(config.iconColor)}">${escapeXml(source.text)}</text>`,
      `</svg>`,
    ].join("\n");
  }

  if (source.type === "icon") {
    const urls = getIconSvgUrls(source.iconSet, source.iconClass);
    for (const url of urls) {
      const svg = await fetchAndRecolorSvg(url, config.iconColor);
      if (svg) return svg;
    }
    console.warn("Odoo 17+ SVG: no SVG found for", source.iconClass, "tried:", urls);
  }

  // Fallback: colored circle
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
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Download as Odoo 17+ format: real SVG paths from CDN, recolored, no bg.
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
