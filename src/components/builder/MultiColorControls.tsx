"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { MultiColorMode } from "@/types/icon-config";

interface MultiColorControlsProps {
  mode: MultiColorMode;
  iconColor: string;
  color2: string;
  color3: string;
  onModeChange: (mode: MultiColorMode) => void;
  onIconColorChange: (color: string) => void;
  onColor2Change: (color: string) => void;
  onColor3Change: (color: string) => void;
}

const MODE_OPTIONS: { value: MultiColorMode; label: string; desc: string }[] = [
  { value: "single", label: "Single", desc: "One color" },
  { value: "duo", label: "Duo", desc: "2 colors (like Odoo Stock)" },
  { value: "trio", label: "Trio", desc: "3 colors (like Odoo Sales)" },
];

export function MultiColorControls({
  mode,
  iconColor,
  color2,
  color3,
  onModeChange,
  onIconColorChange,
  onColor2Change,
  onColor3Change,
}: MultiColorControlsProps) {
  return (
    <div className="space-y-3">
      <Label>Icon Colors</Label>
      <p className="text-xs text-muted-foreground">
        Odoo 17+ icons use multiple colors for a layered look
      </p>

      {/* Mode selector */}
      <div className="flex gap-1">
        {MODE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={mode === opt.value ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onModeChange(opt.value)}
            title={opt.desc}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Color pickers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={iconColor}
            onChange={(e) => onIconColorChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
          />
          <span className="font-mono text-xs text-muted-foreground">
            Color 1: {iconColor.toUpperCase()}
          </span>
        </div>

        {(mode === "duo" || mode === "trio") && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => onColor2Change(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Color 2: {color2.toUpperCase()}
            </span>
          </div>
        )}

        {mode === "trio" && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color3}
              onChange={(e) => onColor3Change(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Color 3: {color3.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Preview swatches */}
      <div className="flex items-center gap-1">
        <div
          className="h-6 flex-1 rounded"
          style={{ backgroundColor: iconColor }}
        />
        {(mode === "duo" || mode === "trio") && (
          <div
            className="h-6 flex-1 rounded"
            style={{ backgroundColor: color2 }}
          />
        )}
        {mode === "trio" && (
          <div
            className="h-6 flex-1 rounded"
            style={{ backgroundColor: color3 }}
          />
        )}
      </div>
    </div>
  );
}
