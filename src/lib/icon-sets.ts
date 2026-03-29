export interface IconMeta {
  name: string;
  class: string;
  unicode: string;
  tags?: string[];
}

export interface IconSet {
  id: string;
  name: string;
  prefix: string;
  fontFamily: string;
  cssUrl: string;
  icons: IconMeta[];
  loaded: boolean;
}

const registry: IconSet[] = [
  {
    id: "bootstrap",
    name: "Bootstrap",
    prefix: "bi",
    fontFamily: "bootstrap-icons",
    cssUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
    icons: [],
    loaded: false,
  },
  {
    id: "remix",
    name: "Remix",
    prefix: "ri",
    fontFamily: "remixicon",
    cssUrl:
      "https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css",
    icons: [],
    loaded: false,
  },
  {
    id: "tabler",
    name: "Tabler",
    prefix: "ti",
    fontFamily: "tabler-icons",
    cssUrl:
      "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/tabler-icons.min.css",
    icons: [],
    loaded: false,
  },
  {
    id: "fontawesome",
    name: "Font Awesome",
    prefix: "fa",
    fontFamily: "Font Awesome 6 Free",
    cssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
    icons: [],
    loaded: false,
  },
  {
    id: "lucide",
    name: "Lucide",
    prefix: "lucide",
    fontFamily: "lucide",
    cssUrl: "https://unpkg.com/lucide-static@0.468.0/font/lucide.css",
    icons: [],
    loaded: false,
  },
];

export function getIconSets(): IconSet[] {
  return registry;
}

const loadedCSSUrls = new Set<string>();

export function loadIconSetCSS(setId: string): Promise<void> {
  const set = registry.find((s) => s.id === setId);
  if (!set) {
    console.warn(`Unknown icon set: ${setId}`);
    return Promise.resolve();
  }
  if (loadedCSSUrls.has(set.cssUrl)) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    // Check if link already exists in the DOM
    const existing = document.querySelector(`link[href="${set.cssUrl}"]`);
    if (existing) {
      loadedCSSUrls.add(set.cssUrl);
      document.fonts.ready.then(() => resolve()).catch(() => resolve());
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = set.cssUrl;
    link.crossOrigin = "anonymous";

    const timer = setTimeout(() => {
      // Timeout: resolve anyway so rendering can proceed (icon may show as fallback)
      console.warn(`Timed out loading CSS for icon set: ${setId}`);
      loadedCSSUrls.add(set.cssUrl); // mark as attempted to avoid retrying
      resolve();
    }, 5000);

    link.onload = () => {
      clearTimeout(timer);
      loadedCSSUrls.add(set.cssUrl);
      document.fonts.ready.then(() => resolve()).catch(() => resolve());
    };

    link.onerror = () => {
      clearTimeout(timer);
      // Resolve instead of reject — a failed font shouldn't crash rendering
      console.warn(`Failed to load CSS for icon set: ${setId}`);
      loadedCSSUrls.add(set.cssUrl); // mark as attempted
      resolve();
    };

    document.head.appendChild(link);
  });
}

/**
 * Attempt to extract unicode codepoints from a parsed stylesheet rule.
 * The content property looks like: '"\\f123"' or '"\uf123"'
 */
function extractUnicode(content: string): string {
  // Strip surrounding quotes and whitespace
  const cleaned = content.trim().replace(/^["']|["']$/g, "");
  // If it's a hex escape like \f123 in CSS, convert to actual char
  const hexMatch = cleaned.match(/\\([0-9a-fA-F]{4,6})/);
  if (hexMatch) {
    return String.fromCodePoint(parseInt(hexMatch[1], 16));
  }
  // Already a unicode character
  if (cleaned.length > 0) {
    return cleaned;
  }
  return "";
}

/**
 * Build Font Awesome class string. FA uses compound classes:
 * fa-solid fa-home, fa-regular fa-envelope, fa-brands fa-github, etc.
 */
function buildFAClass(name: string): string {
  // Determine style prefix from common patterns
  const brandsIcons = new Set([
    "github", "twitter", "facebook", "instagram", "linkedin", "youtube",
    "google", "apple", "windows", "android", "linux", "wordpress",
    "slack", "discord", "whatsapp", "telegram", "reddit", "twitch",
    "spotify", "paypal", "stripe", "bitcoin", "ethereum",
  ]);
  if (brandsIcons.has(name)) {
    return `fa-brands fa-${name}`;
  }
  return `fa-solid fa-${name}`;
}

export async function loadIconSetMetadata(setId: string): Promise<IconMeta[]> {
  const set = registry.find((s) => s.id === setId);
  if (!set) throw new Error(`Unknown icon set: ${setId}`);

  // Return cached icons if already loaded
  if (set.loaded && set.icons.length > 0) {
    return set.icons;
  }

  // First, load the CSS
  await loadIconSetCSS(setId);

  const icons: IconMeta[] = [];

  // Try to parse stylesheets for icon definitions
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      // Skip cross-origin sheets that we can't read
      let rules: CSSRuleList | null = null;
      try {
        rules = sheet.cssRules;
      } catch {
        // Cross-origin — will fall through to DOM fallback
        continue;
      }

      if (!rules) continue;

      // Only parse stylesheets from our icon set's CDN URL
      const sheetHref = sheet.href || "";
      if (sheetHref && sheetHref !== set.cssUrl) continue;

      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSStyleRule)) continue;

        const selector = rule.selectorText;
        if (!selector) continue;

        let name: string | null = null;
        let iconClass: string = "";

        if (setId === "fontawesome") {
          // FA uses patterns like .fa-home::before, .fa-solid::before
          // We want icon-specific ones (not style-prefix ones)
          const faMatch = selector.match(/\.fa-([a-z0-9-]+)::?before/);
          if (faMatch) {
            const iconName = faMatch[1];
            // Skip style prefix selectors
            if (["solid", "regular", "light", "thin", "duotone", "brands", "sharp"].includes(iconName)) continue;
            name = iconName;
            iconClass = buildFAClass(iconName);
          }
        } else {
          // Bootstrap: .bi-home::before
          // Remix: .ri-home-line::before
          // Tabler: .ti-home::before
          // Lucide: .lucide-home::before
          const prefixPattern = new RegExp(`\\.${set.prefix}-([a-z0-9-]+)::?before`);
          const match = selector.match(prefixPattern);
          if (match) {
            name = match[1];
            iconClass = `${set.prefix} ${set.prefix}-${name}`;

            // Bootstrap uses "bi bi-name", others may differ
            if (setId === "remix") {
              iconClass = `${set.prefix}-${name}`;
            } else if (setId === "tabler") {
              iconClass = `ti ti-${name}`;
            } else if (setId === "lucide") {
              iconClass = `lucide lucide-${name}`;
            }
          }
        }

        if (name && rule.style) {
          const content = rule.style.getPropertyValue("content");
          if (content && content !== "none" && content !== '""' && content !== "''") {
            const unicode = extractUnicode(content);
            if (unicode) {
              icons.push({ name, class: iconClass, unicode });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Stylesheet parsing failed for ${setId}:`, err);
  }

  // DOM fallback: if stylesheet parsing yielded nothing (cross-origin restriction),
  // create hidden elements for known class patterns and read via getComputedStyle
  if (icons.length === 0) {
    const fallbackIcons = await domFallback(set);
    icons.push(...fallbackIcons);
  }

  set.icons = icons;
  set.loaded = true;

  return icons;
}

/**
 * DOM-based fallback for cross-origin stylesheets.
 * We create a hidden element with each icon class and read its ::before content.
 * We generate a list of candidate names by iterating all loaded CSS rules
 * looking for selector patterns even if we can't read content due to CORS.
 */
async function domFallback(set: IconSet): Promise<IconMeta[]> {
  const icons: IconMeta[] = [];

  // Collect candidate icon names from selectors (even cross-origin sheets allow selector reading in some browsers)
  const candidateNames: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      // For cross-origin we can't read rules at all — use hardcoded fallback names
      continue;
    }
    if (!rules) continue;

    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      const selector = rule.selectorText;
      if (!selector) continue;

      if (set.id === "fontawesome") {
        const faMatch = selector.match(/\.fa-([a-z0-9-]+)::?before/);
        if (faMatch) {
          const n = faMatch[1];
          if (!["solid", "regular", "light", "thin", "duotone", "brands", "sharp"].includes(n)) {
            candidateNames.push(n);
          }
        }
      } else {
        const prefixPattern = new RegExp(`\\.${set.prefix}-([a-z0-9-]+)::?before`);
        const match = selector.match(prefixPattern);
        if (match) candidateNames.push(match[1]);
      }
    }
  }

  // Unique names
  const unique = [...new Set(candidateNames)];

  if (unique.length === 0) {
    // Absolute fallback: use a small hardcoded list of well-known icons
    return getHardcodedFallback(set);
  }

  // Create a hidden container and test icons in batches
  const container = document.createElement("div");
  container.style.cssText = "position:absolute;top:-9999px;left:-9999px;visibility:hidden;";
  document.body.appendChild(container);

  try {
    const batchSize = 50;
    for (let i = 0; i < Math.min(unique.length, 500); i += batchSize) {
      const batch = unique.slice(i, i + batchSize);
      const elements: HTMLElement[] = [];

      for (const name of batch) {
        const el = document.createElement("i");
        if (set.id === "fontawesome") {
          el.className = buildFAClass(name);
        } else if (set.id === "bootstrap") {
          el.className = `bi bi-${name}`;
        } else if (set.id === "remix") {
          el.className = `ri-${name}`;
        } else if (set.id === "tabler") {
          el.className = `ti ti-${name}`;
        } else if (set.id === "lucide") {
          el.className = `lucide lucide-${name}`;
        } else {
          el.className = `${set.prefix}-${name}`;
        }
        el.dataset.iconName = name;
        container.appendChild(el);
        elements.push(el);
      }

      // Allow render
      await new Promise((r) => requestAnimationFrame(r));

      for (const el of elements) {
        const name = el.dataset.iconName!;
        const before = window.getComputedStyle(el, "::before");
        const content = before.getPropertyValue("content");
        if (content && content !== "none" && content !== '""' && content !== "''") {
          const unicode = extractUnicode(content);
          if (unicode) {
            icons.push({
              name,
              class: el.className,
              unicode,
            });
          }
        }
      }
    }
  } finally {
    document.body.removeChild(container);
  }

  return icons;
}

/**
 * Absolute hardcoded fallback with a small set of common icons per icon set.
 */
function getHardcodedFallback(set: IconSet): IconMeta[] {
  const fallbacks: Record<string, IconMeta[]> = {
    bootstrap: [
      { name: "box", class: "bi bi-box", unicode: "\uF2B4" },
      { name: "star", class: "bi bi-star", unicode: "\uF590" },
      { name: "heart", class: "bi bi-heart", unicode: "\uF341" },
      { name: "house", class: "bi bi-house", unicode: "\uF3A0" },
      { name: "person", class: "bi bi-person", unicode: "\uF4D1" },
      { name: "gear", class: "bi bi-gear", unicode: "\uF3E5" },
      { name: "search", class: "bi bi-search", unicode: "\uF52A" },
      { name: "envelope", class: "bi bi-envelope", unicode: "\uF32E" },
      { name: "calendar", class: "bi bi-calendar", unicode: "\uF1E8" },
      { name: "file", class: "bi bi-file", unicode: "\uF336" },
      { name: "folder", class: "bi bi-folder", unicode: "\uF35D" },
      { name: "trash", class: "bi bi-trash", unicode: "\uF5DE" },
      { name: "pencil", class: "bi bi-pencil", unicode: "\uF4CB" },
      { name: "check", class: "bi bi-check", unicode: "\uF26B" },
      { name: "x", class: "bi bi-x", unicode: "\uF659" },
      { name: "plus", class: "bi bi-plus", unicode: "\uF4FE" },
      { name: "dash", class: "bi bi-dash", unicode: "\uF2EA" },
      { name: "arrow-right", class: "bi bi-arrow-right", unicode: "\uF138" },
      { name: "arrow-left", class: "bi bi-arrow-left", unicode: "\uF12C" },
      { name: "bell", class: "bi bi-bell", unicode: "\uF192" },
      { name: "chat", class: "bi bi-chat", unicode: "\uF250" },
      { name: "download", class: "bi bi-download", unicode: "\uF30A" },
      { name: "upload", class: "bi bi-upload", unicode: "\uF600" },
      { name: "lock", class: "bi bi-lock", unicode: "\uF3FA" },
      { name: "eye", class: "bi bi-eye", unicode: "\uF332" },
    ],
    fontawesome: [
      { name: "house", class: "fa-solid fa-house", unicode: "\uF015" },
      { name: "star", class: "fa-solid fa-star", unicode: "\uF005" },
      { name: "heart", class: "fa-solid fa-heart", unicode: "\uF004" },
      { name: "user", class: "fa-solid fa-user", unicode: "\uF007" },
      { name: "gear", class: "fa-solid fa-gear", unicode: "\uF013" },
      { name: "magnifying-glass", class: "fa-solid fa-magnifying-glass", unicode: "\uF002" },
      { name: "envelope", class: "fa-solid fa-envelope", unicode: "\uF0E0" },
      { name: "calendar", class: "fa-solid fa-calendar", unicode: "\uF073" },
      { name: "file", class: "fa-solid fa-file", unicode: "\uF15B" },
      { name: "folder", class: "fa-solid fa-folder", unicode: "\uF07B" },
      { name: "trash", class: "fa-solid fa-trash", unicode: "\uF1F8" },
      { name: "pen", class: "fa-solid fa-pen", unicode: "\uF304" },
      { name: "check", class: "fa-solid fa-check", unicode: "\uF00C" },
      { name: "xmark", class: "fa-solid fa-xmark", unicode: "\uF00D" },
      { name: "plus", class: "fa-solid fa-plus", unicode: "\uF067" },
      { name: "minus", class: "fa-solid fa-minus", unicode: "\uF068" },
      { name: "bell", class: "fa-solid fa-bell", unicode: "\uF0F3" },
      { name: "comment", class: "fa-solid fa-comment", unicode: "\uF075" },
      { name: "download", class: "fa-solid fa-download", unicode: "\uF019" },
      { name: "upload", class: "fa-solid fa-upload", unicode: "\uF093" },
      { name: "lock", class: "fa-solid fa-lock", unicode: "\uF023" },
      { name: "eye", class: "fa-solid fa-eye", unicode: "\uF06E" },
      { name: "bolt", class: "fa-solid fa-bolt", unicode: "\uF0E7" },
      { name: "chart-bar", class: "fa-solid fa-chart-bar", unicode: "\uF080" },
    ],
    remix: [
      { name: "home-line", class: "ri-home-line", unicode: "\uEE19" },
      { name: "star-line", class: "ri-star-line", unicode: "\uF0A5" },
      { name: "heart-line", class: "ri-heart-line", unicode: "\uEE0B" },
      { name: "user-line", class: "ri-user-line", unicode: "\uF168" },
      { name: "settings-line", class: "ri-settings-line", unicode: "\uF09E" },
      { name: "search-line", class: "ri-search-line", unicode: "\uF0CD" },
      { name: "mail-line", class: "ri-mail-line", unicode: "\uEED4" },
      { name: "calendar-line", class: "ri-calendar-line", unicode: "\uEB25" },
      { name: "file-line", class: "ri-file-line", unicode: "\uEC79" },
      { name: "folder-line", class: "ri-folder-line", unicode: "\uEC9E" },
      { name: "delete-bin-line", class: "ri-delete-bin-line", unicode: "\uEC60" },
      { name: "pencil-line", class: "ri-pencil-line", unicode: "\uEFBF" },
      { name: "check-line", class: "ri-check-line", unicode: "\uEB7B" },
      { name: "close-line", class: "ri-close-line", unicode: "\uEB98" },
      { name: "add-line", class: "ri-add-line", unicode: "\uEA12" },
      { name: "subtract-line", class: "ri-subtract-line", unicode: "\uF109" },
      { name: "notification-line", class: "ri-notification-line", unicode: "\uEFA0" },
      { name: "chat-1-line", class: "ri-chat-1-line", unicode: "\uEB7E" },
      { name: "download-line", class: "ri-download-line", unicode: "\uEC93" },
      { name: "upload-line", class: "ri-upload-line", unicode: "\uF15E" },
      { name: "lock-line", class: "ri-lock-line", unicode: "\uEED1" },
      { name: "eye-line", class: "ri-eye-line", unicode: "\uEC9A" },
    ],
    tabler: [
      { name: "home", class: "ti ti-home", unicode: "\uEB6E" },
      { name: "star", class: "ti ti-star", unicode: "\uEB09" },
      { name: "heart", class: "ti ti-heart", unicode: "\uEB21" },
      { name: "user", class: "ti ti-user", unicode: "\uEB4C" },
      { name: "settings", class: "ti ti-settings", unicode: "\uEB03" },
      { name: "search", class: "ti ti-search", unicode: "\uEB1C" },
      { name: "mail", class: "ti ti-mail", unicode: "\uEB70" },
      { name: "calendar", class: "ti ti-calendar", unicode: "\uEA26" },
      { name: "file", class: "ti ti-file", unicode: "\uEA77" },
      { name: "folder", class: "ti ti-folder", unicode: "\uEA83" },
      { name: "trash", class: "ti ti-trash", unicode: "\uEB41" },
      { name: "pencil", class: "ti ti-pencil", unicode: "\uEB6C" },
      { name: "check", class: "ti ti-check", unicode: "\uEA5E" },
      { name: "x", class: "ti ti-x", unicode: "\uEB55" },
      { name: "plus", class: "ti ti-plus", unicode: "\uEB0B" },
      { name: "minus", class: "ti ti-minus", unicode: "\uEB39" },
      { name: "bell", class: "ti ti-bell", unicode: "\uEA1F" },
      { name: "message", class: "ti ti-message", unicode: "\uEB31" },
      { name: "download", class: "ti ti-download", unicode: "\uEA8F" },
      { name: "upload", class: "ti ti-upload", unicode: "\uEB48" },
      { name: "lock", class: "ti ti-lock", unicode: "\uEB6F" },
      { name: "eye", class: "ti ti-eye", unicode: "\uEA70" },
    ],
    lucide: [
      { name: "home", class: "lucide lucide-home", unicode: "\uE000" },
      { name: "star", class: "lucide lucide-star", unicode: "\uE001" },
      { name: "heart", class: "lucide lucide-heart", unicode: "\uE002" },
      { name: "user", class: "lucide lucide-user", unicode: "\uE003" },
      { name: "settings", class: "lucide lucide-settings", unicode: "\uE004" },
      { name: "search", class: "lucide lucide-search", unicode: "\uE005" },
      { name: "mail", class: "lucide lucide-mail", unicode: "\uE006" },
      { name: "calendar", class: "lucide lucide-calendar", unicode: "\uE007" },
      { name: "file", class: "lucide lucide-file", unicode: "\uE008" },
      { name: "folder", class: "lucide lucide-folder", unicode: "\uE009" },
      { name: "trash", class: "lucide lucide-trash", unicode: "\uE00A" },
      { name: "pencil", class: "lucide lucide-pencil", unicode: "\uE00B" },
      { name: "check", class: "lucide lucide-check", unicode: "\uE00C" },
      { name: "x", class: "lucide lucide-x", unicode: "\uE00D" },
      { name: "plus", class: "lucide lucide-plus", unicode: "\uE00E" },
      { name: "minus", class: "lucide lucide-minus", unicode: "\uE00F" },
      { name: "bell", class: "lucide lucide-bell", unicode: "\uE010" },
      { name: "message-square", class: "lucide lucide-message-square", unicode: "\uE011" },
      { name: "download", class: "lucide lucide-download", unicode: "\uE012" },
      { name: "upload", class: "lucide lucide-upload", unicode: "\uE013" },
      { name: "lock", class: "lucide lucide-lock", unicode: "\uE014" },
      { name: "eye", class: "lucide lucide-eye", unicode: "\uE015" },
    ],
  };

  return fallbacks[set.id] ?? [];
}
