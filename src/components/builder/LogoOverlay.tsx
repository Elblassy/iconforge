"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import type { LogoOverlay as LogoOverlayType } from "@/types/icon-config";

interface LogoOverlayProps {
  overlay?: LogoOverlayType;
  onChange: (overlay?: LogoOverlayType) => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

type Position = LogoOverlayType["position"];

function rasterize(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0, 256, 256);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

const POSITIONS: { id: Position; label: string; gridRow: number; gridCol: number }[] = [
  { id: "top-left", label: "↖", gridRow: 1, gridCol: 1 },
  { id: "top-right", label: "↗", gridRow: 1, gridCol: 3 },
  { id: "center", label: "○", gridRow: 2, gridCol: 2 },
  { id: "bottom-left", label: "↙", gridRow: 3, gridCol: 1 },
  { id: "bottom-right", label: "↘", gridRow: 3, gridCol: 3 },
];

export function LogoOverlay({ overlay, onChange }: LogoOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentPosition: Position = overlay?.position ?? "bottom-right";
  const currentSize: number = overlay?.size ?? 25;

  async function processFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG file");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File must be under 1 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      try {
        const png = await rasterize(raw);
        onChange({
          imageDataUrl: png,
          position: currentPosition,
          size: currentSize,
        });
      } catch {
        toast.error("Failed to process logo image.");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    processFile(files[0]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  function handlePositionChange(pos: Position) {
    if (!overlay?.imageDataUrl) return;
    onChange({ ...overlay, position: pos });
  }

  function handleSizeChange(val: number[]) {
    if (!overlay?.imageDataUrl) return;
    onChange({ ...overlay, size: val[0] });
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Company Logo</Label>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Upload company logo file"
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Click or drag logo here to upload"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          "flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
        ].join(" ")}
      >
        {overlay?.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={overlay.imageDataUrl}
            alt="Company logo preview"
            className="max-h-[64px] max-w-full rounded object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <span className="text-xs font-medium text-muted-foreground">
              Drag &amp; drop or click to upload logo
            </span>
            <span className="text-xs text-muted-foreground/70">
              PNG, JPG, SVG — max 1 MB
            </span>
          </div>
        )}
      </div>

      {/* Position selector — only shown when a logo is uploaded */}
      {overlay?.imageDataUrl && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Position</Label>
            {/* 3×3 grid with buttons at corners and center */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)" }}
              aria-label="Logo position selector"
            >
              {POSITIONS.map(({ id, label, gridRow, gridCol }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={id}
                  aria-pressed={currentPosition === id}
                  onClick={() => handlePositionChange(id)}
                  style={{ gridRow, gridColumn: gridCol }}
                  className={[
                    "flex h-8 w-full items-center justify-center rounded text-sm font-medium transition-colors",
                    currentPosition === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Size slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Logo Size</Label>
              <span className="text-xs text-muted-foreground">{currentSize}%</span>
            </div>
            <Slider
              min={10}
              max={50}
              step={1}
              value={[currentSize]}
              onValueChange={handleSizeChange}
              aria-label="Logo size percentage"
            />
          </div>

          {/* Remove button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onChange(undefined)}
          >
            Remove Logo
          </Button>
        </>
      )}
    </div>
  );
}
