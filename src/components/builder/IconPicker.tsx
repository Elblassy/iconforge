"use client";

import { useState, useEffect, useCallback, useRef, KeyboardEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getIconSets, loadIconSetMetadata } from "@/lib/icon-sets";
import type { IconMeta } from "@/lib/icon-sets";
import { useIconSearch } from "@/hooks/useIconSearch";
import { toast } from "sonner";

const RECENT_KEY = "odoo-icon-builder-recent";
const MAX_RECENT = 12;

interface RecentIcon {
  iconClass: string;
  unicode: string;
  iconSet: string;
}

function loadRecentIcons(): RecentIcon[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentIcon[];
  } catch {
    return [];
  }
}

function saveRecentIcons(recents: RecentIcon[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
  } catch {
    // Ignore storage errors
  }
}

function addRecentIcon(
  recents: RecentIcon[],
  newIcon: RecentIcon
): RecentIcon[] {
  const filtered = recents.filter((r) => r.iconClass !== newIcon.iconClass);
  return [newIcon, ...filtered].slice(0, MAX_RECENT);
}

interface IconPickerProps {
  selectedClass: string;
  onSelect: (iconClass: string, unicode: string, iconSet: string) => void;
}

interface IconSetState {
  icons: IconMeta[];
  loading: boolean;
  error: string | null;
}

export function IconPicker({ selectedClass, onSelect }: IconPickerProps) {
  const iconSets = getIconSets();
  const [activeSetId, setActiveSetId] = useState(iconSets[0]?.id ?? "bootstrap");
  const [searchQuery, setSearchQuery] = useState("");
  const [setStates, setSetStates] = useState<Record<string, IconSetState>>(() =>
    Object.fromEntries(
      iconSets.map((s) => [s.id, { icons: [], loading: false, error: null }])
    )
  );
  const [recentIcons, setRecentIcons] = useState<RecentIcon[]>(() =>
    loadRecentIcons()
  );

  const loadIcons = useCallback(async (setId: string) => {
    setSetStates((prev) => ({
      ...prev,
      [setId]: { ...prev[setId], loading: true, error: null },
    }));
    try {
      const icons = await loadIconSetMetadata(setId);
      setSetStates((prev) => ({
        ...prev,
        [setId]: { icons, loading: false, error: null },
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load icons";
      const setName = getIconSets().find((s) => s.id === setId)?.name ?? setId;
      toast.error(`Failed to load ${setName} icons`);
      setSetStates((prev) => ({
        ...prev,
        [setId]: { ...prev[setId], loading: false, error: msg },
      }));
    }
  }, []);

  // Load icons for the active set when it changes
  useEffect(() => {
    const state = setStates[activeSetId];
    if (!state.loading && state.icons.length === 0 && !state.error) {
      loadIcons(activeSetId);
    }
  }, [activeSetId, setStates, loadIcons]);

  function handleSelect(icon: IconMeta, setId: string) {
    const set = iconSets.find((s) => s.id === setId);
    const fontFamily = set?.fontFamily ?? setId;

    const newRecent: RecentIcon = {
      iconClass: icon.class,
      unicode: icon.unicode,
      iconSet: fontFamily,
    };
    const updated = addRecentIcon(recentIcons, newRecent);
    setRecentIcons(updated);
    saveRecentIcons(updated);

    onSelect(icon.class, icon.unicode, fontFamily);
  }

  return (
    <div className="space-y-2">
      <Tabs
        value={activeSetId}
        onValueChange={(val) => {
          setActiveSetId(val);
          setSearchQuery("");
        }}
      >
        <TabsList className="w-full flex-wrap h-auto gap-0.5 p-1">
          {iconSets.map((set) => (
            <TabsTrigger key={set.id} value={set.id} className="flex-1 text-xs px-1.5 py-1">
              {set.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {iconSets.map((set) => (
          <TabsContent key={set.id} value={set.id} className="mt-2">
            <IconSetPanel
              setId={set.id}
              state={setStates[set.id]}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedClass={selectedClass}
              recentIcons={recentIcons}
              onSelect={(icon) => handleSelect(icon, set.id)}
              onRetry={() => {
                toast.dismiss();
                loadIcons(set.id);
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface IconSetPanelProps {
  setId: string;
  state: IconSetState;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedClass: string;
  recentIcons: RecentIcon[];
  onSelect: (icon: IconMeta) => void;
  onRetry: () => void;
}

function IconSetPanel({
  setId,
  state,
  searchQuery,
  onSearchChange,
  selectedClass,
  recentIcons,
  onSelect,
  onRetry,
}: IconSetPanelProps) {
  const filteredIcons = useIconSearch(state.icons, searchQuery);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const COLS = 6;

  // Find recent icons that belong to this set
  const setRecentIcons = recentIcons.filter((r) => {
    const set = getIconSets().find((s) => s.id === setId);
    return set && r.iconSet === set.fontFamily;
  });

  function handleGridKeyDown(e: KeyboardEvent<HTMLDivElement>, totalIcons: number) {
    if (totalIcons === 0) return;

    let newIndex = focusedIndex;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        newIndex = Math.min(focusedIndex + 1, totalIcons - 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        newIndex = Math.max(focusedIndex - 1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        newIndex = Math.min(focusedIndex + COLS, totalIcons - 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        newIndex = Math.max(focusedIndex - COLS, 0);
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = totalIcons - 1;
        break;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    // Focus the button at newIndex
    const buttons = gridRef.current?.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]');
    if (buttons && buttons[newIndex]) {
      buttons[newIndex].focus();
    }
  }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Loading icons...
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-sm text-destructive">{state.error}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search icons..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 text-sm"
      />

      <ScrollArea className="h-48">
        <div className="pr-2 space-y-2">
          {/* Recent picks */}
          {setRecentIcons.length > 0 && !searchQuery && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-0.5">
                Recent
              </p>
              <div role="grid" aria-label="Recent icons" className="grid grid-cols-6 gap-1">
                {setRecentIcons.map((r) => (
                  <IconButton
                    key={`recent-${r.iconClass}`}
                    iconClass={r.iconClass}
                    unicode={r.unicode}
                    name={r.iconClass}
                    isSelected={selectedClass === r.iconClass}
                    onClick={() =>
                      onSelect({ name: r.iconClass, class: r.iconClass, unicode: r.unicode })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main icon grid */}
          {filteredIcons.length > 0 ? (
            <div
              ref={gridRef}
              role="grid"
              aria-label="Icon grid"
              className="grid grid-cols-6 gap-1"
              onKeyDown={(e) => handleGridKeyDown(e, filteredIcons.length)}
            >
              {filteredIcons.map((icon, idx) => (
                <IconButton
                  key={icon.class}
                  iconClass={icon.class}
                  unicode={icon.unicode}
                  name={icon.name}
                  isSelected={selectedClass === icon.class}
                  onClick={() => {
                    setFocusedIndex(idx);
                    onSelect(icon);
                  }}
                  onFocus={() => setFocusedIndex(idx)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              {searchQuery ? "No icons found" : "No icons available"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface IconButtonProps {
  iconClass: string;
  unicode: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  onFocus?: () => void;
}

function IconButton({ iconClass, name, isSelected, onClick, onFocus }: IconButtonProps) {
  return (
    <button
      type="button"
      role="gridcell"
      aria-label={name}
      title={name}
      onClick={onClick}
      onFocus={onFocus}
      className={cn(
        "aspect-square flex items-center justify-center rounded border text-base transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected
          ? "bg-primary text-primary-foreground border-primary"
          : "border-transparent bg-muted/40 text-foreground"
      )}
    >
      <i className={iconClass} aria-hidden="true" />
    </button>
  );
}
