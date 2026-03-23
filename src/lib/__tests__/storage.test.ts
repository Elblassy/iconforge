import { describe, it, expect, beforeEach } from "vitest";
import { getIcons, saveIcon, deleteIcon, MAX_SAVED_ICONS } from "../storage";
import { DEFAULT_CONFIG } from "@/types/icon-config";

describe("storage.ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and retrieves an icon (name matches)", () => {
    const saved = saveIcon("My Icon", DEFAULT_CONFIG, "data:image/png;base64,AAAA");
    const icons = getIcons();
    expect(icons).toHaveLength(1);
    expect(icons[0].name).toBe("My Icon");
    expect(icons[0].id).toBe(saved.id);
  });

  it("deletes by id (length becomes 0)", () => {
    const saved = saveIcon("To Delete", DEFAULT_CONFIG, "data:image/png;base64,AAAA");
    deleteIcon(saved.id);
    expect(getIcons()).toHaveLength(0);
  });

  it("limits to MAX_SAVED_ICONS (50) — insert 55, expect <= 50", () => {
    for (let i = 0; i < 55; i++) {
      saveIcon(`Icon ${i}`, DEFAULT_CONFIG, "data:image/png;base64,AAAA");
    }
    const icons = getIcons();
    expect(icons.length).toBeLessThanOrEqual(MAX_SAVED_ICONS);
    expect(icons.length).toBe(MAX_SAVED_ICONS);
  });
});
