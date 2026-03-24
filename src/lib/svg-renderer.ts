import type { IconConfig, IconColorConfig } from "@/types/icon-config";
import { IconRenderer } from "./icon-renderer";

// ─── CDN URL mapping ────────────────────────────────────────────────────────

function getIconSvgUrls(iconSet: string, iconClass: string): string[] {
  const parts = iconClass.split(" ");
  const urls: string[] = [];

  if (iconSet === "bootstrap-icons") {
    const name = parts.find((p) => p.startsWith("bi-"))?.replace("bi-", "");
    if (name) urls.push(`https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`);
  }

  if (iconSet === "Font Awesome 6 Free") {
    const stylePart = parts.find((p) => ["fa-solid", "fa-regular", "fa-brands"].includes(p));
    const namePart = parts.find((p) => p.startsWith("fa-") && !["fa-solid", "fa-regular", "fa-brands"].includes(p));
    const style = stylePart?.replace("fa-", "") || "solid";
    const name = namePart?.replace("fa-", "");
    if (name) urls.push(`https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/${style}/${name}.svg`);
  }

  if (iconSet === "remixicon") {
    const name = parts[0]?.replace("ri-", "");
    if (name) {
      for (const cat of ["System", "Business", "Design", "Development", "Document", "Editor", "Finance", "Health", "Logos", "Map", "Media", "Communication", "User", "Weather", "Buildings", "Device", "Arrows", "Others"]) {
        urls.push(`https://cdn.jsdelivr.net/npm/remixicon@4.1.0/icons/${cat}/${name}.svg`);
      }
    }
  }

  if (iconSet === "tabler-icons") {
    const name = parts.find((p) => p.startsWith("ti-") && p !== "ti")?.replace("ti-", "");
    if (name) {
      urls.push(`https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/outline/${name}.svg`);
      urls.push(`https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/filled/${name}.svg`);
    }
  }

  return urls;
}

async function fetchSvgElement(url: string): Promise<SVGSVGElement | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const doc = new DOMParser().parseFromString(await r.text(), "image/svg+xml");
    return doc.querySelector("svg");
  } catch { return null; }
}

// ─── SVG color helpers ──────────────────────────────────────────────────────

/**
 * Build SVG <defs> for gradient/split fill based on colorConfig, and return
 * the fill attribute value (either a color string or a url(#id) reference).
 */
function buildSvgColorDefs(cc: IconColorConfig | undefined, iconColor: string): { defs: string; fill: string } {
  if (!cc || cc.mode === "solid") {
    return { defs: "", fill: escapeXml(iconColor) };
  }

  const id = "iconFill";
  const c1 = escapeXml(cc.color1);
  const c2 = escapeXml(cc.color2);

  switch (cc.mode) {
    case "gradient-diagonal":
      return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`,
        fill: `url(#${id})`,
      };
    case "gradient-horizontal":
      return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`,
        fill: `url(#${id})`,
      };
    case "gradient-vertical":
      return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`,
        fill: `url(#${id})`,
      };
    case "gradient-radial":
      return {
        defs: `<defs><radialGradient id="${id}" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`,
        fill: `url(#${id})`,
      };
    case "split-horizontal":
      return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop offset="0.499" stop-color="${c1}"/><stop offset="0.501" stop-color="${c2}"/></linearGradient></defs>`,
        fill: `url(#${id})`,
      };
    case "split-vertical":
      return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0.499" stop-color="${c1}"/><stop offset="0.501" stop-color="${c2}"/></linearGradient></defs>`,
        fill: `url(#${id})`,
      };
    case "split-diagonal":
      return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox"><stop offset="0.499" stop-color="${c1}"/><stop offset="0.501" stop-color="${c2}"/></linearGradient></defs>`,
        fill: `url(#${id})`,
      };
    default:
      return { defs: "", fill: escapeXml(iconColor) };
  }
}

/**
 * Apply fill to all shapes in an SVG element.
 */
function recolorSvg(svgEl: SVGSVGElement, fill: string): void {
  svgEl.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
    if (shape.getAttribute("fill") !== "none") shape.setAttribute("fill", fill);
    if (shape.getAttribute("stroke") && shape.getAttribute("stroke") !== "none") shape.setAttribute("stroke", fill);
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Render the full icon (with background) via canvas, wrap as base64 in SVG.
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
 * Render the icon as Odoo 17+ style SVG.
 * - Icon fonts: fetch real SVG from CDN, apply color/gradient
 * - Text/image: render on canvas, embed as base64
 * No background, no overlay gradient.
 */
export async function renderOdoo17Svg(config: IconConfig): Promise<string> {
  const source = config.source;
  const { defs, fill } = buildSvgColorDefs(config.colorConfig, config.iconColor);

  // ── Icon font: fetch real SVG paths ──
  if (source.type === "icon") {
    const urls = getIconSvgUrls(source.iconSet, source.iconClass);
    for (const url of urls) {
      const svgEl = await fetchSvgElement(url);
      if (svgEl) {
        let viewBox = svgEl.getAttribute("viewBox") || "0 0 50 50";

        if (fill.startsWith("url(")) {
          // Gradient/split: inject defs and set fill on shapes
          recolorSvg(svgEl, fill);
          svgEl.setAttribute("width", "50");
          svgEl.setAttribute("height", "50");
          // Inject defs
          const defsEl = new DOMParser().parseFromString(
            `<svg xmlns="http://www.w3.org/2000/svg">${defs}</svg>`,
            "image/svg+xml"
          ).querySelector("defs");
          if (defsEl) svgEl.prepend(defsEl);
          return new XMLSerializer()
            .serializeToString(svgEl)
            .replace(/<\?xml[^?]*\?>\s*/g, "");
        }

        // Solid color
        recolorSvg(svgEl, fill);
        svgEl.setAttribute("width", "50");
        svgEl.setAttribute("height", "50");
        return new XMLSerializer()
          .serializeToString(svgEl)
          .replace(/<\?xml[^?]*\?>\s*/g, "");
      }
    }
    console.warn("Odoo 17+ SVG: no SVG found for", source.iconClass);
  }

  // ── Text/image/fallback: render via canvas and embed as base64 ──
  const renderSize = 256;
  const canvas = document.createElement("canvas");
  canvas.width = renderSize;
  canvas.height = renderSize;
  const ctx = canvas.getContext("2d")!;

  const scaledFontSize = Math.round(renderSize * (config.fontSize / config.iconWidth));

  if (source.type === "text") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.fontFamily}"`;

    // Apply color mode to canvas
    const cc = config.colorConfig;
    if (cc && cc.mode !== "solid") {
      const renderer = new IconRenderer();
      ctx.fillStyle = renderer["_createColorFill"](ctx, cc, renderSize);
    } else {
      ctx.fillStyle = config.iconColor;
    }
    ctx.fillText(source.text, renderSize / 2, renderSize / 2);
  } else if (source.type === "image" && source.imageDataUrl) {
    // Embed image directly
    return [
      `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
      `  <image width="50" height="50" href="${source.imageDataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
      `</svg>`,
    ].join("\n");
  } else if (source.type === "icon") {
    // Icon font fallback — render glyph on canvas
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.iconSet}"`;
    const renderer = new IconRenderer();
    const cc = config.colorConfig;
    if (cc && cc.mode !== "solid") {
      ctx.fillStyle = renderer["_createColorFill"](ctx, cc, renderSize);
    } else {
      ctx.fillStyle = config.iconColor;
    }
    const glyph = source.unicodeChar || renderer["_resolveIconUnicode"](source.iconClass);
    if (glyph) ctx.fillText(glyph, renderSize / 2, renderSize / 2);
  }

  const dataUrl = canvas.toDataURL("image/png");
  return [
    `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
    `  <image width="50" height="50" href="${dataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
    `</svg>`,
  ].join("\n");
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Download SVG with background (canvas-based).
 */
export function downloadSvg(config: IconConfig, filename = "odoo-icon.svg", canvasDataUrl?: string): void {
  const blob = new Blob([renderSvg(config, canvasDataUrl)], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
