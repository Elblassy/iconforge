"use client";
import { useRef, useState } from "react";
import type { IconConfig } from "@/types/icon-config";
import { useIconRenderer } from "@/hooks/useIconRenderer";
import { Button } from "@/components/ui/button";
import { downloadSvg } from "@/lib/svg-renderer";
import { BatchExport } from "./BatchExport";
import { saveIcon } from "@/lib/storage";

interface IconCanvasProps {
  config: IconConfig;
}

export function IconCanvas({ config }: IconCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useIconRenderer(config, containerRef);
  const [zoom, setZoom] = useState<50 | 100 | 200>(100);

  const handleDownloadPng = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "odoo-icon.png";
    link.click();
  };

  const handleSaveLocally = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const name = window.prompt("Name this icon:", "My Icon");
    if (!name) return;
    const thumbnail = canvas.toDataURL("image/png");
    saveIcon(name.trim() || "My Icon", config, thumbnail);
  };

  const handleCopyToClipboard = async () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Checkerboard background with canvas */}
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          background:
            "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, transparent 0% 50%)",
          backgroundSize: "20px 20px",
          padding: "24px",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease",
          }}
        >
          <div ref={containerRef} />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Zoom:</span>
        {([50, 100, 200] as const).map((level) => (
          <Button
            key={level}
            variant={zoom === level ? "default" : "outline"}
            size="sm"
            aria-label={`Zoom ${level}%`}
            onClick={() => setZoom(level)}
          >
            {level}%
          </Button>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="default" size="sm" aria-label="Download PNG" onClick={handleDownloadPng}>
          Download PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Download SVG"
          onClick={() => {
            const canvas = containerRef.current?.querySelector("canvas");
            const dataUrl = canvas?.toDataURL("image/png");
            downloadSvg(config, "odoo-icon.svg", dataUrl);
          }}
        >
          Download SVG
        </Button>
        <Button variant="outline" size="sm" aria-label="Copy to Clipboard" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </Button>
        <BatchExport config={config} />
        <Button variant="outline" size="sm" aria-label="Save Locally" onClick={handleSaveLocally}>
          Save Locally
        </Button>
      </div>
    </div>
  );
}
