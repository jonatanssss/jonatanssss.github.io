# Jonatan Manurung — Portfolio

A personal portfolio exploring physics, engineering, AI, research, and teaching.

**Website:** [jonatanssss.github.io](https://jonatanssss.github.io/) · **GitHub:** [@jonatanssss](https://github.com/jonatanssss)

## Overview

The site brings together selected academic projects, research and teaching experience, project case studies, and a printable résumé. The projects are learning work; their case studies explain scope and limitations.

Built with static HTML, CSS, JavaScript, and a small Node.js generator. No database, API keys, paid AI service, or runtime framework is required.

## Run locally

Install Node.js 24 or newer. No dependency installation is needed.

```sh
git clone https://github.com/jonatanssss/jonatanssss.github.io.git
cd jonatanssss.github.io
npm run dev
```

Open http://127.0.0.1:4173. The server rebuilds when data or public assets change. Refresh the browser after changes. Restart the server after editing the generator.

## Edit the website

| Change | File |
| --- | --- |
| Bio, experience, education, contact | `data/site.json` |
| Projects and case studies | `data/projects.json` |
| Page structure | `scripts/build.mjs` |
| Colors, layout, responsive styles, motion timing | `public/styles.css` |
| Navigation, entrances, copy-email behavior | `public/main.js` |
| Portrait | `public/assets/portrait.png` |

The portrait is a replaceable AI-edited placeholder based on my photograph. Project illustrations are conceptual artwork, not model outputs.

## Validate and publish

```sh
npm run build
npm run check
node --check public/main.js
```

Push changes to `main` to build and deploy through GitHub Actions. The workflow can also be started manually from Actions. Only generated `dist/` files are published; source files remain editable in this repository.

For another static host, upload the generated `dist/` directory. For hosting beneath a subpath, set `SITE_BASE_PATH` when building. The GitHub workflow obtains this automatically.

Optional: `npm run portable` creates a self-contained offline preview named `START-HERE.html`.

## Design and accessibility

Dark graphite, warm ivory, restrained tan accents, and an editorial layout. References include [Brittany Chiang](https://brittanychiang.com/), [Rauno Freiberg](https://rauno.me/), [Lee Robinson](https://leerob.com/), and [Josh Comeau](https://www.joshwcomeau.com/about-josh/).

Motion is brief and purpose-specific: 160–200 ms feedback, 240 ms menu entrance, 360 ms scroll reveals, and 400 ms hero entrance. Small-screen scroll content stays still. CSS and JavaScript respect reduced motion; content remains visible if scripts fail.

Desktop and 390px mobile layout, overflow, menu state, active-section navigation, and a project route were reviewed in-browser. Browser print pagination, clipboard permissions, and device-level reduced motion still need dedicated review.

See [HANDOFF.md](HANDOFF.md) to continue with another developer or AI assistant.
