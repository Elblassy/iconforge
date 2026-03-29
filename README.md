<p align="center">
  <img src="public/favicon.svg" width="80" alt="IconForge Logo" />
</p>

<h1 align="center">IconForge</h1>

<p align="center">
  <strong>The Modern Odoo Icon Builder</strong><br/>
  Create beautiful, professional module icons for Odoo 16-19 in seconds.
</p>

<p align="center">
  <a href="https://iconforge.elblasy.app"><strong>Use IconForge Now &rarr;</strong></a>
</p>

<p align="center">
  <a href="https://iconforge.elblasy.app">
    <img src="https://img.shields.io/badge/Try%20It-iconforge.elblasy.app-714BC2?style=for-the-badge&logo=odoo&logoColor=white" alt="Try IconForge" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Odoo-16%20|%2017%20|%2018%20|%2019-714BC2?style=flat-square&logo=odoo&logoColor=white" alt="Odoo Versions" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-ICFL--1.0-714BC2?style=flat-square" alt="License" />
</p>

---

## What is IconForge?

**[iconforge.elblasy.app](https://iconforge.elblasy.app)** is a free web tool that lets anyone create Odoo module icons -- no design skills needed. Pick an icon, choose your colors, and export production-ready PNG and SVG files that work perfectly in Odoo.

Built with the **exact same color palettes and styles** used by Odoo's official modules (Sales, Inventory, HR, Accounting, etc.).

### Before IconForge
> Manually editing PNGs in Photoshop, guessing Odoo's icon format, wrong sizes, broken dark mode...

### After IconForge
> Open [iconforge.elblasy.app](https://iconforge.elblasy.app) -> pick icon -> choose colors -> download ZIP -> drop into your module. Done.

---

## Features

### Icon Sources
- **5 Icon Libraries** -- Bootstrap Icons, Font Awesome 6, Remix Icons, Tabler Icons, Lucide
- **Custom Text** -- Type module abbreviations like "HR", "CRM", "MRP" with 20+ Google Fonts
- **Image Upload** -- Drag & drop your own PNG/SVG/JPG logo

### Odoo-Style Color System
- **Solid** -- Single clean color
- **Tinted** -- Smooth gradient from auto-generated dark to main to light
- **Duo** -- Two-color split (hard or smooth blend)
- **Trio** -- Three-color bands (hard or smooth blend) -- like Odoo's official icons
- **8 Odoo Presets** -- One-click color palettes extracted from real Odoo 18 modules
- **12 Module Templates** -- Sales, Inventory, HR, Accounting, CRM, Website, and more

### Export Options
- **PNG (Odoo 16)** -- 128x128px with solid background
- **SVG (with background)** -- Full icon wrapped in SVG
- **Odoo 17+ Package** -- ZIP with both `icon.svg` + `icon.png` ready for `static/description/`
- **Batch Export** -- All Odoo versions x all sizes in one ZIP
- **Copy to Clipboard** -- Paste directly into docs or chat
- **Share Link** -- URL-encoded config, share your exact icon setup

### And More
- **Company Logo Overlay** -- Add your brand to any corner
- **Local Gallery** -- Save icons to browser, edit/duplicate/export later
- **Dark/Light Theme** -- Matches your OS preference
- **Mobile Responsive** -- Works on phone and tablet
- **Zero Backend** -- Everything runs in your browser. No data sent anywhere.

---

## How to Use

1. Go to **[iconforge.elblasy.app](https://iconforge.elblasy.app)**
2. Pick an icon from 5 libraries, type custom text, or upload your image
3. Choose a color style (Solid, Tinted, Duo, or Trio) or use an Odoo preset
4. Download your icon:
   - **Odoo 16**: Click "PNG (Odoo 16)"
   - **Odoo 17+**: Click "Odoo 17+ (SVG+PNG)" for a ready-to-use ZIP
5. Place files in your module's `static/description/` folder

### Odoo 16 Module Structure
```
your_module/
  static/
    description/
      icon.png    <-- 128x128px, solid background
```

### Odoo 17+ Module Structure
```
your_module/
  static/
    description/
      icon.svg    <-- Vector, transparent bg, theme-aware
      icon.png    <-- Fallback for installer & settings
```

---

## Contributing

We welcome contributions! IconForge is open source and community-driven.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Clone and install: `npm install`
4. Run dev server: `npm run dev`
5. Make your changes
6. Run tests: `npm run test`
7. Commit and push
8. Open a Pull Request

### Development

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at localhost:3000
npm run test      # Run unit tests
npm run build     # Build static export to out/
```

### Guidelines

- Follow existing code patterns and TypeScript conventions
- Add tests for new utility functions
- Keep the zero-backend principle -- no server-side dependencies
- Test with all 5 icon sets and both Odoo 16 and 17+ export modes

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

---

## Self-Hosting

If you want to host your own instance (attribution required per license):

### Docker

```bash
docker compose up -d --build
```

Runs at `http://localhost:3080`

### Static Hosting

```bash
npm run build
```

Deploy the `out/` folder to Vercel, Netlify, GitHub Pages, or any static host.

---

## License

### IconForge Community License (ICFL-1.0)

Copyright (c) 2026 [elblasy.app](https://elblasy.app)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, and distribute the Software, subject to the following conditions:

1. **Attribution Required** -- The "Powered by [elblasy.app](https://elblasy.app)" branding in the header and footer must remain visible and unmodified in all deployed instances. The link must point to `https://elblasy.app`.

2. **Canonical Reference** -- The official instance is [iconforge.elblasy.app](https://iconforge.elblasy.app). Self-hosted instances must retain attribution per condition 1.

3. **Contributions** -- By submitting a pull request, you agree your contribution is licensed under these same terms.

4. **Commercial Use** -- Permitted as long as conditions 1 and 2 are met.

5. **No Warranty** -- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

For questions about licensing, contact: [elblasy.app](https://elblasy.app)

---

<p align="center">
  <a href="https://iconforge.elblasy.app">
    <img src="https://img.shields.io/badge/Use%20IconForge-iconforge.elblasy.app-714BC2?style=for-the-badge" alt="Use IconForge" />
  </a>
</p>

<p align="center">
  <img src="public/elblasy-logo.png" width="32" alt="elblasy.app" />
  <br/>
  <strong>Built with love by <a href="https://elblasy.app">elblasy.app</a></strong>
  <br/>
  <sub>Odoo is a trademark of Odoo S.A. IconForge is not affiliated with or endorsed by Odoo S.A.</sub>
</p>
