"use client";
import { useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "@/lib/icon-renderer";
import { loadGoogleFont } from "@/lib/fonts";

const SYSTEM_FONTS = ["Arial", "Georgia", "Verdana", "Courier New", "Times New Roman"];

export function useIconRenderer(
  config: IconConfig,
  containerRef: RefObject<HTMLDivElement | null>
) {
  const rendererRef = useRef<IconRenderer>(new IconRenderer());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function doRender() {
      // Load Google Font if needed before rendering
      if (
        config.source.type === "text" &&
        !SYSTEM_FONTS.includes(config.source.fontFamily)
      ) {
        await loadGoogleFont(config.source.fontFamily);
      }

      if (cancelled) return;

      const container = containerRef.current;
      if (!container) return;

      const canvas = rendererRef.current.render(config);
      canvas.style.maxWidth = "100%";
      canvas.style.height = "auto";

      const existing = container.querySelector("canvas");
      if (existing) {
        container.replaceChild(canvas, existing);
      } else {
        container.appendChild(canvas);
      }

      canvasRef.current = canvas;
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
