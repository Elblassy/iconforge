"use client";
import { useEffect } from "react";
import { IconCanvas } from "@/components/builder/IconCanvas";
import { SidePanel } from "@/components/builder/SidePanel";
import { ExportPanel } from "@/components/builder/ExportPanel";
import { MobileSheet } from "@/components/layout/MobileSheet";
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

  const sidePanelContent = (
    <>
      <SidePanel config={config} onUpdate={updateConfig} />
      <div className="mt-4 border-t border-border pt-4">
        <ExportPanel config={config} />
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem-2.5rem)]">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:block w-80 shrink-0 overflow-y-auto border-r border-border bg-card p-4">
        {sidePanelContent}
      </aside>

      {/* Main canvas area */}
      <main className="flex flex-1 flex-col items-center justify-start bg-background overflow-y-auto">
        {/* Mobile sheet trigger */}
        <div className="w-full flex items-center justify-start p-3 md:hidden border-b border-border">
          <MobileSheet>{sidePanelContent}</MobileSheet>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 w-full">
          <IconCanvas config={config} />
        </div>
      </main>
    </div>
  );
}
