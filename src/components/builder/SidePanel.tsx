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

const DEFAULT_COLOR_CONFIG: IconColorConfig = {
  mode: "solid",
  color1: "#985184",
  color2: "#F86126",
  color3: "#FBB945",
  blend: false,
};

interface SidePanelProps {
  config: IconConfig;
  onUpdate: (updates: Partial<IconConfig>) => void;
  onReplace: (config: IconConfig) => void;
}

export function SidePanel({ config, onUpdate, onReplace }: SidePanelProps) {
  const versionDefaults = getVersionConfig(config.odooVersion);

  const colorConfig: IconColorConfig = config.colorConfig ?? {
    ...DEFAULT_COLOR_CONFIG,
    color1: config.iconColor,
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
        onApply={(newConfig) => onReplace(newConfig)}
      />

      <Separator />

      {/* Version selector */}
      <VersionSelector
        value={config.odooVersion}
        onChange={(v) => {
          const isNew = v === "17.0" || v === "18.0" || v === "19.0";
          const wasOld = config.odooVersion === "16.0";
          onUpdate({
            odooVersion: v,
            // Auto-switch to transparent bg when switching to 17+
            ...(isNew && wasOld ? { backgroundColor: "transparent" } : {}),
            // Auto-switch to solid bg when switching back to 16
            ...(v === "16.0" && config.backgroundColor === "transparent"
              ? { backgroundColor: "#714BC2" }
              : {}),
          });
        }}
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
