"use client";
import { useRef, useEffect, useState } from "react";
import type { RefObject } from "react";
import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "@/lib/icon-renderer";
import { loadGoogleFont } from "@/lib/fonts";
import { loadIconSetCSS, getIconSets } from "@/lib/icon-sets";

const SYSTEM_FONTS = ["Arial", "Georgia", "Verdana", "Courier New", "Times New Roman"];

export function useIconRenderer(
  config: IconConfig,
  containerRef: RefObject<HTMLDivElement | null>
) {
  const rendererRef = useRef<IconRenderer>(new IconRenderer());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doRender() {
      try {
        // Load Google Font if needed before rendering
        if (
          config.source.type === "text" &&
          !SYSTEM_FONTS.includes(config.source.fontFamily)
        ) {
          await loadGoogleFont(config.source.fontFamily);
        }

        // Load icon set font if needed
        if (config.source.type === "icon") {
          const iconSource = config.source;
          const sets = getIconSets();
          const matchingSet = sets.find(s => s.fontFamily === iconSource.iconSet);
          if (matchingSet) {
            await loadIconSetCSS(matchingSet.id);
          }
        }

        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;

        let canvas: HTMLCanvasElement;

        if (
          config.source.type === "image" &&
          config.source.imageDataUrl
        ) {
          // Render using the uploaded image
          canvas = await new Promise<HTMLCanvasElement>((resolve) => {
            const img = new Image();
            img.onload = () => {
              resolve(rendererRef.current.renderWithImage(config, img));
            };
            img.onerror = () => {
              // Fallback to normal render on error
              resolve(rendererRef.current.render(config));
            };
            img.src = config.source.type === "image" ? config.source.imageDataUrl : "";
          });
        } else {
          canvas = rendererRef.current.render(config);
        }

        if (cancelled) return;

        // Draw logo overlay if present
        if (config.logoOverlay?.imageDataUrl) {
          await new Promise<void>((resolve) => {
            const logoImg = new Image();
            logoImg.onload = () => {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                rendererRef.current.drawLogoOverlay(ctx, config, config.iconWidth, logoImg);
              }
              resolve();
            };
            logoImg.onerror = () => resolve();
            logoImg.src = config.logoOverlay!.imageDataUrl;
          });
        }

        if (cancelled) return;

        // Display at 256px CSS size (2x) for a clear preview, actual pixels stay at 128
        canvas.style.width = "256px";
        canvas.style.height = "256px";
        canvas.style.imageRendering = "auto";

        const existing = container.querySelector("canvas");
        if (existing) {
          container.replaceChild(canvas, existing);
        } else {
          container.appendChild(canvas);
        }

        canvasRef.current = canvas;
        setRenderError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to render icon";
        console.error("[useIconRenderer] Render error:", err);
        if (!cancelled) {
          setRenderError(message);
          // Display error message in container instead of canvas
          const container = containerRef.current;
          if (container) {
            const existing = container.querySelector("canvas");
            if (existing) container.removeChild(existing);
            const errorEl = container.querySelector("[data-render-error]") as HTMLElement | null;
            if (errorEl) {
              errorEl.textContent = `Render error: ${message}`;
            } else {
              const div = document.createElement("div");
              div.dataset.renderError = "true";
              div.textContent = `Render error: ${message}`;
              div.style.cssText =
                "width:256px;height:256px;display:flex;align-items:center;justify-content:center;background:#fee2e2;color:#dc2626;font-size:12px;padding:8px;text-align:center;border-radius:8px;";
              container.appendChild(div);
            }
          }
        }
      }
    }

    const timer = setTimeout(() => {
      doRender();
    }, 16);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [config, containerRef]);

  return canvasRef;
}
