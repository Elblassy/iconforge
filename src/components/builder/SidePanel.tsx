"use client";

import { Separator } from "@/components/ui/separator";
import { VersionSelector } from "./VersionSelector";
import { ColorSection } from "./ColorSection";
import { SizeControls } from "./SizeControls";
import { AdvancedControls } from "./AdvancedControls";
import { IconSourceTabs } from "./IconSourceTabs";
import { PresetTemplates } from "./PresetTemplates";
import { getVersionConfig } from "@/lib/odoo-versions";
import type { IconConfig } from "@/types/icon-config";

interface SidePanelProps {
  config: IconConfig;
  onUpdate: (updates: Partial<IconConfig>) => void;
}

export function SidePanel({ config, onUpdate }: SidePanelProps) {
  const versionDefaults = getVersionConfig(config.odooVersion);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-primary">Odoo Icon Builder</h2>
        <p className="text-xs text-muted-foreground">Customize your module icon</p>
      </div>

      {/* Preset templates */}
      <PresetTemplates
        onApply={(newConfig) => {
          // Replace entire config
          onUpdate(newConfig);
        }}
      />

      <Separator />

      {/* Version selector */}
      <VersionSelector
        value={config.odooVersion}
        onChange={(v) => onUpdate({ odooVersion: v })}
      />

      <Separator />

      {/* Icon source tabs */}
      <IconSourceTabs
        source={config.source}
        onSourceChange={(source) => onUpdate({ source })}
      />

      <Separator />

      {/* Color controls */}
      <ColorSection
        backgroundColor={config.backgroundColor}
        iconColor={config.iconColor}
        onBackgroundChange={(color) => onUpdate({ backgroundColor: color })}
        onIconColorChange={(color) => onUpdate({ iconColor: color })}
      />

      <Separator />

      {/* Size controls */}
      <SizeControls
        iconWidth={config.iconWidth}
        fontSize={config.fontSize}
        fontWeight={config.fontWeight}
        onIconWidthChange={(iconWidth) => onUpdate({ iconWidth })}
        onFontSizeChange={(fontSize) => onUpdate({ fontSize })}
        onFontWeightChange={(fontWeight) => onUpdate({ fontWeight })}
      />

      <Separator />

      {/* Advanced controls */}
      <AdvancedControls
        gradientIntensity={config.gradientIntensity}
        shadowIntensity={config.shadowIntensity}
        cornerRadiusOverride={config.cornerRadiusOverride}
        iconWidth={config.iconWidth}
        defaults={{
          gradientAlpha: versionDefaults.gradientAlpha,
          innerShadowAlpha: versionDefaults.innerShadowAlpha,
          cornerRadiusPercent: versionDefaults.cornerRadiusPercent,
        }}
        onChange={(updates) => onUpdate(updates)}
      />
    </div>
  );
}
