"use client";

import { Label } from "@/components/ui/label";
import { COLOR_PALETTES } from "@/lib/presets";

interface ColorSectionProps {
  backgroundColor: string;
  iconColor: string;
  onBackgroundChange: (color: string) => void;
  onIconColorChange: (color: string) => void;
}

export function ColorSection({
  backgroundColor,
  iconColor,
  onBackgroundChange,
  onIconColorChange,
}: ColorSectionProps) {
  return (
    <div className="space-y-4">
      {/* Background color picker */}
      <div className="space-y-1.5">
        <Label htmlFor="bg-color">Background Color</Label>
        <div className="flex items-center gap-2">
          <input
            id="bg-color"
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-input p-0.5"
          />
          <span className="font-mono text-sm text-muted-foreground">
            {backgroundColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Icon color picker */}
      <div className="space-y-1.5">
        <Label htmlFor="icon-color">Icon Color</Label>
        <div className="flex items-center gap-2">
          <input
            id="icon-color"
            type="color"
            value={iconColor}
            onChange={(e) => onIconColorChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-input p-0.5"
          />
          <span className="font-mono text-sm text-muted-foreground">
            {iconColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Color palettes */}
      <div className="space-y-3">
        <Label>Color Palettes</Label>
        {COLOR_PALETTES.map((palette) => (
          <div key={palette.name} className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{palette.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {palette.pairs.map((pair) => (
                <button
                  key={pair.bg}
                  type="button"
                  aria-label={`Apply ${palette.name} color: background ${pair.bg}, foreground ${pair.fg}`}
                  onClick={() => {
                    onBackgroundChange(pair.bg);
                    onIconColorChange(pair.fg);
                  }}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  style={{
                    backgroundColor: pair.bg,
                    borderColor:
                      backgroundColor === pair.bg ? pair.fg : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
