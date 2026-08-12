# CLAUDE.md

This file gives guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

**Jinhao Wan's RF research portfolio** — an interactive academic site themed around deep learning for RF signal identification and the RF detection of UAVs. It is a **zero-build, vanilla HTML/CSS/JS** site: no framework, no bundler, no compile step. GitHub Pages serves the repository root directly. Built on the [Spatialfolio](https://github.com/zhuqinfeng1999/interactive-academic-portfolio) template (SNCA-1.0 license).

## Commands

```bash
npm run serve      # static dev server at http://127.0.0.1:4173 (scripts/serve.mjs)
npm run validate   # integrity check (scripts/validate-site.mjs) — run before committing
```

There are **no tests, no linter, no build**. `npm run validate` is the only quality gate. The site runs by opening the static files; there is nothing to compile.

## Architecture

### Data-driven, one source of truth

`assets/data/research.json` is the single content model. Schema:
- `person` — identity (name, email, role, location, affiliations).
- `domains[]` — research directions shown in the Research Atlas graph + list. Each has `id`, `number`, `kicker`, `title`, `description`, `image`, atlas `position {x,y}`, and `publicationIds[]`.
- `publications[]` — entries for the Publications library + homepage features. Each has `id`, `year`, `venue`, `venueShort`, `type`, `status`, `title`, `authors[]` (with `self`), `featuredRank`, `image`, `summary`, `keywords[]`, `links{}`, `bibtex`.
- `projects[]` — entries for the Projects index. Each has `id`, `title`, `type`, `eyebrow`, `year`, `description`, `image`, `tags[]`, `href`.
- `news[]` — timeline items.

It is consumed by `assets/js/research-atlas.js` (atlas graph + domain list + timeline), `assets/js/publications.js` (filterable library), `assets/js/projects.js` (filterable project grid), and `assets/js/cosmic.js` (⌘K command palette indexes domains/projects/publications from it). **To add content, edit `research.json`** — not the HTML.

### The RF canvas engine (`assets/js/spatial-world.js`)

A from-scratch 2D canvas engine (NOT the template's original 3D engine). It is an IIFE exporting `window.SpatialWorld`, instantiated on every `<canvas data-spatial-world>`. Public interface (must be preserved):
- constructor reads `canvas.dataset.scene` (`'hero'|'explorer'`) and `canvas.dataset.mode`.
- `bind()` — ResizeObserver, pointer events, IntersectionObserver (pause off-screen), visibilitychange, and click wiring for `[data-world-mode]` / `[data-explorer-mode]` → `setMode(value)`.
- `resize()`, `setMode(mode)` (toggles button `.active`/`aria-pressed`, locks `[data-roles]`), `updateReadout()` (writes `[data-world-title/detail/status/interaction]`, toggles `.semantic-legend`), `draw(time, force)` rAF loop (~30fps, pause-when-hidden, static draw under `prefers-reduced-motion`).

Four RF modes replace the template's spatial modes: `features` (default; signal feature space, legend shown), `constellation` (IQ diagram), `spectrum` (waterfall), `detection` (UAV scope). These mode keys are referenced from HTML (`data-mode`, `data-world-mode`, `data-explorer-mode`) and must stay in sync across files.

### Pages

Root-absolute paths (`/assets/...`, `/research/`) are used everywhere because the user site is served from `/`. Pages: `index.html`, `404.html`, `research/`, `publications/`, `projects/`, `explorer/`, `projects/rf-detection/`. The homepage's hero/research/projects/news sections are hand-authored; the library/atlas/projects pages render from JSON.

### Validator (`scripts/validate-site.mjs`)

Checks: every route in `expectedRoutes` exists; internal links/images resolve (case-correct); no duplicate HTML IDs; the **attribution credit URL** (`https://github.com/zhuqinfeng1999/interactive-academic-portfolio`) is present in **every** `.html`; domain `publicationIds` reference real publications; featured publications have images; no duplicate data IDs. `report.valid` must be all-green. **When adding a page, add its route to `expectedRoutes`.**

## License constraint (hard)

SNCA-1.0 requires a visible, accessible footer credit to the Spatialfolio template on **every page**. Do not remove or hide the `.template-origin` footer link — the validator enforces its presence in each HTML file.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` stages the static files (excluding `.git`, `node_modules`, `scripts`, etc.) and publishes to GitHub Pages. No build step. `.nojekyll` is kept.
