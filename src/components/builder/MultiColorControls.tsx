"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { IconColorMode, IconColorConfig } from "@/types/icon-config";

interface MultiColorControlsProps {
  colorConfig: IconColorConfig;
  onChange: (config: IconColorConfig) => void;
}

const MODES: {
  value: IconColorMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "solid",
    label: "Solid",
    icon: <SolidPreview />,
  },
  {
    value: "gradient-diagonal",
    label: "Gradient",
    icon: <GradientPreview direction="diagonal" />,
  },
  {
    value: "gradient-horizontal",
    label: "H-Gradient",
    icon: <GradientPreview direction="horizontal" />,
  },
  {
    value: "gradient-vertical",
    label: "V-Gradient",
    icon: <GradientPreview direction="vertical" />,
  },
  {
    value: "split-horizontal",
    label: "H-Split",
    icon: <SplitPreview direction="horizontal" />,
  },
  {
    value: "split-vertical",
    label: "V-Split",
    icon: <SplitPreview direction="vertical" />,
  },
  {
    value: "split-diagonal",
    label: "D-Split",
    icon: <SplitPreview direction="diagonal" />,
  },
  {
    value: "gradient-radial",
    label: "Radial",
    icon: <RadialPreview />,
  },
];

export function MultiColorControls({
  colorConfig,
  onChange,
}: MultiColorControlsProps) {
  const isTwoColor = colorConfig.mode !== "solid";

  return (
    <div className="space-y-3">
      <Label>Icon Color Style</Label>

      {/* Mode grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange({ ...colorConfig, mode: m.value })}
            className={`flex flex-col items-center gap-1 rounded-md border p-1.5 transition-colors text-[10px] ${
              colorConfig.mode === m.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-muted-foreground text-muted-foreground"
            }`}
            title={m.label}
          >
            {m.icon}
            <span className="truncate w-full text-center">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Color pickers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorConfig.color1}
            onChange={(e) =>
              onChange({ ...colorConfig, color1: e.target.value })
            }
            className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {isTwoColor ? "Color 1" : "Color"}: {colorConfig.color1.toUpperCase()}
          </span>
        </div>

        {isTwoColor && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorConfig.color2}
              onChange={(e) =>
                onChange({ ...colorConfig, color2: e.target.value })
              }
              className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Color 2: {colorConfig.color2.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Midpoint slider */}
      {isTwoColor && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Balance</Label>
            <span className="text-xs text-muted-foreground">
              {colorConfig.midpoint ?? 50}%
            </span>
          </div>
          <Slider
            min={10}
            max={90}
            step={1}
            value={[colorConfig.midpoint ?? 50]}
            onValueChange={([v]) => onChange({ ...colorConfig, midpoint: v })}
          />
        </div>
      )}

      {/* Live preview swatch */}
      <div className="flex items-center gap-2">
        <Label className="text-xs">Preview:</Label>
        <ColorPreviewSwatch
          mode={colorConfig.mode}
          color1={colorConfig.color1}
          color2={colorConfig.color2}
          midpoint={colorConfig.midpoint ?? 50}
        />
      </div>
    </div>
  );
}

// ── Mini mode preview icons ──

function SolidPreview() {
  return (
    <div className="h-5 w-5 rounded-sm bg-current opacity-80" />
  );
}

function GradientPreview({ direction }: { direction: "diagonal" | "horizontal" | "vertical" }) {
  const angle = direction === "horizontal" ? "90deg" : direction === "vertical" ? "180deg" : "135deg";
  return (
    <div
      className="h-5 w-5 rounded-sm"
      style={{ background: `linear-gradient(${angle}, currentColor 0%, transparent 100%)` }}
    />
  );
}

function SplitPreview({ direction }: { direction: "horizontal" | "vertical" | "diagonal" }) {
  if (direction === "horizontal") {
    return (
      <div className="flex h-5 w-5 overflow-hidden rounded-sm">
        <div className="flex-1 bg-current opacity-80" />
        <div className="flex-1 bg-current opacity-40" />
      </div>
    );
  }
  if (direction === "vertical") {
    return (
      <div className="flex flex-col h-5 w-5 overflow-hidden rounded-sm">
        <div className="flex-1 bg-current opacity-80" />
        <div className="flex-1 bg-current opacity-40" />
      </div>
    );
  }
  // diagonal
  return (
    <div
      className="h-5 w-5 rounded-sm"
      style={{
        background: "linear-gradient(135deg, currentColor 50%, transparent 50%)",
      }}
    />
  );
}

function RadialPreview() {
  return (
    <div
      className="h-5 w-5 rounded-sm"
      style={{
        background: "radial-gradient(circle, currentColor 30%, transparent 80%)",
      }}
    />
  );
}

function ColorPreviewSwatch({
  mode,
  color1,
  color2,
  midpoint,
}: {
  mode: IconColorMode;
  color1: string;
  color2: string;
  midpoint: number;
}) {
  let bg: string;
  const m = midpoint;

  const s1 = Math.max(0, m - 10);
  const s2 = Math.min(100, m + 10);

  switch (mode) {
    case "solid":
      bg = color1;
      break;
    case "gradient-diagonal":
      bg = `linear-gradient(135deg, ${color1} ${s1}%, ${color2} ${s2}%)`;
      break;
    case "gradient-horizontal":
      bg = `linear-gradient(90deg, ${color1} ${s1}%, ${color2} ${s2}%)`;
      break;
    case "gradient-vertical":
      bg = `linear-gradient(180deg, ${color1} ${s1}%, ${color2} ${s2}%)`;
      break;
    case "gradient-radial":
      bg = `radial-gradient(circle, ${color1} ${s1}%, ${color2} ${s2}%)`;
      break;
    case "split-horizontal":
      bg = `linear-gradient(90deg, ${color1} ${m}%, ${color2} ${m}%)`;
      break;
    case "split-vertical":
      bg = `linear-gradient(180deg, ${color1} ${m}%, ${color2} ${m}%)`;
      break;
    case "split-diagonal":
      bg = `linear-gradient(135deg, ${color1} ${m}%, ${color2} ${m}%)`;
      break;
    default:
      bg = color1;
  }

  return (
    <div
      className="h-6 flex-1 rounded-md border border-border"
      style={{ background: bg }}
    />
  );
}
