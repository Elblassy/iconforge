"use client";
import { useState, useCallback } from "react";
import type { IconConfig } from "@/types/icon-config";
import { DEFAULT_CONFIG } from "@/types/icon-config";

export function useIconConfig(initial?: Partial<IconConfig>) {
  const [config, setConfig] = useState<IconConfig>({ ...DEFAULT_CONFIG, ...initial });
  const updateConfig = useCallback((updates: Partial<IconConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);
  const resetConfig = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG, ...initial });
  }, [initial]);
  return { config, updateConfig, setConfig, resetConfig };
}
