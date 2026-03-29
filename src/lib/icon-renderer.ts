import type { IconConfig, IconColorConfig, LogoOverlay, OdooVersionConfig } from "@/types/icon-config";
import { getVersionConfig } from "./odoo-versions";
import { shadeColor, hexToRgba } from "./color-utils";

export class IconRenderer {
  /**
   * Main entry point. Orchestrates the full rendering pipeline.
   */
  render(config: IconConfig): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    const size = config.iconWidth;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d")!;
    const versionConfig = getVersionConfig(config.odooVersion);

    const cornerRadius =
      config.cornerRadiusOverride !== undefined
        ? config.cornerRadiusOverride
        : size * versionConfig.cornerRadiusPercent;

    const isTransparent = config.backgroundColor === "transparent";

    // Clip everything to the rounded rect so shadows/gradient respect corners
    this._roundedRectPath(ctx, 0, 0, size, size, cornerRadius);
    ctx.clip();

    // Draw background (skip if transparent)
    if (!isTransparent) {
      this.drawBackground(ctx, size, cornerRadius, config.backgroundColor);
    }

    // Shadows and effects only on solid backgrounds
    if (!isTransparent) {
      if (versionConfig.hasHardShadow) {
        const shadowColor = shadeColor(
          config.backgroundColor,
          versionConfig.hardShadowDarken
        );
        this.drawHardShadow(ctx, config, size, shadowColor);
      }
    }

    this.drawIconWithShadow(ctx, config, size, versionConfig);

    if (!isTransparent) {
      this.drawInnerShadows(
        ctx,
        size,
        cornerRadius,
        versionConfig.innerShadowAlpha
      );

      this.drawGradient(ctx, size, versionConfig.gradientAlpha);
    }

    return canvas;
  }

  /**
   * Draw a company logo overlay image onto the canvas.
   */
  drawLogoOverlay(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    size: number,
    logoImage: HTMLImageElement
  ): void {
    const overlay = config.logoOverlay;
    if (!overlay) return;

    const logoSize = size * (overlay.size / 100);
    const padding = size * 0.05;

    let x: number;
    let y: number;

    switch (overlay.position) {
      case "top-left":
        x = padding;
        y = padding;
        break;
      case "top-right":
        x = size - padding - logoSize;
        y = padding;
        break;
      case "bottom-left":
        x = padding;
        y = size - padding - logoSize;
        break;
      case "bottom-right":
        x = size - padding - logoSize;
        y = size - padding - logoSize;
        break;
      case "center":
        x = (size - logoSize) / 2;
        y = (size - logoSize) / 2;
        break;
      default:
        x = padding;
        y = padding;
    }

    // Draw logo image
    ctx.save();
    ctx.drawImage(logoImage, x, y, logoSize, logoSize);
    ctx.restore();
  }

  /**
   * Draw a rounded rectangle, clip it, then fill with the given color.
   */
  drawBackground(
    ctx: CanvasRenderingContext2D,
    size: number,
    _radius: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
  }

  /**
   * Draw the "hard shadow" effect used in older Odoo versions (16, 17).
   * Renders text repeatedly at slight vertical offsets using a darkened color.
   */
  drawHardShadow(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    size: number,
    shadowColor: string
  ): void {
    const steps = Math.round(size * (2 / 3));
    for (let i = 1; i <= steps; i++) {
      this.drawText(ctx, config, size / 2, size / 2 + i, shadowColor);
    }
  }

  /**
   * Draw the icon with color regions.
   * - solid: single color
   * - tinted: auto dark/main/light diagonal bands
   * - complementary: left-right split, two colors
   * - tricolor: three diagonal bands
   * Each mode clips the icon to a region and fills with a different color.
   */
  drawIconWithShadow(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    size: number,
    versionConfig: OdooVersionConfig
  ): void {
    const cc = config.colorConfig;
    const mode = cc?.mode ?? "solid";

    if (mode === "solid" || !cc) {
      ctx.save();
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = size * versionConfig.dropShadowOffsetPercent;
      ctx.shadowBlur = size * 0.04;
      ctx.shadowColor = hexToRgba("#000000", versionConfig.dropShadowAlpha);
      this.drawText(ctx, config, size / 2, size / 2, config.iconColor);
      ctx.restore();
      return;
    }

    // Tinted: smooth gradient from dark → main → light
    if (mode === "tinted") {
      const dark = shadeColor(cc.color1, -30);
      const light = shadeColor(cc.color1, 40);
      const gradient = ctx.createLinearGradient(0, 0, size, 0);
      gradient.addColorStop(0, dark);
      gradient.addColorStop(0.5, cc.color1);
      gradient.addColorStop(1, light);
      this._drawTextWithFill(ctx, config, size, gradient);
      return;
    }

    // Duo / Trio: clip regions
    const regions = this._getColorRegions(cc, size);

    for (const region of regions) {
      ctx.save();
      // Clip to this region's area
      ctx.beginPath();
      ctx.moveTo(region.clip[0], region.clip[1]);
      for (let i = 2; i < region.clip.length; i += 2) {
        ctx.lineTo(region.clip[i], region.clip[i + 1]);
      }
      ctx.closePath();
      ctx.clip();
      // Draw the full icon in this color — only the clipped part shows
      this.drawText(ctx, config, size / 2, size / 2, region.color);
      ctx.restore();
    }
  }

  /**
   * Define clip regions for multi-color modes.
   * Each region is a rectangle (array of x,y pairs) and a color.
   * Uses vertical bands so every color crosses through the icon center.
   */
  private _getColorRegions(
    cc: IconColorConfig,
    size: number
  ): { clip: number[]; color: string }[] {
    const s = size;

    if (cc.mode === "tinted") {
      // Tinted uses a smooth gradient — handled in drawIconWithShadow, not clip regions
      return [];
    }

    if (cc.mode === "complementary") {
      const half = s / 2;
      return [
        { clip: [0, 0, half, 0, half, s, 0, s], color: cc.color1 },
        { clip: [half, 0, s, 0, s, s, half, s], color: cc.color2 },
      ];
    }

    if (cc.mode === "tricolor") {
      const t = s / 3;
      return [
        { clip: [0, 0, t, 0, t, s, 0, s], color: cc.color1 },
        { clip: [t, 0, t * 2, 0, t * 2, s, t, s], color: cc.color2 },
        { clip: [t * 2, 0, s, 0, s, s, t * 2, s], color: cc.color3 },
      ];
    }

    return [{ clip: [0, 0, s, 0, s, s, 0, s], color: cc.color1 }];
  }

  /**
   * Draw text (or icon glyph) onto the canvas at (x, y) with a solid color.
   */
  drawText(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    x: number,
    y: number,
    color: string
  ): void {
    const { source, fontSize, fontWeight } = config;

    if (source.type === "image") return;

    ctx.save();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (source.type === "text") {
      ctx.font = `${fontWeight} ${fontSize}px "${source.fontFamily}"`;
      ctx.fillText(source.text, x, y);
    } else if (source.type === "icon") {
      ctx.font = `${fontWeight} ${fontSize}px "${source.iconSet}"`;
      const glyph = source.unicodeChar || this._resolveIconUnicode(source.iconClass);
      if (glyph) {
        ctx.fillText(glyph, x, y);
      }
    }

    ctx.restore();
  }

  /**
   * Draw subtle inner shadows along the top and bottom edges.
   * Bottom edge uses a dark color; top edge uses white.
   */
  drawInnerShadows(
    ctx: CanvasRenderingContext2D,
    size: number,
    radius: number,
    alpha: number
  ): void {
    if (alpha <= 0) return;

    const stripHeight = size * 0.015;

    // Bottom inner shadow (dark)
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#282F33";
    this._roundedRectPath(
      ctx,
      0,
      size - stripHeight,
      size,
      stripHeight,
      radius
    );
    ctx.fill();
    ctx.restore();

    // Top inner shadow (light)
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#FFFFFF";
    this._roundedRectPath(ctx, 0, 0, size, stripHeight, radius);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Overlay a diagonal gradient (transparent → white) for a sheen effect.
   */
  drawGradient(
    ctx: CanvasRenderingContext2D,
    size: number,
    alpha: number
  ): void {
    if (alpha <= 0) return;

    // Linear gradient from bottom-left to top-right
    const gradient = ctx.createLinearGradient(0, size, size, 0);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  /**
   * Render a canvas using an HTMLImageElement as the icon source.
   * Draws the background, centers the image at 60 % of canvas size,
   * then overlays inner shadows and gradient on top.
   */
  renderWithImage(
    config: IconConfig,
    image: HTMLImageElement
  ): HTMLCanvasElement {
    // Render background layers (hard shadow / drop shadow are skipped since
    // source type is "image" and drawText is a no-op for that type).
    const canvas = this.render(config);
    const size = config.iconWidth;
    const ctx = canvas.getContext("2d")!;

    const versionConfig = getVersionConfig(config.odooVersion);
    const cornerRadius =
      config.cornerRadiusOverride !== undefined
        ? config.cornerRadiusOverride
        : size * versionConfig.cornerRadiusPercent;

    // Draw the image centered at 60 % of the canvas size
    const imgSize = size * 0.6;
    const imgX = (size - imgSize) / 2;
    const imgY = (size - imgSize) / 2;
    ctx.drawImage(image, imgX, imgY, imgSize, imgSize);

    // Redraw inner shadows and gradient on top of the image
    this.drawInnerShadows(
      ctx,
      size,
      cornerRadius,
      versionConfig.innerShadowAlpha
    );
    this.drawGradient(ctx, size, versionConfig.gradientAlpha);

    return canvas;
  }

  /**
   * Draw icon text using a custom fillStyle (e.g. CanvasGradient).
   */
  private _drawTextWithFill(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    size: number,
    fill: string | CanvasGradient
  ): void {
    const { source, fontSize, fontWeight } = config;
    if (source.type === "image") return;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (source.type === "text") {
      ctx.font = `${fontWeight} ${fontSize}px "${source.fontFamily}"`;
      ctx.fillText(source.text, size / 2, size / 2);
    } else if (source.type === "icon") {
      ctx.font = `${fontWeight} ${fontSize}px "${source.iconSet}"`;
      const glyph = source.unicodeChar || this._resolveIconUnicode(source.iconClass);
      if (glyph) ctx.fillText(glyph, size / 2, size / 2);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------



  /**
   * Resolve a CSS icon class to its unicode character via the DOM.
   * Creates a temporary element, reads the ::before content.
   */
  private _resolveIconUnicode(iconClass: string): string | null {
    if (typeof document === "undefined") return null;
    const el = document.createElement("i");
    el.className = iconClass;
    el.style.cssText = "position:absolute;top:-9999px;left:-9999px;visibility:hidden";
    document.body.appendChild(el);
    const content = window.getComputedStyle(el, "::before").getPropertyValue("content");
    document.body.removeChild(el);
    if (content && content !== "none" && content !== '""' && content !== "''") {
      return content.replace(/^["']|["']$/g, "");
    }
    return null;
  }

  /**
   * Build a rounded-rectangle path.
   */
  private _roundedRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}
