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

export function PresetTemplates({ onApply }: PresetTemplatesProps) {
  const [open, setOpen] = useState(false);

  function handleApply(preset: (typeof PRESET_TEMPLATES)[number]) {
    const cc = preset.config.colorConfig as IconColorConfig | undefined;
    const merged: IconConfig = {
      ...DEFAULT_CONFIG,
      ...preset.config,
      source: preset.config.source ?? DEFAULT_CONFIG.source,
      iconColor: cc?.color1 ?? preset.config.iconColor ?? DEFAULT_CONFIG.iconColor,
      colorConfig: cc,
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

            return (
              <button
                key={preset.name}
                onClick={() => handleApply(preset)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-all hover:border-primary hover:bg-muted/40 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Icon on transparent bg with the actual color */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/30">
                  {iconClass && (
                    <i
                      className={iconClass}
                      style={{
                        color: cc?.color1 ?? preset.config.iconColor ?? "#985184",
                        fontSize: "1.75rem",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Color dots showing the palette */}
                <div className="flex gap-1">
                  {cc && (
                    <>
                      <div
                        className="h-2.5 w-2.5 rounded-full border border-border/50"
                        style={{ backgroundColor: cc.color1 }}
                      />
                      {(cc.mode === "complementary" || cc.mode === "tricolor") && (
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-border/50"
                          style={{ backgroundColor: cc.color2 }}
                        />
                      )}
                      {cc.mode === "tricolor" && (
                        <div
                          className="h-2.5 w-2.5 rounded-full border border-border/50"
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
