"use client";
import { useState, useEffect } from "react";
import type { SavedIcon } from "@/types/icon-config";
import { getIcons } from "@/lib/storage";
import { IconCard } from "./IconCard";

export function IconGrid() {
  const [icons, setIcons] = useState<SavedIcon[]>([]);

  useEffect(() => {
    setIcons(getIcons());
  }, []);

  const handleDelete = (id: string) => {
    setIcons((prev) => prev.filter((icon) => icon.id !== id));
  };

  const handleDuplicate = (newIcon: SavedIcon) => {
    setIcons((prev) => [newIcon, ...prev]);
  };

  if (icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">No saved icons yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the &quot;Save Locally&quot; button in the builder to save icons here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {icons.map((icon) => (
        <IconCard
          key={icon.id}
          icon={icon}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      ))}
    </div>
  );
}
