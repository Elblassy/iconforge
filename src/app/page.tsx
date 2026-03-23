"use client";
import { IconCanvas } from "@/components/builder/IconCanvas";
import { SidePanel } from "@/components/builder/SidePanel";
import { useIconConfig } from "@/hooks/useIconConfig";

export default function BuilderPage() {
  const { config, updateConfig } = useIconConfig();
  return (
    <div className="flex h-screen">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border bg-card p-4">
        <SidePanel config={config} onUpdate={updateConfig} />
      </aside>
      <main className="flex flex-1 items-center justify-center bg-background">
        <IconCanvas config={config} />
      </main>
    </div>
  );
}
