"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  imageDataUrl: string;
  onImageChange: (dataUrl: string) => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

function rasterize(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0, 512, 512);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export function ImageUpload({ imageDataUrl, onImageChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function processFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG file");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      try {
        const png = await rasterize(raw);
        onImageChange(png);
      } catch {
        toast.error("Failed to process image.");
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
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Upload image file"
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Click or drag image here to upload"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          "flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
        ].join(" ")}
      >
        {imageDataUrl ? (
          // Preview thumbnail
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageDataUrl}
            alt="Uploaded image preview"
            className="max-h-[100px] max-w-full rounded object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <span className="text-sm font-medium text-muted-foreground">
              Drag &amp; drop or click to upload
            </span>
            <span className="text-xs text-muted-foreground/70">
              PNG, JPG, SVG — max 2 MB
            </span>
          </div>
        )}
      </div>

      {/* Remove button */}
      {imageDataUrl && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onImageChange("")}
        >
          Remove Image
        </Button>
      )}
    </div>
  );
}
