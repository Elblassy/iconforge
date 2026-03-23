"use client";
import { IconCanvas } from "@/components/builder/IconCanvas";
import { useIconConfig } from "@/hooks/useIconConfig";

export default function BuilderPage() {
  const { config, updateConfig } = useIconConfig();
  return (
    <div className="flex h-screen">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold text-primary">Odoo Icon Builder</h2>
        <p className="text-sm text-muted-foreground">Controls coming next...</p>
      </aside>
      <main className="flex flex-1 items-center justify-center bg-background">
        <IconCanvas config={config} />
      </main>
    </div>
  );
}
