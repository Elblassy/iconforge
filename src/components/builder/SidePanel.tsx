"use client";

import { Separator } from "@/components/ui/separator";
import { VersionSelector } from "./VersionSelector";
import { ColorSection } from "./ColorSection";
import type { IconConfig } from "@/types/icon-config";

interface SidePanelProps {
  config: IconConfig;
  onUpdate: (updates: Partial<IconConfig>) => void;
}

export function SidePanel({ config, onUpdate }: SidePanelProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-primary">Odoo Icon Builder</h2>
        <p className="text-xs text-muted-foreground">Customize your module icon</p>
      </div>

      <Separator />

      {/* Version selector */}
      <VersionSelector
        value={config.odooVersion}
        onChange={(v) => onUpdate({ odooVersion: v })}
      />

      <Separator />

      {/* Color controls */}
      <ColorSection
        backgroundColor={config.backgroundColor}
        iconColor={config.iconColor}
        onBackgroundChange={(color) => onUpdate({ backgroundColor: color })}
        onIconColorChange={(color) => onUpdate({ iconColor: color })}
      />
    </div>
  );
}
