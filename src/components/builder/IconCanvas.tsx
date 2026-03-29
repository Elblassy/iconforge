"use client";
import { useRef, useState } from "react";
import type { IconConfig } from "@/types/icon-config";
import { useIconRenderer } from "@/hooks/useIconRenderer";
import { Button } from "@/components/ui/button";
import { downloadSvg } from "@/lib/svg-renderer";
import { BatchExport } from "./BatchExport";
import { saveIcon } from "@/lib/storage";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface IconCanvasProps {
  config: IconConfig;
}

export function IconCanvas({ config }: IconCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useIconRenderer(config, containerRef);
  const [zoom, setZoom] = useState<50 | 100 | 200>(100);
  const [showOdoo17Info, setShowOdoo17Info] = useState(false);
  const [odoo17Loading, setOdoo17Loading] = useState(false);

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
      <div className="flex flex-col items-center gap-3 w-full max-w-lg">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="default" size="sm" aria-label="Download PNG" onClick={handleDownloadPng}>
            PNG (Odoo 16)
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
            SVG (with bg)
          </Button>
          <Button
            variant="default"
            size="sm"
            aria-label="Download Odoo 17+ Package"
            disabled={odoo17Loading}
            onClick={async () => {
              setOdoo17Loading(true);
              try {
                const canvas = containerRef.current?.querySelector("canvas");
                if (!canvas) return;

                // Generate both files from the live canvas (guaranteed correct)
                const canvasDataUrl = canvas.toDataURL("image/png");
                const svgString = [
                  `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">`,
                  `  <image width="50" height="50" href="${canvasDataUrl}" preserveAspectRatio="xMidYMid meet"/>`,
                  `</svg>`,
                ].join("\n");
                const pngBlob = await new Promise<Blob | null>((resolve) =>
                  canvas.toBlob((b) => resolve(b), "image/png")
                );
                if (!pngBlob) return;

                // Package as ZIP
                const zip = new JSZip();
                zip.file("icon.svg", svgString);
                zip.file("icon.png", pngBlob);
                const zipBlob = await zip.generateAsync({ type: "blob" });
                saveAs(zipBlob, "odoo-icon.zip");

                setShowOdoo17Info(true);
              } finally {
                setOdoo17Loading(false);
              }
            }}
          >
            {odoo17Loading ? "Loading..." : "Odoo 17+ (SVG+PNG)"}
          </Button>
          <Button variant="outline" size="sm" aria-label="Copy to Clipboard" onClick={handleCopyToClipboard}>
            Copy
          </Button>
          <BatchExport config={config} />
          <Button variant="outline" size="sm" aria-label="Save Locally" onClick={handleSaveLocally}>
            Save
          </Button>
        </div>

        {showOdoo17Info && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground w-full">
            <p className="font-medium text-primary mb-1">Odoo 17+ Icon Package</p>
            <p>
              The ZIP contains both files needed for your module:
            </p>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li><code className="text-foreground">icon.svg</code> — vector icon, no background (Odoo handles theme colors)</li>
              <li><code className="text-foreground">icon.png</code> — with background (used in installer &amp; settings)</li>
            </ul>
            <p className="mt-1">
              Place both in <code className="text-foreground">your_module/static/description/</code>
            </p>
            <button
              className="mt-1.5 text-primary hover:underline"
              onClick={() => setShowOdoo17Info(false)}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
