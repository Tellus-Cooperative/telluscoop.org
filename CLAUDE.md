# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # serve the site at http://localhost:8080 (static; serve.json mirrors vercel.json rewrites)
npm run build:home  # esbuild: home-main.jsx + foundation.jsx → dist/home.js (output is committed)
npm test       # node --test tests/*.test.mjs
```

No TypeScript or lint step. The site deploys to Vercel (telluscoop.org) as static files plus serverless functions in `api/`. Vercel runs no build (do NOT add a `build` script — Vercel would run it and then fail looking for a `public/` output dir): always run `npm run build:home` and commit `dist/home.js` after touching `foundation.jsx`, `home-main.jsx` or `i18n.js`.

## The site

Source of truth for the design: Figma file `XRqSz2oG6K622fa44wG8Gl`. Only two font families (Fraunces 400/italic, Inter 400/500/600), no text under 14px, accent (`--accent`) only on clickable elements, one primary button per view, official assets only (never redraw logos/mascots, no AI images).

### Shared shell (`shared/`) — used by every page except `/hub`

| File | Purpose |
|---|---|
| `shared/tokens.css` | Primitives, 5 section themes via `data-section-theme="claro\|teal\|naranjo\|cielo\|verde"`, spacing, radii, text styles |
| `shared/site.css` / `shared/site.js` | Plain-JS shell: nav (main + policy variants), footer, city ribbon, final CTA, Join modal |
| `shared/img/` | Official assets exported from Figma (map, mascots WebP 1x/2x, social icons, logos, allies) |

Static pages include the shell with placeholders: `<div data-tellus="nav" data-variant="main|policy" data-lang="es|en" data-alt-href="…">`, `<div data-tellus="ribbon|cta" data-section-theme="…">`, `<div data-tellus="footer" data-lang="…">`, plus `<script src="/shared/site.js">`. `[data-join]` opens the Join modal (Beehiiv via `api/subscribe.js`). `window.TellusShell` exposes `mount`, `openJoin`, `setLang`.

### 1. Home (`index.html`)

React 18 (UMD from CDN) + `dist/home.js` compiled from `home-main.jsx`/`foundation.jsx`. No Babel in the browser, no Tweaks panel. `i18n.js` holds en/es/pt copy. `foundation.css` holds Home-only styles. Articles come from `api/articles.js` (server-side Beehiiv RSS, cached) with static fallbacks — never use public CORS proxies.

| File | Purpose |
|---|---|
| `brand.html` + `brand.css` | Brand guidelines at `/brand` |
| `resources/` | Directory (`index.html`, `resources.js/css`, `tools.json`) and tool profile (`tool.html`, `tool.js`); counts are computed from `tools.json` |
| `api/subscribe.js` | Beehiiv newsletter signup |
| `api/articles.js` | Beehiiv RSS → JSON |
| `api/tool-page.js` | Serves `/resources/tools/:slug` with per-slug meta injected between `<!--TOOL_META-->` markers |
| `api/og-tool.js` | Per-tool OG PNG (`/og/tools/:slug.png`, satori + resvg) |
| `og/` | Static OG images (1200×630) per page |
| `sitemap.xml`, `robots.txt`, `404.html` | SEO + custom 404 (hub keeps its own) |
| `stellar/index.html` | Redirect to demo.stellarpassport.xyz |

`theme.js`/`theme.css` (old dark mode) are kept only because `hub/`, `merch/` and `tools/fear-greed` still load them. Never touch `hub/`, `hub.html` or `uploads/OPENGRAPH.jpg` (used by the hub).

### 2. Policy pages and tools

- `policies/` — static Código de Conducta and Embajadores Stellar Chile pages (ES at `/code-of-conduct`, `/programs/stellar-chile/ambassadors`; EN under `/en/...`). Shared `policy.css`/`policy.js` plus the `shared/` shell; ES/EN linked with `hreflang`. Tests: `tests/policies.test.mjs`.
- `tools/qr-generator/` — standalone public QR generator served at `/tools/qr-generator` (no backend, no login). Tests: `tests/qr-generator.test.mjs`.
- `tools/fear-greed/` — Fear & Greed tool at `/tools/fear-greed`.
- The former `/ops/*` dashboards and `/tierly` were removed from the site; Tierly lives at tirly.xyz.

### Supabase backend (`supabase/`)

- `migrations/` — timestamped SQL migrations for the Stellar Ops schema (RLS on every exposed table, org-scoped membership, role-restricted finance writes).
- `functions/first-access/` — Edge Function for one-time-code first login of master admins.
- `functions/luma-events/` — Edge Function proxying the Luma calendar API; keeps `LUMA_API_KEY` server-side (Supabase secret) and returns only event metadata + aggregate counts.
- Project ref: `rhzanxzoqmbxptvxgnfj`.

## Secrets

- Never put a Supabase service-role key or the Luma API key in frontend code, `config.js`, `.env.local`, or Git. `LUMA_API_KEY` lives only in Supabase Edge Function secrets.
