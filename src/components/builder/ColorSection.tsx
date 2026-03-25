"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const isTransparent = backgroundColor === "transparent";

  return (
    <div className="space-y-4">
      {/* Background color */}
      <div className="space-y-1.5">
        <Label>Background</Label>
        <div className="flex items-center gap-2">
          <Button
            variant={isTransparent ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() =>
              onBackgroundChange(isTransparent ? "#714BC2" : "transparent")
            }
          >
            {isTransparent ? "Transparent" : "Solid"}
          </Button>
          {!isTransparent && (
            <>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundChange(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
              />
              <span className="font-mono text-xs text-muted-foreground">
                {backgroundColor.toUpperCase()}
              </span>
            </>
          )}
        </div>
        {isTransparent && (
          <p className="text-xs text-muted-foreground">
            Odoo 17+ handles the background. Icon exports with no background.
          </p>
        )}
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
            className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {iconColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Color palettes */}
      <div className="space-y-3">
        <Label>Icon Color Palettes</Label>
        {COLOR_PALETTES.map((palette) => (
          <div key={palette.name} className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{palette.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {palette.pairs.map((pair) => (
                <button
                  key={pair.bg}
                  type="button"
                  aria-label={`Apply ${palette.name} icon color ${pair.bg}`}
                  onClick={() => onIconColorChange(pair.bg)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  style={{
                    backgroundColor: pair.bg,
                    borderColor:
                      iconColor === pair.bg
                        ? "hsl(var(--primary))"
                        : "transparent",
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
