"use client";

import { useState, useEffect, useRef } from "react";
import type { IconMeta, GlobalSearchResult } from "@/lib/icon-sets";
import { getIconSets, loadIconSetMetadata } from "@/lib/icon-sets";
import { ICON_CATEGORIES } from "@/lib/icon-categories";

const MAX_RESULTS = 200;
const MAX_GLOBAL_RESULTS = 100;

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

/**
 * Expand a query using the category dictionary.
 * Returns the matched category name + all its keywords, or null if no match.
 */
function expandWithCategories(query: string): { category: string; keywords: string[] } | null {
  const lower = query.toLowerCase().trim();
  if (!lower) return null;

  // Direct category key match
  if (ICON_CATEGORIES[lower]) {
    return { category: lower, keywords: ICON_CATEGORIES[lower] };
  }

  // Check if the query is itself a keyword that maps to a category
  for (const [cat, keywords] of Object.entries(ICON_CATEGORIES)) {
    if (keywords.some((kw) => kw === lower || lower === cat)) {
      return { category: cat, keywords };
    }
  }

  // Partial match on category names
  for (const [cat, keywords] of Object.entries(ICON_CATEGORIES)) {
    if (cat.includes(lower) || lower.includes(cat)) {
      return { category: cat, keywords };
    }
  }

  return null;
}

/**
 * Score an icon against a query and optional expanded keywords.
 * Higher = better. Returns 0 if no match.
 */
function scoreIcon(icon: IconMeta, lower: string, expandedKeywords: string[] | null): number {
  const name = icon.name.toLowerCase();
  const tags = icon.tags?.map((t) => t.toLowerCase()) ?? [];

  // Exact name match
  if (name === lower) return 100;

  // Name starts with query
  if (name.startsWith(lower)) return 80;

  // Name contains query
  if (name.includes(lower)) return 60;

  // Tags exact match
  if (tags.some((t) => t === lower)) return 70;

  // Tags contain query
  if (tags.some((t) => t.includes(lower))) return 50;

  // Category keyword match on name
  if (expandedKeywords) {
    for (const kw of expandedKeywords) {
      if (name.includes(kw) || name === kw) return 40;
      if (tags.some((t) => t.includes(kw))) return 30;
    }
  }

  return 0;
}

export interface GlobalSearchState {
  results: GlobalSearchResult[];
  loading: boolean;
  categoryMatch: string | null;
}

export function useGlobalIconSearch(query: string): GlobalSearchState {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryMatch, setCategoryMatch] = useState<string | null>(null);
  // Track if all sets have been loaded at least once
  const allSetsLoadedRef = useRef(false);

  // Debounce at 300 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setCategoryMatch(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function run() {
      setLoading(true);

      const iconSets = getIconSets();

      // Load all sets lazily
      await Promise.all(
        iconSets.map((s) => loadIconSetMetadata(s.id).catch(() => []))
      );

      if (cancelled) return;

      const lower = debouncedQuery.toLowerCase().trim();
      const expansion = expandWithCategories(lower);
      const expandedKeywords = expansion?.keywords ?? null;

      if (!cancelled) {
        setCategoryMatch(expansion ? expansion.category : null);
      }

      const scored: Array<GlobalSearchResult & { score: number }> = [];

      for (const set of iconSets) {
        for (const icon of set.icons) {
          const score = scoreIcon(icon, lower, expandedKeywords);
          if (score > 0) {
            scored.push({
              ...icon,
              setId: set.id,
              setName: set.name,
              fontFamily: set.fontFamily,
              score,
            });
          }
        }
      }

      if (cancelled) return;

      // Sort: highest score first, then alphabetically by name
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });

      const finalResults: GlobalSearchResult[] = scored
        .slice(0, MAX_GLOBAL_RESULTS)
        .map(({ score: _score, ...rest }) => rest);

      setResults(finalResults);
      setLoading(false);
      allSetsLoadedRef.current = true;
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return { results, loading, categoryMatch };
}
