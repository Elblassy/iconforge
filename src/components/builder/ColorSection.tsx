"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    </div>
  );
}
