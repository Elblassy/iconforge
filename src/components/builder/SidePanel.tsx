"use client";

import { Separator } from "@/components/ui/separator";
import { VersionSelector } from "./VersionSelector";
import { ColorSection } from "./ColorSection";
import { SizeControls } from "./SizeControls";
import { AdvancedControls } from "./AdvancedControls";
import { IconSourceTabs } from "./IconSourceTabs";
import { PresetTemplates } from "./PresetTemplates";
import { LogoOverlay } from "./LogoOverlay";
import { MultiColorControls } from "./MultiColorControls";
import { getVersionConfig } from "@/lib/odoo-versions";
import type { IconConfig, IconColorConfig } from "@/types/icon-config";

interface SidePanelProps {
  config: IconConfig;
  onUpdate: (updates: Partial<IconConfig>) => void;
}

export function SidePanel({ config, onUpdate }: SidePanelProps) {
  const versionDefaults = getVersionConfig(config.odooVersion);

  const colorConfig: IconColorConfig = config.colorConfig ?? {
    mode: "solid",
    color1: config.iconColor,
    color2: "#F86126",
  };

  function handleColorConfigChange(cc: IconColorConfig) {
    onUpdate({
      colorConfig: cc,
      iconColor: cc.color1, // keep iconColor in sync
    });
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-primary">Odoo Icon Builder</h2>
        <p className="text-xs text-muted-foreground">Customize your module icon</p>
      </div>

      {/* Preset templates */}
      <PresetTemplates
        onApply={(newConfig) => onUpdate(newConfig)}
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

      {/* Company logo overlay */}
      <LogoOverlay
        overlay={config.logoOverlay}
        onChange={(logoOverlay) => onUpdate({ logoOverlay })}
      />

      <Separator />

      {/* Icon color style (solid, gradient, split) */}
      <MultiColorControls
        colorConfig={colorConfig}
        onChange={handleColorConfigChange}
      />

      <Separator />

      {/* Background color (for PNG export) */}
      <ColorSection
        backgroundColor={config.backgroundColor}
        iconColor={config.iconColor}
        onBackgroundChange={(color) => onUpdate({ backgroundColor: color })}
        onIconColorChange={(color) =>
          onUpdate({
            iconColor: color,
            colorConfig: { ...colorConfig, color1: color },
          })
        }
      />

      <Separator />

      {/* Size controls */}
      <SizeControls
        fontSize={config.fontSize}
        fontWeight={config.fontWeight}
        onFontSizeChange={(fontSize) => onUpdate({ fontSize })}
        onFontWeightChange={(fontWeight) => onUpdate({ fontWeight })}
      />

      <Separator />

      {/* Advanced controls */}
      <AdvancedControls
        gradientIntensity={config.gradientIntensity}
        shadowIntensity={config.shadowIntensity}
        cornerRadiusOverride={config.cornerRadiusOverride}
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
