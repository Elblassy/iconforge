"use client";

import { Label } from "@/components/ui/label";
import type { IconColorMode, IconColorConfig } from "@/types/icon-config";
import { shadeColor } from "@/lib/color-utils";

interface MultiColorControlsProps {
  colorConfig: IconColorConfig;
  onChange: (config: IconColorConfig) => void;
}

const MODES: { value: IconColorMode; label: string; desc: string }[] = [
  { value: "solid", label: "Solid", desc: "Single clean color" },
  { value: "tinted", label: "Tinted", desc: "Auto light/dark tints from one color" },
  { value: "complementary", label: "Duo", desc: "Two colors, Odoo style" },
  { value: "tricolor", label: "Trio", desc: "Three colors, like Odoo HR/Stock" },
];

/** Odoo-style color presets (extracted from real Odoo 18 icons) */
const PRESETS: { name: string; colors: [string, string, string] }[] = [
  { name: "Sales", colors: ["#985184", "#F86126", "#FBB945"] },
  { name: "Stock", colors: ["#985184", "#F86126", "#FBB945"] },
  { name: "HR", colors: ["#985184", "#FBB945", "#1AD3BB"] },
  { name: "Accounting", colors: ["#088BF5", "#144496", "#2EBCFA"] },
  { name: "Purple", colors: ["#714BC2", "#9B6ED6", "#5A3AA5"] },
  { name: "Teal", colors: ["#00A09D", "#1AD3BB", "#017E84"] },
  { name: "Coral", colors: ["#E8536D", "#FC868B", "#962B48"] },
  { name: "Gold", colors: ["#F39C12", "#FBB945", "#E67E22"] },
];

export function MultiColorControls({
  colorConfig,
  onChange,
}: MultiColorControlsProps) {
  const { mode, color1, color2, color3 } = colorConfig;

  // Generate tint preview colors
  const tintDark = shadeColor(color1, -30);
  const tintLight = shadeColor(color1, 40);

  return (
    <div className="space-y-3">
      <Label>Icon Color Style</Label>

      {/* Mode buttons */}
      <div className="grid grid-cols-4 gap-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange({ ...colorConfig, mode: m.value })}
            className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors ${
              mode === m.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
            title={m.desc}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Color pickers based on mode */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color1}
            onChange={(e) => onChange({ ...colorConfig, color1: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
          />
          <span className="font-mono text-xs text-muted-foreground">
            {mode === "solid" || mode === "tinted" ? "Color" : "Color 1"}:{" "}
            {color1.toUpperCase()}
          </span>
        </div>

        {(mode === "complementary" || mode === "tricolor") && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => onChange({ ...colorConfig, color2: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Color 2: {color2.toUpperCase()}
            </span>
          </div>
        )}

        {mode === "tricolor" && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color3}
              onChange={(e) => onChange({ ...colorConfig, color3: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-input p-0.5"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Color 3: {color3.toUpperCase()}
            </span>
          </div>
        )}

        {/* Blend toggle for duo/trio */}
        {(mode === "complementary" || mode === "tricolor") && (
          <button
            type="button"
            onClick={() => onChange({ ...colorConfig, blend: !colorConfig.blend })}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-xs transition-colors ${
              colorConfig.blend
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            <span>Smooth Blend</span>
            <span>{colorConfig.blend ? "ON" : "OFF"}</span>
          </button>
        )}
      </div>

      {/* Preview showing the actual layers */}
      <div>
        <Label className="text-xs">Preview</Label>
        <div className="mt-1 flex h-10 items-center gap-0 overflow-hidden rounded-md border border-border">
          {mode === "solid" && (
            <div className="h-full flex-1" style={{ backgroundColor: color1 }} />
          )}
          {mode === "tinted" && (
            <div
              className="h-full flex-1"
              style={{ background: `linear-gradient(90deg, ${tintDark}, ${color1}, ${tintLight})` }}
            />
          )}
          {mode === "complementary" && (
            <div
              className="h-full flex-1"
              style={{
                background: colorConfig.blend
                  ? `linear-gradient(90deg, ${color1}, ${color2})`
                  : `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)`,
              }}
            />
          )}
          {mode === "tricolor" && (
            <div
              className="h-full flex-1"
              style={{
                background: colorConfig.blend
                  ? `linear-gradient(90deg, ${color1}, ${color2}, ${color3})`
                  : `linear-gradient(90deg, ${color1} 33.3%, ${color2} 33.3%, ${color2} 66.6%, ${color3} 66.6%)`,
              }}
            />
          )}
        </div>
      </div>

      {/* Quick presets from Odoo's actual icons */}
      <div>
        <Label className="text-xs">Odoo Presets</Label>
        <div className="mt-1 grid grid-cols-4 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() =>
                onChange({
                  mode: "tricolor",
                  color1: p.colors[0],
                  color2: p.colors[1],
                  color3: p.colors[2],
                  blend: colorConfig.blend,
                })
              }
              className="group flex flex-col items-center gap-1 rounded-md border border-border p-1.5 transition-colors hover:border-primary"
              title={p.name}
            >
              <div className="flex h-4 w-full overflow-hidden rounded-sm">
                <div className="flex-1" style={{ backgroundColor: p.colors[0] }} />
                <div className="flex-1" style={{ backgroundColor: p.colors[1] }} />
                <div className="flex-1" style={{ backgroundColor: p.colors[2] }} />
              </div>
              <span className="text-[9px] text-muted-foreground group-hover:text-foreground">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
