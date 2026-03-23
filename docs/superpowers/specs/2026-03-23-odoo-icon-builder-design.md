# Odoo Icon Builder — Design Specification

## Overview

A modern, lightweight web application for creating application icons in the style of Odoo ERP. Targets all users — developers, consultants, designers, marketers — with a fully visual, point-and-click interface requiring zero technical knowledge.

Inspired by [spilymp/ibo](https://github.com/spilymp/ibo) but rebuilt from scratch with modern tech, expanded features, and support for Odoo 16–19.

**Key principle: Zero backend.** Everything runs client-side. No database, no accounts, no server. Deploy as a static site anywhere.

## Tech Stack

- **Framework:** Next.js 15 (App Router, static export) + React 19 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui component library
- **Icon Rendering:** HTML Canvas API (client-side)
- **SVG Export:** Client-side SVG markup generation from config
- **Batch Zip:** JSZip (client-side)
- **URL Compression:** pako (zlib, for share link encoding)
- **Icon Sets:** Bootstrap Icons, Remix, Tabler, Font Awesome 6 Free, Lucide — loaded from CDN at runtime (not bundled) for lazy loading and smaller bundle
- **Local Persistence:** localStorage for recent icons and preferences
- **Deployment:** Static export (`next export`) — GitHub Pages, Vercel, Netlify, any CDN

## Architecture

### Static Site Structure

Pure client-side application. No API routes, no database, no server runtime. Next.js is used for its React framework, component system, and static export — not for server features.

### Project Structure

```
src/
  app/
    page.tsx                  # Main builder page (default route)
    layout.tsx                # Root layout with theme provider
    gallery/
      page.tsx                # Local saved icons (localStorage)
  components/
    builder/
      IconCanvas.tsx          # Live preview canvas with zoom
      SidePanel.tsx           # Left control panel container
      IconPicker.tsx          # Searchable icon grid with categories
      ColorPicker.tsx         # Color picker + palette presets
      VersionSelector.tsx     # Odoo 16-19 with visual preview
      ExportPanel.tsx         # Download, share controls
      PresetTemplates.tsx     # Pre-made Odoo module icon templates
      TextInput.tsx           # Custom text mode input
      ImageUpload.tsx         # Drag & drop image upload
      BatchExport.tsx         # Multi-version/size export dialog
    gallery/
      IconGrid.tsx            # Saved icons grid
      IconCard.tsx            # Individual saved icon card
    layout/
      Header.tsx              # App header with theme toggle
      ThemeToggle.tsx         # Dark/light mode switch
      MobileSheet.tsx         # Bottom sheet for mobile controls
    ui/                       # shadcn/ui base components
  lib/
    icon-renderer.ts          # Core canvas rendering engine
    svg-renderer.ts           # SVG markup generation (mirrors canvas output)
    icon-sets.ts              # Icon set metadata, search index, lazy loading
    odoo-versions.ts          # Version-specific rendering rules
    share.ts                  # Share link encoding/decoding (compressed base64 URL params)
    presets.ts                # Template & palette preset definitions
    fonts.ts                  # Font loading & management
    storage.ts                # localStorage wrapper for saved icons & preferences
  hooks/
    useIconConfig.ts          # Icon configuration state management
    useIconRenderer.ts        # Canvas rendering hook
    useIconSearch.ts          # Icon search with debounce
    useLocalStorage.ts        # localStorage read/write hook
  types/
    icon-config.ts            # Central TypeScript types
```

## Icon Configuration Type

The central data structure used for rendering, persistence, and sharing:

```typescript
interface IconConfig {
  // Odoo version
  odooVersion: '16.0' | '17.0' | '18.0' | '19.0';

  // Icon source (discriminated union)
  source:
    | { type: 'icon'; iconSet: string; iconClass: string; unicodeChar?: string }
    | { type: 'text'; text: string; fontFamily: string }
    | { type: 'image'; imageDataUrl: string }; // base64, resized to max ~200KB

  // Colors
  backgroundColor: string;  // hex, e.g. "#714BC2"
  iconColor: string;         // hex, e.g. "#ffffff"

  // Sizing
  iconWidth: number;         // px, default 300
  fontSize: number;          // px, default auto (50% of iconWidth)
  fontWeight: 300 | 400 | 700 | 900;

  // Advanced overrides (optional)
  gradientIntensity?: number;   // 0-1, default version-dependent
  shadowIntensity?: number;     // 0-1, default version-dependent
  cornerRadiusOverride?: number; // px, overrides version default
}
```

## UI Layout

### Desktop (Side Panel + Canvas)

Left panel (fixed width ~320px, collapsible) contains all controls. Right area is the live canvas preview. Controls are always visible — no tabs hiding settings.

#### Side Panel Sections (top to bottom)

1. **Odoo Version** — Dropdown selector for 16, 17, 18, 19. Each option shows a small visual indicator of the icon shape style.

2. **Icon Source** — Tab switch between three modes:
   - **Icon Font** — searchable grid with icon set filter tabs (Bootstrap Icons, Remix, Tabler, Font Awesome 6, Lucide)
   - **Custom Text** — text input (1-4 chars recommended) with font picker
   - **Upload Image** — drag & drop zone for PNG/SVG/JPG (max 2MB), client-side resize & crop

3. **Icon Picker** (when Icon Font mode active) — search bar with fuzzy matching across all loaded icon sets. Results show icon glyph + name + set badge. Recent picks shown at top. Category filters (arrows, communication, devices, weather, commerce, etc.).

4. **Colors** — background color picker with preset palettes. Icon/font color picker. Palette presets: "Odoo Official", "Pastel", "Vibrant", "Monochrome", "Earth Tones". One-click apply.

5. **Size & Style** — icon size slider, font size slider, font weight toggle (normal/light).

6. **Advanced** (collapsible) — custom gradient intensity, shadow intensity, corner radius override.

#### Canvas Area

- Checkerboard transparency background
- Centered live icon preview
- Zoom controls: 50%, 100%, 200%
- Quick-action bar below preview: Download PNG, Download SVG, Copy to Clipboard, Share Link, Save Locally

### Mobile Layout

- Side panel collapses into a bottom sheet (swipe up to access)
- Preview remains at top, always visible
- Bottom action bar for export/share actions
- Touch-friendly: larger tap targets, swipe gestures

### Theme

- **Default:** Dark mode with Odoo purple (#714BC2) accent color throughout
- **Toggle:** Dark/light switch in header
- Persisted to localStorage, respects system preference on first visit
- Dark base makes colorful icon previews stand out

### Accessibility

- Full keyboard navigation for all controls (tab order, arrow keys in icon grid)
- ARIA labels on icon picker items, color inputs, and action buttons
- Focus ring visible in both dark and light themes
- Color contrast meets WCAG AA for all text and interactive elements

## Core Icon Rendering Engine

Modernized from IBO's canvas approach. All rendering happens client-side for instant feedback.

### Rendering Pipeline

1. `setUp()` — Create canvas element, configure 2D context, set dimensions
2. `setBackground()` — Draw rounded rectangle with version-specific corner radius
3. `setHardShadow()` — Diagonal shadow behind icon symbol (version-dependent intensity)
4. `setTextWithShadow()` — Draw icon glyph/text with drop shadow
5. `setInlineShadow()` — Top and bottom inner edge shadows
6. `setGradient()` — Subtle diagonal gradient overlay
7. Return canvas for display or export

### Odoo Version Rendering Differences

- **Odoo 16:** Rounded rectangle (4.7% corner radius), gradient overlay (0.2 alpha), inner shadows top/bottom (0.4 alpha), hard diagonal shadow (-0.4 darkened bg), drop shadow (y-offset 2%, rgba 0,0,0,0.4)
- **Odoo 17:** Same rounded rect, reduced gradient (0.15 alpha), softer shadows (0.3 alpha), lighter hard shadow (-0.25 darkened bg)
- **Odoo 18:** Slightly larger corner radius (5.5%), minimal gradient (0.1 alpha), subtle shadows (0.2 alpha), no hard diagonal shadow
- **Odoo 19:** Same pipeline as 18 with updated defaults. Exact parameters will be extracted from Odoo 19 source (`odoo/addons/base/static/description/icon.png` and related SCSS) during implementation sprint 1. If visually identical to 18, we alias the config.

### Live Preview

Every parameter change triggers an immediate re-render. No "Generate" button — the preview is always current. Rendering is debounced (16ms) for smooth slider interactions.

### Icon Font Resolution

Primary approach: Each icon set ships with a JSON metadata file mapping icon names to Unicode codepoints. The picker uses this metadata directly — no DOM inspection needed.

Fallback: If metadata is unavailable, create a temporary hidden DOM element with the CSS class, read `::before` content via `getComputedStyle()`. If this also fails (font not loaded), show an error indicator on that icon in the picker.

Icon font CSS is loaded on-demand per icon set.

## Features

### A: Icon Search & Browse

Visual grid with fuzzy search across all icon sets. No typing CSS classes — purely point-and-click. Icons loaded lazily per set to keep initial bundle small. Search index built from icon set metadata JSON (name, tags, category per icon).

### B: Preset Templates

Pre-configured icons matching real Odoo modules:
- Sales (green + trending chart), Inventory (blue + box), HR (orange + people), Accounting (teal + calculator), CRM (purple + handshake), Website (indigo + globe), Manufacturing (brown + gear), Purchase (red + cart), Project (cyan + kanban), etc.

Displayed as a "Start from template" grid on first visit or via a button. Clicking loads full config into the builder for customization.

### C: Color Palette Presets

Curated palette collections:
- **Odoo Official** — exact background colors from Odoo's built-in modules
- **Pastel** — soft, muted tones
- **Vibrant** — bold, saturated colors
- **Monochrome** — grayscale variations
- **Earth Tones** — natural, warm colors

Each palette entry = background color + icon color pair. One-click apply.

### E: Local Gallery

- Saved icons stored in localStorage as array of `{ name, config, thumbnail, createdAt }`
- Displayed on `/gallery` page as a grid
- Actions: edit (reopen in builder), duplicate, delete, export
- Max ~50 icons in localStorage (with size monitoring). Oldest auto-pruned with warning if limit approached.
- No accounts, no sync — device-local convenience storage
- Note: `name` lives in the gallery entry wrapper, not in `IconConfig` itself

### D: Batch Export

- "Export All Versions" — renders current icon for Odoo 16, 17, 18, 19 as a zip
- "Export All Sizes" — 128px, 256px, 512px variants
- Combined: all versions × all sizes in one zip
- 100% client-side using JSZip — renders each variant on canvas, converts to blob, packages into zip, triggers download

### F: Share Link

URL-only sharing, no backend needed:
- Encode icon config as compressed base64 in URL params (`/builder?config=eJyz...`)
- Uses `pako` (zlib) for compression to keep URLs short
- For configs with uploaded images: image is excluded from share URL (too large), replaced with a placeholder message prompting re-upload
- URL length budget: max 4,000 characters after encoding. If exceeded, show a user-friendly message suggesting simplifying the config or removing the uploaded image.

### G: SVG Export

Client-side SVG generation that mirrors the canvas rendering:
- Construct SVG markup programmatically using the same rendering logic (rounded rect, gradients, shadows as SVG filters, text/icon as SVG text element)
- `svg-renderer.ts` implements the same pipeline as `icon-renderer.ts` but outputs SVG DOM instead of canvas calls
- Download as `.svg` file via blob URL

### H: Image Upload

- Drag & drop or file picker for PNG, SVG, JPG
- Client-side resize & center-crop to fit icon area (max 200KB after processing using canvas resize)
- Composited onto Odoo-style background with same shadows and gradients
- Max input file size: 2MB (validated client-side)
- Uploaded SVGs are immediately rasterized via canvas `drawImage()` to prevent XSS from embedded scripts or external references
- Stored as base64 data URL in the IconConfig
- Preview updates live as image is adjusted

### I: Text Mode

- Tab switch in icon source selector to "Custom Text"
- Text input field (1-4 characters recommended, renders any length)
- Font picker: curated subset of ~20 Google Fonts (loaded via Google Fonts API on selection) + system fonts
- Same color, size, weight, and style controls apply
- Common use: module abbreviations like "HR", "CRM", "MRP", "WH"

## Error Handling

- **Font load failure:** Icon picker shows a loading spinner per icon set. If a font fails to load after 5s, that set shows an error badge with retry button. Builder still works with other sets.
- **Image upload errors:** File too large → toast message with size limit. Invalid format → toast with accepted formats. Processing failure → toast with retry option.
- **Share URL too long:** User-friendly message suggesting to remove uploaded image or simplify config.
- **Canvas rendering failure:** Catch errors in render pipeline, show a "Render failed" placeholder with the error detail in a collapsible panel.
- **localStorage full:** Toast warning when approaching 4MB usage. Suggest deleting old saved icons from gallery.

## Testing Strategy

- **Unit tests:** Vitest for `icon-renderer.ts`, `svg-renderer.ts`, `share.ts`, `odoo-versions.ts` — pure logic functions
- **Component tests:** React Testing Library for builder components (icon picker search, color picker interaction, version selector)
- **Visual regression:** Playwright screenshot tests comparing rendered canvas output across Odoo versions to reference PNGs
- **E2E:** Playwright for critical flows — pick icon → customize → download, batch export, share link round-trip
- **Accessibility:** axe-core integration in component tests

## Key Design Decisions

1. **Zero backend** — No database, no accounts, no server. Pure static site deployable anywhere.
2. **Client-side rendering** — Canvas API for instant preview, SVG markup generation for scalable export.
3. **Lazy icon loading** — Icon sets loaded on-demand to keep initial bundle under 200KB.
4. **URL-based sharing** — Config encoded in URL means sharing works with zero infrastructure.
5. **localStorage persistence** — Device-local saved icons. Simple, zero-maintenance.
6. **Static export** — `next export` produces a folder of HTML/CSS/JS. Deploy to any CDN or static host.
7. **Icon metadata JSON** — Prefer pre-built metadata over runtime DOM inspection for reliability and performance.
