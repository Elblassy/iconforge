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
import type { IconConfig } from "@/types/icon-config";

interface PresetTemplatesProps {
  onApply: (config: IconConfig) => void;
}

export function PresetTemplates({ onApply }: PresetTemplatesProps) {
  const [open, setOpen] = useState(false);

  function handleApply(preset: (typeof PRESET_TEMPLATES)[number]) {
    const merged: IconConfig = {
      ...DEFAULT_CONFIG,
      ...preset.config,
      // Ensure source is properly typed
      source: preset.config.source ?? DEFAULT_CONFIG.source,
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

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {PRESET_TEMPLATES.map((preset) => {
            const source = preset.config.source;
            const iconClass =
              source && source.type === "icon" ? source.iconClass : "";

            return (
              <button
                key={preset.name}
                onClick={() => handleApply(preset)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Colored square with icon */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      preset.config.backgroundColor ?? DEFAULT_CONFIG.backgroundColor,
                  }}
                >
                  {iconClass && (
                    <i
                      className={iconClass}
                      style={{
                        color: preset.config.iconColor ?? "#ffffff",
                        fontSize: "1.75rem",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Name */}
                <span className="text-xs font-medium text-foreground">
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
