import type { IconConfig, SavedIcon } from "@/types/icon-config";

const STORAGE_KEY = "odoo-icon-builder-saved";
export const MAX_SAVED_ICONS = 50;

export function getIcons(): SavedIcon[] {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

export function saveIcon(
  name: string,
  config: IconConfig,
  thumbnail: string
): SavedIcon {
  const icons = getIcons();
  const newIcon: SavedIcon = {
    id: crypto.randomUUID(),
    name,
    config,
    thumbnail,
    createdAt: Date.now(),
  };
  icons.unshift(newIcon);
  while (icons.length > MAX_SAVED_ICONS) icons.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(icons));
  return newIcon;
}

export function deleteIcon(id: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(getIcons().filter((i) => i.id !== id))
  );
}

export function getStorageSize(): number {
  const d = localStorage.getItem(STORAGE_KEY);
  return d ? new Blob([d]).size : 0;
}
