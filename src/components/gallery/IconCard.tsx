"use client";
import type { SavedIcon } from "@/types/icon-config";
import { Button } from "@/components/ui/button";
import { saveIcon, deleteIcon } from "@/lib/storage";
import { encodeConfig } from "@/lib/share";

interface IconCardProps {
  icon: SavedIcon;
  onDelete: (id: string) => void;
  onDuplicate: (icon: SavedIcon) => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function IconCard({ icon, onDelete, onDuplicate }: IconCardProps) {
  const handleEdit = () => {
    const encoded = encodeConfig(icon.config);
    window.location.href = `/?config=${encoded}`;
  };

  const handleDuplicate = () => {
    const copy = saveIcon(`${icon.name} (copy)`, icon.config, icon.thumbnail);
    onDuplicate(copy);
  };

  const handleDelete = () => {
    deleteIcon(icon.id);
    onDelete(icon.id);
  };

  const handleExport = () => {
    const link = document.createElement("a");
    link.href = icon.thumbnail;
    link.download = `${icon.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-center bg-muted p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon.thumbnail}
          alt={icon.name}
          className="h-24 w-24 rounded object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="truncate text-sm font-medium">{icon.name}</p>
          <p className="text-xs text-muted-foreground">{formatDate(icon.createdAt)}</p>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-1">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
