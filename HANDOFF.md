# Development handoff

## Architecture

This is a dependency-free static website. `scripts/build.mjs` reads JSON in `data/`, generates five HTML pages, and copies `public/` assets to `dist/`. GitHub Actions builds and publishes `dist/`. Editing requires no access to the AI system that originally helped create it.

## Content

Keep website copy in English. Preserve the owner's name, approved visual direction, and factual project scope. Academic prototypes must not be described as production systems or clinically validated tools. Do not invent performance metrics, credentials, granted patents, or research outcomes. Research interests should remain broad across physics, engineering, and AI.

The portrait is a replaceable AI-edited placeholder. Preserve identity if editing it. Project illustrations are conceptual.

## Workflow

1. Read the repository and inspect the relevant source before editing.
2. For a focused change, create a branch and make the smallest useful edit.
3. Run `npm run build`, `npm run check`, and `node --check public/main.js`.
4. For visual or interaction changes, review desktop and mobile widths, keyboard navigation, and reduced motion.
5. Open a pull request for review. Merging into `main` publishes automatically.
6. Check the Pages deployment in GitHub Actions and visit the live URL.

Do not edit generated output. Do not add a database, framework, animation library, external font service, or secret unless a concrete feature requires it.

## Motion

Timing tokens live in `public/styles.css` and are read by `public/main.js`. Keep motion short, reveal once, and leave text readable. Preserve focus, reduced-motion, and print cancellation. No scroll-jacking or perpetual decorative animation.
