"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PRESET_TEMPLATES } from "@/lib/presets";
import { DEFAULT_CONFIG } from "@/types/icon-config";
import type { IconConfig, IconColorConfig } from "@/types/icon-config";

interface PresetTemplatesProps {
  onApply: (config: IconConfig) => void;
}

function getPreviewBackground(cc?: Partial<IconColorConfig>): string {
  if (!cc) return "#985184";
  const c1 = cc.color1 ?? "#985184";
  const c2 = cc.color2 ?? c1;
  const c3 = cc.color3 ?? c2;

  if (cc.mode === "solid") return c1;
  if (cc.mode === "tinted") return `linear-gradient(135deg, ${c1}cc, ${c1}, ${c1}66)`;
  if (cc.mode === "complementary") {
    return cc.blend
      ? `linear-gradient(135deg, ${c1}, ${c2})`
      : `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
  }
  if (cc.mode === "tricolor") {
    return cc.blend
      ? `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`
      : `linear-gradient(135deg, ${c1} 33%, ${c2} 33%, ${c2} 66%, ${c3} 66%)`;
  }
  return c1;
}

export function PresetTemplates({ onApply }: PresetTemplatesProps) {
  const [open, setOpen] = useState(false);

  function handleApply(preset: (typeof PRESET_TEMPLATES)[number]) {
    const merged: IconConfig = {
      ...DEFAULT_CONFIG,
      ...preset.config,
      source: preset.config.source ?? DEFAULT_CONFIG.source,
      colorConfig: preset.config.colorConfig as IconColorConfig | undefined,
    };
    onApply(merged);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Start from Template
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
          {PRESET_TEMPLATES.map((preset) => {
            const source = preset.config.source;
            const iconClass =
              source && source.type === "icon" ? source.iconClass : "";
            const cc = preset.config.colorConfig;
            const previewBg = getPreviewBackground(cc);

            return (
              <button
                key={preset.name}
                onClick={() => handleApply(preset)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-all hover:border-primary hover:bg-muted/40 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Icon with color preview */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: previewBg }}
                >
                  {iconClass && (
                    <i
                      className={iconClass}
                      style={{
                        color: "#ffffff",
                        fontSize: "1.75rem",
                        mixBlendMode: "overlay",
                        opacity: 0.9,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Color dots */}
                <div className="flex gap-0.5">
                  {cc && (
                    <>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cc.color1 }}
                      />
                      {(cc.mode === "complementary" || cc.mode === "tricolor") && (
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cc.color2 }}
                        />
                      )}
                      {cc.mode === "tricolor" && (
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cc.color3 }}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Name */}
                <span className="text-[11px] font-medium text-foreground">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
