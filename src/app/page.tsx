"use client";
import { useEffect } from "react";
import { IconCanvas } from "@/components/builder/IconCanvas";
import { SidePanel } from "@/components/builder/SidePanel";
import { ExportPanel } from "@/components/builder/ExportPanel";
import { useIconConfig } from "@/hooks/useIconConfig";
import { decodeConfig } from "@/lib/share";

export default function BuilderPage() {
  const { config, updateConfig, setConfig } = useIconConfig();

  // On mount, check URL search params for a shared config
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("config");
    if (encoded) {
      const decoded = decodeConfig(encoded);
      if (decoded) {
        setConfig(decoded);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border bg-card p-4">
        <SidePanel config={config} onUpdate={updateConfig} />
        <div className="mt-4 border-t border-border pt-4">
          <ExportPanel config={config} />
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center bg-background">
        <IconCanvas config={config} />
      </main>
    </div>
  );
}
