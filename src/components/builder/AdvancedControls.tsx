"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { OdooVersionConfig } from "@/types/icon-config";

interface AdvancedControlsProps {
  gradientIntensity?: number;
  shadowIntensity?: number;
  cornerRadiusOverride?: number;
  iconWidth: number;
  defaults: Pick<OdooVersionConfig, "gradientAlpha" | "innerShadowAlpha" | "cornerRadiusPercent">;
  onChange: (updates: {
    gradientIntensity?: number;
    shadowIntensity?: number;
    cornerRadiusOverride?: number;
  }) => void;
}

export function AdvancedControls({
  gradientIntensity,
  shadowIntensity,
  cornerRadiusOverride,
  iconWidth,
  defaults,
  onChange,
}: AdvancedControlsProps) {
  const [open, setOpen] = useState(false);

  const effectiveGradient = gradientIntensity ?? defaults.gradientAlpha;
  const effectiveShadow = shadowIntensity ?? defaults.innerShadowAlpha;
  const effectiveRadius = cornerRadiusOverride ?? Math.round(iconWidth * defaults.cornerRadiusPercent);
  const maxRadius = Math.round(iconWidth * 0.2);

  return (
    <div className="space-y-2">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-sm font-medium"
      >
        <span>Advanced Settings</span>
        <span
          className="transition-transform duration-200"
          style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="space-y-4 pt-2">
          {/* Gradient intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Gradient Intensity</Label>
              <span className="text-sm text-muted-foreground">
                {effectiveGradient.toFixed(2)}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[effectiveGradient]}
              onValueChange={([v]) => onChange({ gradientIntensity: v, shadowIntensity, cornerRadiusOverride })}
            />
          </div>

          {/* Shadow intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Shadow Intensity</Label>
              <span className="text-sm text-muted-foreground">
                {effectiveShadow.toFixed(2)}
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[effectiveShadow]}
              onValueChange={([v]) => onChange({ gradientIntensity, shadowIntensity: v, cornerRadiusOverride })}
            />
          </div>

          {/* Corner radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Corner Radius</Label>
              <span className="text-sm text-muted-foreground">
                {effectiveRadius}px
              </span>
            </div>
            <Slider
              min={0}
              max={maxRadius}
              step={1}
              value={[effectiveRadius]}
              onValueChange={([v]) => onChange({ gradientIntensity, shadowIntensity, cornerRadiusOverride: v })}
            />
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              onChange({
                gradientIntensity: undefined,
                shadowIntensity: undefined,
                cornerRadiusOverride: undefined,
              })
            }
          >
            Reset to Defaults
          </Button>
        </div>
      )}
    </div>
  );
}
