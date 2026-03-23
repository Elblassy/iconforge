"use client";
import { useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { IconConfig } from "@/types/icon-config";
import { IconRenderer } from "@/lib/icon-renderer";

export function useIconRenderer(
  config: IconConfig,
  containerRef: RefObject<HTMLDivElement | null>
) {
  const rendererRef = useRef<IconRenderer>(new IconRenderer());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 16);

    return () => clearTimeout(timer);
  }, [config, containerRef]);

  return canvasRef;
}
