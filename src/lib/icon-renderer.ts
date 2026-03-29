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
   * Draw the icon/text with a drop shadow beneath it.
   */
  drawIconWithShadow(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    size: number,
    versionConfig: OdooVersionConfig
  ): void {
    ctx.save();

    const shadowOffsetY = size * versionConfig.dropShadowOffsetPercent;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = shadowOffsetY;
    ctx.shadowBlur = size * 0.04;
    ctx.shadowColor = hexToRgba("#000000", versionConfig.dropShadowAlpha);

    this.drawText(ctx, config, size / 2, size / 2, config.iconColor, true);

    ctx.restore();
  }

  /**
   * Draw text (or icon glyph) onto the canvas at (x, y).
   * Source type "image" is skipped here (handled separately via renderWithImage).
   *
   * When `color` is a plain string, it's used as a solid fill.
   * When `useColorConfig` is true, the icon's colorConfig is used to create
   * gradients/splits (only for the main icon draw, not for shadows).
   */
  drawText(
    ctx: CanvasRenderingContext2D,
    config: IconConfig,
    x: number,
    y: number,
    color: string,
    useColorConfig = false
  ): void {
    const { source, fontSize, fontWeight } = config;

    if (source.type === "image") {
      return;
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Set font
    if (source.type === "text") {
      ctx.font = `${fontWeight} ${fontSize}px "${source.fontFamily}"`;
    } else if (source.type === "icon") {
      ctx.font = `${fontWeight} ${fontSize}px "${source.iconSet}"`;
    }

    // Determine fill style
    if (useColorConfig && config.colorConfig && config.colorConfig.mode !== "solid") {
      ctx.fillStyle = this._createColorFill(ctx, config.colorConfig, config.iconWidth);
    } else {
      ctx.fillStyle = color;
    }

    // Draw
    if (source.type === "text") {
      ctx.fillText(source.text, x, y);
    } else if (source.type === "icon") {
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

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Create a CanvasGradient or CanvasPattern based on the color config.
   */
  private _createColorFill(
    ctx: CanvasRenderingContext2D,
    cc: IconColorConfig,
    size: number
  ): string | CanvasGradient {
    let gradient: CanvasGradient;

    const m = (cc.midpoint ?? 50) / 100; // 0-1

    switch (cc.mode) {
      case "gradient-diagonal":
        gradient = ctx.createLinearGradient(0, size, size, 0);
        gradient.addColorStop(0, cc.color1);
        gradient.addColorStop(m, cc.color2);
        return gradient;

      case "gradient-horizontal":
        gradient = ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, cc.color1);
        gradient.addColorStop(m, cc.color2);
        return gradient;

      case "gradient-vertical":
        gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, cc.color1);
        gradient.addColorStop(m, cc.color2);
        return gradient;

      case "gradient-radial":
        gradient = ctx.createRadialGradient(
          size / 2, size / 2, 0,
          size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0, cc.color1);
        gradient.addColorStop(m, cc.color2);
        return gradient;

      case "split-horizontal":
        gradient = ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(m - 0.001, cc.color1);
        gradient.addColorStop(m + 0.001, cc.color2);
        return gradient;

      case "split-vertical":
        gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(m - 0.001, cc.color1);
        gradient.addColorStop(m + 0.001, cc.color2);
        return gradient;

      case "split-diagonal":
        gradient = ctx.createLinearGradient(0, size, size, 0);
        gradient.addColorStop(m - 0.001, cc.color1);
        gradient.addColorStop(m + 0.001, cc.color2);
        return gradient;

      default:
        return cc.color1;
    }
  }

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
