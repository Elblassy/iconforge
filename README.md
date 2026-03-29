<p align="center">
  <img src="public/favicon.svg" width="80" alt="IconForge Logo" />
</p>

<h1 align="center">IconForge</h1>

<p align="center">
  <strong>The Modern Odoo Icon Builder</strong><br/>
  Create beautiful, professional module icons for Odoo 16-19 in seconds.
</p>

<p align="center">
  <a href="https://iconforge.elblasy.app">Live Demo</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#getting-started">Get Started</a> &middot;
  <a href="#deployment">Deploy</a> &middot;
  <a href="#contributing">Contribute</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Odoo-16%20|%2017%20|%2018%20|%2019-714BC2?style=flat-square&logo=odoo&logoColor=white" alt="Odoo Versions" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-ICFL--1.0-714BC2?style=flat-square" alt="License" />
</p>

---

## What is IconForge?

IconForge is a free, open-source web app that lets anyone create Odoo module icons -- no design skills needed. Pick an icon, choose your colors, and export production-ready PNG and SVG files that work perfectly in Odoo.

Built with the **exact same color palettes and styles** used by Odoo's official modules (Sales, Inventory, HR, Accounting, etc.).

### Before IconForge
> Manually editing PNGs in Photoshop, guessing Odoo's icon format, wrong sizes, broken dark mode...

### After IconForge
> Pick icon -> choose colors -> download ZIP -> drop into your module. Done.

---

## Features

### Icon Sources
- **5 Icon Libraries** -- Bootstrap Icons, Font Awesome 6, Remix Icons, Tabler Icons, Lucide
- **Custom Text** -- Type module abbreviations like "HR", "CRM", "MRP" with 20+ Google Fonts
- **Image Upload** -- Drag & drop your own PNG/SVG/JPG logo

### Color System
- **Solid** -- Single clean color
- **Tinted** -- Smooth gradient from auto-generated dark to main to light
- **Duo** -- Two-color vertical split (hard or blended)
- **Trio** -- Three-color bands (hard or blended) -- like Odoo's official icons
- **8 Odoo Presets** -- One-click color palettes extracted from real Odoo 18 modules

### Export Options
- **PNG (Odoo 16)** -- 128x128px with solid background, classic format
- **SVG (with background)** -- Full icon wrapped in SVG
- **Odoo 17+ Package** -- ZIP with both `icon.svg` (transparent, theme-aware) and `icon.png` -- ready for `static/description/`
- **Batch Export** -- All Odoo versions x all sizes in one ZIP
- **Copy to Clipboard** -- Paste directly into docs or chat
- **Share Link** -- URL-encoded config, share your exact icon setup

### More
- **Company Logo Overlay** -- Add your logo to any corner of the icon
- **12 Preset Templates** -- Sales, Inventory, HR, Accounting, CRM, Website, Manufacturing, Purchase, Project, Discuss, Calendar, Settings
- **Local Gallery** -- Save icons to browser, edit/duplicate/export later
- **Dark/Light Theme** -- Matches your OS preference
- **Mobile Responsive** -- Works on phone and tablet
- **Zero Backend** -- Everything runs in your browser. No data sent anywhere.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/AElblasy/iconforge.git
cd iconforge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

Static files are exported to `out/` -- deploy anywhere.

---

## Deployment

### Docker (Recommended)

```bash
docker compose up -d --build
```

The app runs at `http://localhost:3080`

### Docker Compose

```yaml
services:
  iconforge:
    build: .
    ports:
      - "3080:80"
    restart: unless-stopped
```

### Static Hosting

The `out/` folder after `npm run build` can be deployed to:
- **Vercel** -- `vercel deploy`
- **Netlify** -- drag & drop the `out/` folder
- **GitHub Pages** -- push `out/` to `gh-pages` branch
- **Any CDN** -- upload static files

---

## How Odoo Icons Work

### Odoo 16 (PNG)
```
your_module/
  static/
    description/
      icon.png    <-- 128x128px, solid background
```

### Odoo 17+ (SVG + PNG)
```
your_module/
  static/
    description/
      icon.svg    <-- Vector, transparent bg, theme-aware
      icon.png    <-- Fallback for installer/settings
```

IconForge's **"Odoo 17+ (SVG+PNG)"** button generates both files in a ZIP, ready to extract into your module.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework, static export |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI components |
| HTML Canvas | Icon rendering |
| JSZip | Client-side ZIP generation |
| pako | Share link compression |
| nginx | Production serving (Docker) |

---

## Project Structure

```
src/
  app/                  # Next.js pages (builder, gallery)
  components/
    builder/            # Icon builder UI components
    gallery/            # Saved icons gallery
    layout/             # Header, footer, theme toggle
    ui/                 # shadcn/ui base components
  lib/
    icon-renderer.ts    # Canvas rendering engine
    svg-renderer.ts     # SVG export with CDN icon fetching
    icon-sets.ts        # 5 icon libraries, CDN loading
    presets.ts          # Color palettes & template configs
    share.ts            # URL encoding/decoding
    storage.ts          # localStorage persistence
  hooks/                # React hooks (config, renderer, search)
  types/                # TypeScript type definitions
```

---

## Contributing

We welcome contributions! IconForge is open source and community-driven.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit (`git commit -m 'feat: add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Guidelines

- Follow existing code patterns and TypeScript conventions
- Add tests for new utility functions
- Keep the zero-backend principle -- no server-side dependencies
- Test with all 5 icon sets and both Odoo 16 and 17+ export modes

---

## License

### IconForge Community License (ICFL-1.0)

Copyright (c) 2026 [elblasy.app](https://elblasy.app)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, and distribute the Software, subject to the following conditions:

1. **Attribution Required** -- The "Powered by [elblasy.app](https://elblasy.app)" branding in the header and footer must remain visible and unmodified in all deployed instances. The link must point to `https://elblasy.app`.

2. **Service Requirement** -- Any public deployment of this Software (modified or unmodified) must use the official hosted instance at [iconforge.elblasy.app](https://iconforge.elblasy.app) as the canonical reference. You may host your own instance, but you may not remove or obscure the attribution.

3. **Contributions Welcome** -- Contributions via pull requests are encouraged. By submitting a pull request, you agree that your contribution will be licensed under the same terms.

4. **No Warranty** -- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

5. **Commercial Use** -- Commercial use is permitted as long as conditions 1 and 2 are met.

For questions about licensing, contact: [elblasy.app](https://elblasy.app)

---

<p align="center">
  <img src="public/elblasy-logo.png" width="32" alt="elblasy.app" />
  <br/>
  <strong>Built with love by <a href="https://elblasy.app">elblasy.app</a></strong>
  <br/>
  <sub>Odoo is a trademark of Odoo S.A. IconForge is not affiliated with or endorsed by Odoo S.A.</sub>
</p>
