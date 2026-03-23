"use client";

import { useState, useEffect } from "react";
import type { IconMeta } from "@/lib/icon-sets";

const MAX_RESULTS = 200;

export function useIconSearch(icons: IconMeta[], query: string): IconMeta[] {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  if (!debouncedQuery.trim()) {
    return icons.slice(0, MAX_RESULTS);
  }

  const lower = debouncedQuery.toLowerCase();
  const filtered = icons.filter((icon) => {
    if (icon.name.toLowerCase().includes(lower)) return true;
    if (icon.tags?.some((tag) => tag.toLowerCase().includes(lower))) return true;
    return false;
  });

  return filtered.slice(0, MAX_RESULTS);
}
