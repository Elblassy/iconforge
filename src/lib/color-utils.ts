/**
 * Shade a hex color by a percentage.
 * Negative percent darkens; positive percent lightens.
 */
export function shadeColor(hex: string, percent: number): string {
  let num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return (
    "#" +
    (
      0x1000000 +
      (R << 16) +
      (G << 8) +
      B
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Convert a hex color and alpha value to an rgba() CSS string.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
