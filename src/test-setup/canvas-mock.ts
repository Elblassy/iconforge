/**
 * Canvas mock for jsdom test environment.
 *
 * jsdom does not implement HTMLCanvasElement's getContext() and toDataURL().
 * This setup file patches HTMLCanvasElement with a minimal mock so that
 * tests can exercise canvas-based code without the native `canvas` npm package.
 */

// ---------------------------------------------------------------------------
// Minimal CanvasRenderingContext2D mock
// ---------------------------------------------------------------------------

function createMockContext(): CanvasRenderingContext2D {
  const ctx = {
    // State
    fillStyle: "",
    strokeStyle: "",
    globalAlpha: 1,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    textAlign: "start" as CanvasTextAlign,
    textBaseline: "alphabetic" as CanvasTextBaseline,
    font: "",
    lineWidth: 1,
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
    miterLimit: 10,
    lineDashOffset: 0,
    globalCompositeOperation: "source-over" as GlobalCompositeOperation,

    // Path methods
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),

    // Drawing methods
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    drawImage: vi.fn(),

    // Clipping
    clip: vi.fn(),

    // Transformations
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    getTransform: vi.fn(() => new DOMMatrix()),

    // Gradients & patterns
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createPattern: vi.fn(() => null),
    createConicGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),

    // Image data
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
    putImageData: vi.fn(),

    // Measurement
    measureText: vi.fn(() => ({
      width: 50,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 2,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 50,
      fontBoundingBoxAscent: 12,
      fontBoundingBoxDescent: 4,
      emHeightAscent: 10,
      emHeightDescent: 2,
      hangingBaseline: 8,
      alphabeticBaseline: 0,
      ideographicBaseline: -2,
    })),

    // Line dash
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),

    // Path2D
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),

    canvas: null as unknown as HTMLCanvasElement,
  } as unknown as CanvasRenderingContext2D;

  return ctx;
}

// ---------------------------------------------------------------------------
// Patch HTMLCanvasElement
// ---------------------------------------------------------------------------

if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = function (
    contextId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    if (contextId === "2d") {
      const ctx = createMockContext();
      // Back-reference so canvas methods can access it
      (ctx as unknown as { canvas: HTMLCanvasElement }).canvas = this;
      return ctx;
    }
    return null;
  };

  // jsdom does not implement toDataURL; provide a minimal stub
  HTMLCanvasElement.prototype.toDataURL = function (
    type?: string
  ): string {
    const mimeType = type ?? "image/png";
    return `data:${mimeType};base64,AAAA`;
  };
}
