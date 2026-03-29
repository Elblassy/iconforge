import type { IconConfig, IconColorConfig } from "@/types/icon-config";
import { IconRenderer } from "./icon-renderer";
import { shadeColor } from "./color-utils";

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

// ─── SVG helpers ────────────────────────────────────────────────────────────

function recolorSvg(svgEl: SVGSVGElement, fill: string): void {
  svgEl.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse").forEach((shape) => {
    if (shape.getAttribute("fill") !== "none") shape.setAttribute("fill", fill);
    if (shape.getAttribute("stroke") && shape.getAttribute("stroke") !== "none") shape.setAttribute("stroke", fill);
  });
}

function extractInnerContent(svgEl: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  let content = "";
  svgEl.childNodes.forEach((node) => {
    if (node.nodeType === 1) {
      const tag = (node as Element).tagName?.toLowerCase();
      if (tag !== "defs" && tag !== "style") {
        content += serializer.serializeToString(node);
      }
    }
  });
  return content;
}

function recolorContent(content: string, color: string): string {
  return content
    .replace(/fill="(?!none)[^"]*"/g, `fill="${color}"`)
    .replace(/stroke="(?!none)[^"]*"/g, `stroke="${color}"`);
}

/**
 * Get clip-region color definitions for multi-color SVG output.
 * Returns SVG clipPath defs and colored groups.
 */
function getColorRegionsSvg(
  cc: IconColorConfig | undefined,
  iconColor: string,
  size: number
): { color: string; clipPoints: string }[] {
  if (!cc || cc.mode === "solid") {
    return [{ color: iconColor, clipPoints: `0,0 ${size},0 ${size},${size} 0,${size}` }];
  }

  const s = size;

  if (cc.mode === "tinted") {
    // Tinted uses SVG gradient — handled separately in renderOdoo17Svg
    return [];
  }

  if (cc.mode === "complementary") {
    const half = (s / 2).toFixed(2);
    return [
      { color: cc.color1, clipPoints: `0,0 ${half},0 ${half},${s} 0,${s}` },
      { color: cc.color2, clipPoints: `${half},0 ${s},0 ${s},${s} ${half},${s}` },
    ];
  }

  if (cc.mode === "tricolor") {
    const t = (s / 3).toFixed(2);
    const t2 = (s * 2 / 3).toFixed(2);
    return [
      { color: cc.color1, clipPoints: `0,0 ${t},0 ${t},${s} 0,${s}` },
      { color: cc.color2, clipPoints: `${t},0 ${t2},0 ${t2},${s} ${t},${s}` },
      { color: cc.color3, clipPoints: `${t2},0 ${s},0 ${s},${s} ${t2},${s}` },
    ];
  }

  return [{ color: iconColor, clipPoints: `0,0 ${s},0 ${s},${s} 0,${s}` }];
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
 * Render the icon as Odoo 17+ style SVG with layered multi-color support.
 * - Icon fonts: fetch real SVG from CDN, duplicate as offset colored layers
 * - Text/image: render via canvas, embed as base64
 */
export async function renderOdoo17Svg(config: IconConfig): Promise<string> {
  const source = config.source;
  const targetSize = 50;
  const regions = getColorRegionsSvg(config.colorConfig, config.iconColor, targetSize);

  const cc = config.colorConfig;
  const isTinted = cc?.mode === "tinted";
  const isBlendGradient = isTinted || (cc?.blend && (cc?.mode === "complementary" || cc?.mode === "tricolor"));

  // ── Icon font: fetch real SVG paths ──
  if (source.type === "icon") {
    const urls = getIconSvgUrls(source.iconSet, source.iconClass);
    for (const url of urls) {
      const svgEl = await fetchSvgElement(url);
      if (svgEl) {
        const vb = svgEl.getAttribute("viewBox") || "0 0 16 16";
        const [vbX, vbY, vbW, vbH] = vb.split(" ").map(Number);

        const padding = targetSize * 0.05;
        const innerSize = targetSize - padding * 2;
        const scale = innerSize / Math.max(vbW, vbH);
        const ox = padding + (innerSize - vbW * scale) / 2 - vbX * scale;
        const oy = padding + (innerSize - vbH * scale) / 2 - vbY * scale;

        const innerContent = extractInnerContent(svgEl);

        // Gradient blend: tinted, or duo/trio with blend ON
        if (isBlendGradient && cc) {
          let stops: string;
          if (isTinted) {
            const dark = shadeColor(cc.color1, -30);
            const light = shadeColor(cc.color1, 40);
            stops = `<stop offset="0" stop-color="${dark}"/><stop offset="0.5" stop-color="${cc.color1}"/><stop offset="1" stop-color="${light}"/>`;
          } else if (cc.mode === "complementary") {
            stops = `<stop offset="0" stop-color="${cc.color1}"/><stop offset="1" stop-color="${cc.color2}"/>`;
          } else {
            stops = `<stop offset="0" stop-color="${cc.color1}"/><stop offset="0.5" stop-color="${cc.color2}"/><stop offset="1" stop-color="${cc.color3}"/>`;
          }
          const colored = recolorContent(innerContent, "url(#blendGrad)");
          return [
            `<svg width="${targetSize}" height="${targetSize}" viewBox="0 0 ${targetSize} ${targetSize}" xmlns="http://www.w3.org/2000/svg">`,
            `  <defs>`,
            `    <linearGradient id="blendGrad" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient>`,
            `  </defs>`,
            `  <g transform="translate(${ox.toFixed(2)}, ${oy.toFixed(2)}) scale(${scale.toFixed(4)})" fill="url(#blendGrad)" stroke="url(#blendGrad)">`,
            `    ${colored}`,
            `  </g>`,
            `</svg>`,
          ].join("\n");
        }

        // Duo / Trio: clip regions
        const parts: string[] = [
          `<svg width="${targetSize}" height="${targetSize}" viewBox="0 0 ${targetSize} ${targetSize}" xmlns="http://www.w3.org/2000/svg">`,
          `  <defs>`,
        ];

        regions.forEach((r, i) => {
          parts.push(`    <clipPath id="region${i}"><polygon points="${r.clipPoints}"/></clipPath>`);
        });
        parts.push(`  </defs>`);

        regions.forEach((r, i) => {
          const colored = recolorContent(innerContent, r.color);
          parts.push(`  <g clip-path="url(#region${i})">`);
          parts.push(`    <g transform="translate(${ox.toFixed(2)}, ${oy.toFixed(2)}) scale(${scale.toFixed(4)})" fill="${r.color}" stroke="${r.color}">`);
          parts.push(`      ${colored}`);
          parts.push(`    </g>`);
          parts.push(`  </g>`);
        });

        parts.push(`</svg>`);
        return parts.join("\n");
      }
    }
    console.warn("Odoo 17+ SVG: no SVG found for", source.iconClass);
  }

  // ── Image: embed directly ──
  if (source.type === "image" && source.imageDataUrl) {
    return [
      `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
      `  <image width="50" height="50" href="${source.imageDataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
      `</svg>`,
    ].join("\n");
  }

  // ── Text / icon fallback: render via canvas with clip regions ──
  const renderSize = 256;
  const canvas = document.createElement("canvas");
  canvas.width = renderSize;
  canvas.height = renderSize;
  const ctx = canvas.getContext("2d")!;
  const scaledFontSize = Math.round(renderSize * (config.fontSize / config.iconWidth));
  const canvasRegions = getColorRegionsSvg(config.colorConfig, config.iconColor, renderSize);

  const drawGlyph = (color: string) => {
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (source.type === "text") {
      ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.fontFamily}"`;
      ctx.fillText(source.text, renderSize / 2, renderSize / 2);
    } else if (source.type === "icon") {
      ctx.font = `${config.fontWeight} ${scaledFontSize}px "${source.iconSet}"`;
      const renderer = new IconRenderer();
      const glyph = source.unicodeChar || renderer["_resolveIconUnicode"](source.iconClass);
      if (glyph) ctx.fillText(glyph, renderSize / 2, renderSize / 2);
    }
  };

  for (const region of canvasRegions) {
    ctx.save();
    // Parse clip points and create canvas clip path
    const pts = region.clipPoints.split(" ").map((p) => p.split(",").map(Number));
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.clip();
    drawGlyph(region.color);
    ctx.restore();
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
