# Jinhao Wan — RF Research Portfolio

Interactive academic portfolio for **Jinhao Wan** (PhD researcher, Zhejiang University of Technology), themed around **deep learning for RF signal identification and the RF detection of UAVs**.

Built on the [**Spatialfolio**](https://github.com/zhuqinfeng1999/interactive-academic-portfolio) template — a zero-build, vanilla HTML/CSS/JS academic portfolio.

## Stack

- **Zero build.** Plain HTML/CSS/JS served from the repo root — no framework, no bundler, no compile step. GitHub Pages deploys the root directly.
- **One data file.** `assets/data/research.json` drives the research atlas, publication library, project index and ⌘K command palette.
- **Bespoke RF canvas.** `assets/js/spatial-world.js` is a from-scratch 2D canvas engine with four RF modes: feature space, IQ constellation, spectrum, and UAV detection.

## Local preview

```bash
npm install      # optional — only pulls the dev helpers below
npm run serve    # static server at http://127.0.0.1:4173
npm run validate # integrity check
```

## Editing content

- Research directions, publications, projects, news → `assets/data/research.json`
- RF canvas modes and visuals → `assets/js/spatial-world.js`
- Page copy → the `*.html` files at the root and under `research/`, `publications/`, `projects/`, `explorer/`

## Deployment

Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which stages the static site and publishes it to GitHub Pages at **https://wanjinhao1.github.io**.

## License & attribution

Source code is released under the **Spatialfolio Non-Commercial Attribution License 1.0 (SNCA-1.0)** — see [LICENSE](LICENSE) and [NOTICE](NOTICE). Every page carries a visible footer credit to the [Spatialfolio template](https://github.com/zhuqinfeng1999/interactive-academic-portfolio); this attribution is required by the license and verified by `npm run validate`.
