# Odoo Icon Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, zero-backend web app for creating Odoo-style application icons with visual icon picker, presets, batch export, and sharing.

**Architecture:** Static Next.js 15 app with client-side canvas rendering. All features run in the browser — no database, no auth, no server. Icon sets loaded from CDN. User data persisted to localStorage.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, HTML Canvas API, JSZip, pako

**Spec:** `docs/superpowers/specs/2026-03-23-odoo-icon-builder-design.md`

---

## File Structure

```
src/
  app/
    page.tsx                    # Main builder page — composes SidePanel + IconCanvas
    layout.tsx                  # Root layout — ThemeProvider, fonts, metadata
    gallery/
      page.tsx                  # Local gallery page — reads localStorage, renders grid
    globals.css                 # Tailwind directives + custom CSS variables
  components/
    builder/
      IconCanvas.tsx            # Canvas preview with checkerboard bg, zoom, action bar
      SidePanel.tsx             # Left panel container — orchestrates all control sections
      VersionSelector.tsx       # Odoo version dropdown with style preview chips
      IconSourceTabs.tsx        # Tab switcher: Icon Font / Text / Image
      IconPicker.tsx            # Searchable icon grid with set filter tabs
      ColorSection.tsx          # Bg + icon color pickers with palette presets
      SizeControls.tsx          # Icon size, font size sliders, font weight toggle
      AdvancedControls.tsx      # Collapsible: gradient, shadow, corner radius
      PresetTemplates.tsx       # Modal/drawer with preset Odoo module icons
      TextInput.tsx             # Text mode — input + font picker
      ImageUpload.tsx           # Drag & drop + file picker
      ExportPanel.tsx           # Download PNG/SVG, copy, share, save actions
      BatchExport.tsx           # Dialog for multi-version/size zip export
    gallery/
      IconGrid.tsx              # Grid of saved icon cards
      IconCard.tsx              # Single card — thumbnail, name, actions
    layout/
      Header.tsx                # Logo, nav links, theme toggle
      ThemeToggle.tsx           # Dark/light switch
      MobileSheet.tsx           # Bottom sheet wrapper for mobile side panel
    ui/                         # shadcn/ui components (installed via CLI)
  lib/
    icon-renderer.ts            # IconRenderer class — canvas pipeline
    svg-renderer.ts             # SVG markup generator — mirrors canvas output
    color-utils.ts              # pSBC shade/blend, hex to rgb conversions
    odoo-versions.ts            # OdooVersionConfig — per-version rendering params
    icon-sets.ts                # Icon set registry, metadata loader, search index
    presets.ts                  # Template configs + color palette definitions
    share.ts                    # Encode/decode config to compressed URL param
    storage.ts                  # localStorage CRUD for saved icons + preferences
    fonts.ts                    # Google Fonts loader, font list
  hooks/
    useIconConfig.ts            # Central state: IconConfig + updater actions
    useIconRenderer.ts          # Calls IconRenderer.draw() on config change
    useIconSearch.ts            # Debounced fuzzy search across icon metadata
    useLocalStorage.ts          # Generic localStorage hook with SSR safety
  types/
    icon-config.ts              # IconConfig, IconSource, SavedIcon, OdooVersion types
```

---

### Task 1: Project Scaffolding and Base Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.gitignore`, `.eslintrc.json`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/elblasy/PycharmProjects/odoo_icon_builder
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the full Next.js scaffolding.

- [ ] **Step 2: Configure static export**

In `next.config.ts`, set output to static:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables enabled.

- [ ] **Step 4: Install core shadcn components**

```bash
npx shadcn@latest add button select slider tabs dialog dropdown-menu tooltip popover sheet label input separator scroll-area
```

- [ ] **Step 5: Install additional dependencies**

```bash
npm install jszip pako file-saver
npm install -D @types/pako @types/file-saver
```

- [ ] **Step 6: Set up theme with Odoo purple accent**

Update `src/app/globals.css` — replace the default shadcn theme with Odoo purple (#714BC2) as primary. Dark theme uses deep navy background (#0a0e1a). Light theme uses white with purple accents.

- [ ] **Step 7: Create theme provider**

Install `next-themes`:

```bash
npm install next-themes
```

Create `src/components/layout/ThemeProvider.tsx`:

```typescript
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 8: Set up root layout**

Update `src/app/layout.tsx` with Inter font, ThemeProvider wrapping children, dark as defaultTheme, enableSystem, and suppressHydrationWarning on html tag.

- [ ] **Step 9: Create placeholder builder page**

Update `src/app/page.tsx` with a flex layout: left sidebar (w-80, border-r, bg-card) and main canvas area (flex-1, centered content).

- [ ] **Step 10: Verify dev server runs**

```bash
cd /Users/elblasy/PycharmProjects/odoo_icon_builder && npm run dev
```

Open http://localhost:3000. Expect: dark-themed page with left sidebar and main content area.

- [ ] **Step 11: Verify static build**

```bash
npm run build
```

Expected: successful build with static export to `out/` directory.

- [ ] **Step 12: Initialize git and commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, and Odoo purple theme"
```

---

### Task 2: TypeScript Types and Odoo Version Config

**Files:**
- Create: `src/types/icon-config.ts`
- Create: `src/lib/odoo-versions.ts`
- Create: `src/lib/color-utils.ts`
- Test: `src/lib/__tests__/odoo-versions.test.ts`, `src/lib/__tests__/color-utils.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts` with jsdom environment, globals enabled, and path alias for `@/` pointing to `./src`.

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`

- [ ] **Step 2: Create TypeScript types**

Create `src/types/icon-config.ts` with:
- `OdooVersion` type: `"16.0" | "17.0" | "18.0" | "19.0"`
- `IconSource` discriminated union: icon, text, image
- `IconConfig` interface with all fields from spec
- `SavedIcon` interface with id, name, config, thumbnail, createdAt
- `OdooVersionConfig` interface for per-version rendering params
- `DEFAULT_CONFIG` constant

- [ ] **Step 3: Write failing tests for odoo-versions**

Create `src/lib/__tests__/odoo-versions.test.ts` — test that `getVersionConfig` returns correct params for each version, that v19 aliases to v18, and that `ODOO_VERSIONS` has 4 entries.

- [ ] **Step 4: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/odoo-versions.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 5: Implement odoo-versions**

Create `src/lib/odoo-versions.ts` with `VERSION_CONFIGS` record mapping each OdooVersion to its rendering parameters per the spec. Export `ODOO_VERSIONS` array and `getVersionConfig` function.

- [ ] **Step 6: Write failing tests for color-utils**

Create `src/lib/__tests__/color-utils.test.ts` — test `shadeColor` (darken, lighten, zero) and `hexToRgba` conversion.

- [ ] **Step 7: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/color-utils.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 8: Implement color-utils**

Create `src/lib/color-utils.ts` with `shadeColor(hex, percent)` and `hexToRgba(hex, alpha)` functions using bitwise math.

- [ ] **Step 9: Run all tests**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 10: Commit**

```bash
git add src/types/ src/lib/odoo-versions.ts src/lib/color-utils.ts src/lib/__tests__/ vitest.config.ts
git commit -m "feat: add TypeScript types, Odoo version configs, and color utilities"
```

---

### Task 3: Core Canvas Icon Renderer

**Files:**
- Create: `src/lib/icon-renderer.ts`
- Test: `src/lib/__tests__/icon-renderer.test.ts`

- [ ] **Step 1: Write failing tests for icon renderer**

Create `src/lib/__tests__/icon-renderer.test.ts` — test that:
- Canvas has correct dimensions
- Custom sizes work
- All 4 Odoo versions render without error
- Canvas exports to data URL

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/icon-renderer.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement IconRenderer class**

Create `src/lib/icon-renderer.ts` with the `IconRenderer` class implementing the rendering pipeline:

1. `render(config)` — orchestrates the pipeline, returns HTMLCanvasElement
2. `drawBackground(ctx, size, radius, color)` — rounded rect with clip
3. `drawHardShadow(ctx, config, size, shadowColor)` — iterative diagonal shadow
4. `drawIconWithShadow(ctx, config, size, versionConfig)` — text/icon with drop shadow
5. `drawText(ctx, config, x, y, color)` — handles text and icon source types
6. `drawInnerShadows(ctx, size, radius, alpha)` — top/bottom inner edge shadows
7. `drawGradient(ctx, size, alpha)` — diagonal linear gradient overlay
8. `renderWithImage(config, image)` — composites uploaded image onto background

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/__tests__/icon-renderer.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/icon-renderer.ts src/lib/__tests__/icon-renderer.test.ts
git commit -m "feat: implement core canvas icon renderer with Odoo version-specific rendering"
```

---

### Task 4: Icon Config State Hook and Live Canvas Component

**Files:**
- Create: `src/hooks/useIconConfig.ts`
- Create: `src/hooks/useIconRenderer.ts`
- Create: `src/components/builder/IconCanvas.tsx`

- [ ] **Step 1: Create useIconConfig hook**

Create `src/hooks/useIconConfig.ts` — manages `IconConfig` state with `updateConfig(partial)` and `resetConfig()` functions.

- [ ] **Step 2: Create useIconRenderer hook**

Create `src/hooks/useIconRenderer.ts` — takes config and a container ref, creates an `IconRenderer`, re-renders on config change with 16ms debounce. Replaces the canvas element in the container on each render.

- [ ] **Step 3: Create IconCanvas component**

Create `src/components/builder/IconCanvas.tsx` with:
- Checkerboard background using CSS `repeating-conic-gradient`
- Container div with ref for the rendered canvas
- Zoom controls (50%, 100%, 200%) using CSS transform
- Action bar: Download PNG (via `canvas.toDataURL`), Copy to Clipboard (via `canvas.toBlob` + ClipboardItem)

- [ ] **Step 4: Wire up builder page**

Update `src/app/page.tsx` as a client component using `useIconConfig` hook. Layout: aside with SidePanel placeholder, main with IconCanvas.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expect: rendered Odoo-style icon in canvas area with zoom and download buttons.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ src/components/builder/IconCanvas.tsx src/app/page.tsx
git commit -m "feat: add live canvas preview with zoom controls and PNG download"
```

---

### Task 5: Side Panel — Version Selector and Color Controls

**Files:**
- Create: `src/components/builder/VersionSelector.tsx`
- Create: `src/components/builder/ColorSection.tsx`
- Create: `src/components/builder/SidePanel.tsx`
- Create: `src/lib/presets.ts`

- [ ] **Step 1: Create color palette presets**

Create `src/lib/presets.ts` with:
- `ColorPalette` interface and `COLOR_PALETTES` array (Odoo Official, Pastel, Vibrant, Monochrome, Earth Tones) — each with bg/fg color pairs
- `PresetTemplate` interface and `PRESET_TEMPLATES` array (Sales, Inventory, HR, Accounting, CRM, Website, Manufacturing, Purchase, Project)

- [ ] **Step 2: Create VersionSelector**

Create `src/components/builder/VersionSelector.tsx` — shadcn Select dropdown for Odoo 16-19 with version labels.

- [ ] **Step 3: Create ColorSection**

Create `src/components/builder/ColorSection.tsx` — two color inputs (background, icon color) with hex display, plus palette preset swatches grouped by palette name. Clicking a swatch applies both bg and fg color.

- [ ] **Step 4: Create SidePanel**

Create `src/components/builder/SidePanel.tsx` — container that composes VersionSelector, ColorSection with Separator between sections.

- [ ] **Step 5: Update builder page to use SidePanel**

Wire SidePanel into `page.tsx` passing config and updateConfig.

- [ ] **Step 6: Verify in browser**

Version dropdown, color pickers, and palette swatches should all update the canvas live.

- [ ] **Step 7: Commit**

```bash
git add src/components/builder/ src/lib/presets.ts src/app/page.tsx
git commit -m "feat: add side panel with version selector and color palettes"
```

---

### Task 6: Size Controls and Advanced Settings

**Files:**
- Create: `src/components/builder/SizeControls.tsx`
- Create: `src/components/builder/AdvancedControls.tsx`
- Modify: `src/components/builder/SidePanel.tsx`

- [ ] **Step 1: Create SizeControls**

Create `src/components/builder/SizeControls.tsx` — sliders for icon width (64-1024), font size (16-800), and font weight select (300/400/700/900). Each shows current value.

- [ ] **Step 2: Create AdvancedControls**

Create `src/components/builder/AdvancedControls.tsx` — collapsible section with sliders for gradient intensity (0-1), shadow intensity (0-1), corner radius override. Includes "Reset to Defaults" button.

- [ ] **Step 3: Wire into SidePanel**

Add both components after ColorSection with Separator dividers.

- [ ] **Step 4: Verify in browser**

All sliders update canvas live. Advanced panel toggles open/close.

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/
git commit -m "feat: add size controls and advanced settings with live preview"
```

---

### Task 7: Text Mode and Icon Source Tabs

**Files:**
- Create: `src/components/builder/IconSourceTabs.tsx`
- Create: `src/components/builder/TextInput.tsx`
- Create: `src/lib/fonts.ts`
- Modify: `src/components/builder/SidePanel.tsx`
- Modify: `src/hooks/useIconRenderer.ts`

- [ ] **Step 1: Create TextInput component**

Create `src/components/builder/TextInput.tsx` — text input (maxLength 10) and font family select from a curated list of 20 fonts (5 system + 15 Google Fonts).

- [ ] **Step 2: Create IconSourceTabs**

Create `src/components/builder/IconSourceTabs.tsx` — shadcn Tabs with Icon/Text/Image tabs. Handles tab switching by converting the source type. Text tab renders TextInput. Icon and Image tabs show placeholder text for now.

- [ ] **Step 3: Create fonts.ts**

Create `src/lib/fonts.ts` — `loadGoogleFont(fontFamily)` function that dynamically injects a Google Fonts stylesheet link and waits for `document.fonts.ready`. Tracks loaded fonts to avoid duplicate loads. Skips system fonts.

- [ ] **Step 4: Wire font loading into useIconRenderer**

Call `loadGoogleFont` before rendering when source is text type and font is not a system font.

- [ ] **Step 5: Add IconSourceTabs to SidePanel**

Insert between VersionSelector and ColorSection.

- [ ] **Step 6: Verify text mode**

Switch to Text tab, type "HR" — renders on the icon. Change font — updates live.

- [ ] **Step 7: Commit**

```bash
git add src/components/builder/ src/lib/fonts.ts src/hooks/
git commit -m "feat: add icon source tabs with text mode and Google Fonts loading"
```

---

### Task 8: Icon Picker with Search

**Files:**
- Create: `src/lib/icon-sets.ts`
- Create: `src/components/builder/IconPicker.tsx`
- Create: `src/hooks/useIconSearch.ts`
- Modify: `src/components/builder/IconSourceTabs.tsx`

- [ ] **Step 1: Create icon sets registry**

Create `src/lib/icon-sets.ts` with:
- `IconMeta` interface (name, class, unicode, tags)
- `IconSet` interface (id, name, prefix, fontFamily, cssUrl, icons, loaded)
- Registry of 3 icon sets: Bootstrap Icons, Remix, Tabler — each with CDN CSS URL
- `loadIconSetCSS(setId)` — injects stylesheet link, waits for font ready
- `loadIconSetMetadata(setId)` — loads CSS then extracts icon names and unicode codepoints by parsing CSSStyleRule selectors matching the prefix pattern with `::before` pseudo-element. Fallback: if CSS parsing yields no results, create hidden DOM elements with icon classes and read `::before` content via `getComputedStyle()`. If both fail, mark that icon with an error indicator.

Icon sets to register (all 5 from spec):
- Bootstrap Icons (`bootstrap-icons`, CDN: jsdelivr bootstrap-icons@1.11.3)
- Remix Icons (`remixicon`, CDN: jsdelivr remixicon@4.1.0)
- Tabler Icons (`tabler-icons`, CDN: jsdelivr @tabler/icons-webfont@latest)
- Font Awesome 6 Free (`Font Awesome 6 Free`, CDN: cdnflare font-awesome@6.5.1)
- Lucide (`lucide`, CDN: unpkg lucide-static@latest)

- [ ] **Step 2: Create useIconSearch hook**

Create `src/hooks/useIconSearch.ts` — takes icons array and query string. Debounces query by 150ms. Filters by name and tags. Returns max 200 results.

- [ ] **Step 3: Create IconPicker**

Create `src/components/builder/IconPicker.tsx` — icon set tabs at top, search input, scrollable grid of icon buttons. Shows loading state, error with retry, empty state. Selected icon is highlighted with primary color.

- [ ] **Step 4: Add recent picks tracking**

Store last 12 selected icons in localStorage (key: `odoo-icon-builder-recent`). Display them at the top of the picker grid under a "Recent" label before the main icon list. Update on each selection.

- [ ] **Step 5: Wire IconPicker into IconSourceTabs**

Render IconPicker in the icon tab. On select, call onSourceChange with the icon's class, unicode, and font family.

- [ ] **Step 6: Verify icon picker**

Bootstrap Icons should load, show searchable grid. Clicking selects and updates canvas. Recent picks appear at top after first selection.

- [ ] **Step 7: Commit**

```bash
git add src/lib/icon-sets.ts src/hooks/useIconSearch.ts src/components/builder/IconPicker.tsx src/components/builder/IconSourceTabs.tsx
git commit -m "feat: add icon picker with search, lazy loading, and CDN font loading"
```

---

### Task 9: Image Upload

**Files:**
- Create: `src/components/builder/ImageUpload.tsx`
- Modify: `src/components/builder/IconSourceTabs.tsx`
- Modify: `src/hooks/useIconRenderer.ts`

- [ ] **Step 1: Create ImageUpload component**

Create `src/components/builder/ImageUpload.tsx` with:
- Drag and drop zone with file input fallback
- File validation: max 2MB, only PNG/JPG/SVG
- SVGs are immediately rasterized via canvas drawImage for XSS prevention
- Images resized to 512px max via canvas for storage efficiency
- Shows preview thumbnail or drop zone placeholder
- Remove button to clear image

- [ ] **Step 2: Wire into IconSourceTabs**

Render ImageUpload in the image tab, passing imageDataUrl and handler.

- [ ] **Step 3: Update useIconRenderer for image source**

When source is image type with non-empty dataUrl: create an Image element, wait for load, then call `renderer.renderWithImage()`. Handle async nature with useEffect.

- [ ] **Step 4: Verify image upload**

Upload a PNG. It should appear composited on the Odoo-style background.

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/ImageUpload.tsx src/components/builder/IconSourceTabs.tsx src/hooks/useIconRenderer.ts
git commit -m "feat: add image upload with drag and drop, SVG rasterization, and canvas compositing"
```

---

### Task 10: Preset Templates

**Files:**
- Create: `src/components/builder/PresetTemplates.tsx`
- Modify: `src/components/builder/SidePanel.tsx`

- [ ] **Step 1: Create PresetTemplates component**

Create `src/components/builder/PresetTemplates.tsx` — shadcn Dialog trigger button ("Start from Template"). Dialog content shows a 3-column grid of preset cards. Each card shows a colored square with the icon class and the module name. Clicking applies the full preset config via onApply callback.

- [ ] **Step 2: Add to SidePanel**

Place "Start from Template" button after the title section.

- [ ] **Step 3: Verify presets**

Click template — colors and icon update in the builder.

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/PresetTemplates.tsx src/components/builder/SidePanel.tsx
git commit -m "feat: add preset templates for common Odoo modules"
```

---

### Task 11: Share Link (URL Encoding)

**Files:**
- Create: `src/lib/share.ts`
- Test: `src/lib/__tests__/share.test.ts`
- Create: `src/components/builder/ExportPanel.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write failing tests for share encoding**

Create `src/lib/__tests__/share.test.ts` — test round-trip encoding/decoding, URL length under 4000 for default config, image data stripping, and null return for invalid input.

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/share.test.ts
```

- [ ] **Step 3: Implement share.ts**

Create `src/lib/share.ts`:
- `encodeConfig(config)` — strips image data, JSON stringifies, pako deflates, base64 encodes, URI encodes
- `decodeConfig(encoded)` — reverse: URI decode, base64 decode, pako inflate, JSON parse. Returns null on error.
- `buildShareUrl(config)` — creates full URL with config param. Returns null if over 4000 chars.

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/__tests__/share.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Create ExportPanel**

Create `src/components/builder/ExportPanel.tsx` — Share Link button that copies URL to clipboard. Shows status message (success or "URL too long").

- [ ] **Step 6: Load shared config on page load**

In `src/app/page.tsx`, read `config` URL search param on mount, decode with `decodeConfig`, and use as initial config.

- [ ] **Step 7: Commit**

```bash
git add src/lib/share.ts src/lib/__tests__/share.test.ts src/components/builder/ExportPanel.tsx src/app/page.tsx
git commit -m "feat: add share link encoding with pako compression and URL round-trip"
```

---

### Task 12: SVG Export

**Files:**
- Create: `src/lib/svg-renderer.ts`
- Test: `src/lib/__tests__/svg-renderer.test.ts`
- Modify: `src/components/builder/IconCanvas.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/svg-renderer.test.ts` — test that output contains `<svg>` and `</svg>`, includes background color, includes text content, and has correct width/height attributes.

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/svg-renderer.test.ts
```

- [ ] **Step 3: Implement svg-renderer**

Create `src/lib/svg-renderer.ts`:
- `renderSvg(config)` — builds SVG string with: defs (clipPath, linearGradient, dropShadow filter), clipped group with background rect, text element with icon/text content, gradient overlay rect. Escapes XML entities.
- `downloadSvg(config, filename)` — creates blob URL and triggers download

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/__tests__/svg-renderer.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Add SVG download button to IconCanvas**

Import `downloadSvg` and add "Download SVG" button to the action bar.

- [ ] **Step 6: Commit**

```bash
git add src/lib/svg-renderer.ts src/lib/__tests__/svg-renderer.test.ts src/components/builder/IconCanvas.tsx
git commit -m "feat: add client-side SVG export mirroring canvas rendering"
```

---

### Task 13: Batch Export

**Files:**
- Create: `src/components/builder/BatchExport.tsx`
- Modify: `src/components/builder/IconCanvas.tsx`

- [ ] **Step 1: Create BatchExport component**

Create `src/components/builder/BatchExport.tsx` — shadcn Dialog with:
- Version toggle buttons (16.0, 17.0, 18.0, 19.0) — multi-select
- Size toggle buttons (128px, 256px, 512px) — multi-select
- Count display ("N icons will be exported")
- Download ZIP button — renders each combination using IconRenderer, packages with JSZip, downloads via file-saver's saveAs
- Loading state during export

- [ ] **Step 2: Add BatchExport to IconCanvas action bar**

- [ ] **Step 3: Verify batch export**

Click Batch Export, select versions/sizes, download ZIP. Verify ZIP contains correct PNG files.

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/BatchExport.tsx src/components/builder/IconCanvas.tsx
git commit -m "feat: add batch export with version/size selection and ZIP download"
```

---

### Task 14: Local Gallery (localStorage)

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/components/gallery/IconGrid.tsx`
- Create: `src/components/gallery/IconCard.tsx`
- Create: `src/app/gallery/page.tsx`
- Test: `src/lib/__tests__/storage.test.ts`

- [ ] **Step 1: Write failing tests for storage**

Create `src/lib/__tests__/storage.test.ts` — test save/retrieve, delete by id, and max limit pruning. Clear localStorage in beforeEach.

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/__tests__/storage.test.ts
```

- [ ] **Step 3: Implement storage.ts**

Create `src/lib/storage.ts`:
- `STORAGE_KEY` constant and `MAX_SAVED_ICONS = 50`
- `getIcons()` — parse from localStorage, return empty array on error
- `saveIcon(name, config, thumbnail)` — create SavedIcon with crypto.randomUUID, prepend to array, prune excess, save
- `deleteIcon(id)` — filter and save
- `getStorageSize()` — return byte size of stored data

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/__tests__/storage.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Create useLocalStorage hook**

Create `src/hooks/useLocalStorage.ts` — generic hook with SSR-safe initial read.

- [ ] **Step 6: Create gallery components**

Create `src/components/gallery/IconCard.tsx` — thumbnail, name, date, edit/duplicate/delete buttons.
Create `src/components/gallery/IconGrid.tsx` — reads from storage, renders grid of cards, handles delete with state refresh.

- [ ] **Step 7: Create gallery page**

Create `src/app/gallery/page.tsx` — page title and IconGrid component.

- [ ] **Step 8: Add Save to Gallery in IconCanvas action bar**

Add "Save Locally" button to the quick-action bar below the preview canvas (alongside Download PNG, Download SVG, Copy, Share). On click: prompt for name via a small dialog, render thumbnail from canvas as data URL, call `saveIcon()`.

- [ ] **Step 9: Implement gallery edit, duplicate, and export**

In `IconCard.tsx`:
- **Edit:** Navigate to `/?config=<encoded>` using the saved icon's config — reuses the share encoding to load it into the builder
- **Duplicate:** Call `saveIcon(name + " copy", config, thumbnail)` and refresh the grid
- **Export:** Render the config to canvas via `IconRenderer`, trigger PNG download

- [ ] **Step 9: Commit**

```bash
git add src/lib/storage.ts src/lib/__tests__/storage.test.ts src/hooks/useLocalStorage.ts src/components/gallery/ src/app/gallery/
git commit -m "feat: add local gallery with localStorage persistence"
```

---

### Task 15: Header, Navigation and Mobile Layout

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/ThemeToggle.tsx`
- Create: `src/components/layout/MobileSheet.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create ThemeToggle**

Create `src/components/layout/ThemeToggle.tsx` — uses `useTheme` from next-themes. Button toggles dark/light.

- [ ] **Step 2: Create Header**

Create `src/components/layout/Header.tsx` — app title, nav links (Builder, Gallery), ThemeToggle. Responsive layout.

- [ ] **Step 3: Create MobileSheet**

Create `src/components/layout/MobileSheet.tsx` — wraps SidePanel content in shadcn Sheet component (side="bottom"). Trigger button visible only on mobile (md:hidden). SidePanel itself hidden on mobile (hidden md:block).

- [ ] **Step 4: Update layout and builder page**

Add Header to root layout. Update builder page for responsive: desktop shows side panel, mobile shows sheet trigger.

- [ ] **Step 5: Verify responsive layout**

Test at 375px width (mobile) and 1280px (desktop). Mobile: bottom sheet opens with controls. Desktop: fixed side panel.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add header with navigation, theme toggle, and mobile bottom sheet"
```

---

### Task 16: Polish, Accessibility and Final Build

**Files:**
- Modify: various components for a11y improvements
- Modify: `src/app/globals.css` for focus styles

- [ ] **Step 1: Add keyboard navigation to icon picker**

Add `onKeyDown` handler to icon grid — arrow keys move selection, Enter selects. Track focused index in state.

- [ ] **Step 2: Add ARIA labels**

Audit all interactive elements: icon buttons, color swatches, sliders, action buttons. Add appropriate `aria-label` attributes. Add `role="grid"` to icon picker.

- [ ] **Step 3: Add focus ring styles**

In `globals.css`, add focus-visible outline using the ring CSS variable for both themes.

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: all PASS.

- [ ] **Step 5: Run static build**

```bash
npm run build
```

Expected: successful static export.

- [ ] **Step 6: Verify production build**

```bash
npx serve out
```

Test all features: icon picker, text mode, image upload, color palettes, version switching, batch export, share link, gallery save/load, mobile layout, theme toggle.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: add accessibility, keyboard navigation, and polish for production"
```

---

---

### Task 17: Error Handling and Toast Notifications

**Files:**
- Install: `sonner` (toast library)
- Create: `src/components/layout/Toaster.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/builder/IconPicker.tsx` (font load error + retry)
- Modify: `src/components/builder/ImageUpload.tsx` (toast on errors)
- Modify: `src/components/builder/IconCanvas.tsx` (render error boundary)
- Modify: `src/lib/storage.ts` (capacity warning)

- [ ] **Step 1: Install sonner and add Toaster**

```bash
npm install sonner
```

Create `src/components/layout/Toaster.tsx` and add `<Toaster />` to root layout.

- [ ] **Step 2: Add font load error handling to IconPicker**

In `loadIconSetCSS`: add 5s timeout. On failure, show error badge on that icon set tab with a retry button. Use toast to notify. Other sets remain usable.

- [ ] **Step 3: Add toast notifications to ImageUpload**

Replace `alert()` calls with `toast.error()` from sonner for: file too large, invalid format, processing failure.

- [ ] **Step 4: Add canvas render error boundary**

Wrap the render call in `useIconRenderer` with try/catch. On error, display a "Render failed" message in the canvas area instead of the icon. Show error detail in a collapsible section.

- [ ] **Step 5: Add localStorage capacity monitoring**

In `saveIcon()`: after saving, check `getStorageSize()`. If over 4MB, show `toast.warning()` suggesting to delete old icons from gallery.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add error handling with toast notifications for all failure scenarios"
```

---

### Task 18: E2E Tests with Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/builder.spec.ts`
- Create: `e2e/share.spec.ts`
- Create: `e2e/gallery.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Create `playwright.config.ts` with baseURL `http://localhost:3000`, webServer config to run `npm run dev`.

- [ ] **Step 2: Write builder E2E test**

Create `e2e/builder.spec.ts`:
- Test: page loads with default icon rendered (canvas element exists)
- Test: switch to text mode, type "HR", verify canvas re-renders
- Test: click Download PNG, verify download triggered
- Test: change Odoo version, verify canvas updates

- [ ] **Step 3: Write share link E2E test**

Create `e2e/share.spec.ts`:
- Test: click Share Link, verify URL copied to clipboard contains `config=` param
- Test: navigate to URL with config param, verify builder loads with correct config

- [ ] **Step 4: Write gallery E2E test**

Create `e2e/gallery.spec.ts`:
- Test: save an icon, navigate to /gallery, verify it appears
- Test: delete from gallery, verify it disappears

- [ ] **Step 5: Run E2E tests**

```bash
npx playwright test
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts e2e/
git commit -m "test: add Playwright E2E tests for builder, share link, and gallery flows"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffolding | next.config, layout, globals.css |
| 2 | Types and Odoo configs | types/icon-config.ts, odoo-versions.ts, color-utils.ts |
| 3 | Canvas renderer | icon-renderer.ts |
| 4 | Live canvas + hooks | useIconConfig, useIconRenderer, IconCanvas |
| 5 | Version + colors | VersionSelector, ColorSection, SidePanel, presets |
| 6 | Size + advanced | SizeControls, AdvancedControls |
| 7 | Text mode + tabs | IconSourceTabs, TextInput, fonts.ts |
| 8 | Icon picker + search | icon-sets.ts, IconPicker, useIconSearch |
| 9 | Image upload | ImageUpload |
| 10 | Preset templates | PresetTemplates |
| 11 | Share link | share.ts, ExportPanel |
| 12 | SVG export | svg-renderer.ts |
| 13 | Batch export | BatchExport + JSZip |
| 14 | Local gallery | storage.ts, gallery page |
| 15 | Header + mobile | Header, ThemeToggle, MobileSheet |
| 16 | Polish + a11y | Focus styles, ARIA, keyboard nav |
| 17 | Error handling | Toast notifications, error boundaries, capacity warnings |
| 18 | E2E tests | Playwright tests for builder, share, gallery flows |
