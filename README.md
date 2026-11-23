# Modularix website

Prefabricated modular data centers. Next.js (App Router) + TypeScript, with the scroll-driven 3D container built in three.js and GSAP.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, hot reload
npm run build && npm start   # production build
```

Requires Node 20.9 or newer.

## Pages

| Route        | What it is                                                         |
| ------------ | ------------------------------------------------------------------ |
| `/`          | Module explorer: 3D container story, configurations, site, scale, proof, contact |
| `/journey`   | Scroll film: factory to port to pad                                |
| `/configure` | Links out to the Legacy container configurator                     |
| `/company`   | Synotech background and Uptime Institute certifications            |

## Where things live

- `src/data/site.ts`: email, URLs, nav, certifications, configuration cards. Edit content here first.
- `src/components/`: header, footer, and one component per home section (`home/`).
- `src/scenes/legacy3d.js`: the parametric container model (shared by both scenes).
- `src/scenes/home-scene.js`, `journey-scene.js`: scroll timelines. They are client-only and started by `SceneBoot`.
- `src/styles/`: `home.css`, `journey.css`, `sub.css`. Each is scoped to a wrapper class (`.home`, `.journey`, `.sub`), so pages do not leak styles into each other.
- `src/app/globals.css`: design tokens (colors, fonts, gutters) and base.
- `public/assets/`: photos, logo textures. `logo-dark.svg` is the vector logo used on the blue container.

## Notes

- The container colour and the small corner logo are set in `home-scene.js` (`Scfg = { color: 'blue', smallLogo: true, ... }`). Colours are defined in `legacy3d.js` (`COLORS`).
- `SITE.url` in `src/data/site.ts` is a placeholder. Set the real domain before launch (used by the sitemap and metadata).
- three.js is pinned to `0.128.0` because the scene code uses APIs removed in later versions.
- `reactStrictMode` is off in `next.config.mjs` so the WebGL scenes do not double-mount in dev.
