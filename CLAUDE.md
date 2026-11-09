# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # serve the site at http://localhost:8080 (static, no build step)
npm test       # node --test tests/*.test.mjs
```

There is no bundler, TypeScript, or lint step. The site deploys to Vercel (telluscoop.org) as static files plus one serverless function.

## The site

### 1. Public marketing site (`index.html`)

A no-bundler browser prototype. React 18 and Babel are loaded from CDN; JSX files are transpiled in-browser at runtime.

**Module system: none.** Shared components are attached to `window`:

```js
// tweaks-panel.jsx → Object.assign(window, { useTweaks, TweaksPanel, TweakColor, ... })
// foundation.jsx   → window.FoundationSystem
// i18n.js          → window.LANG_TRANSLATIONS (en/es dictionaries)
```

| File | Purpose |
|---|---|
| `index.html` | Entry point. Mounts the app, holds `TWEAK_DEFAULTS` |
| `foundation.jsx` | All page sections as one `FoundationSystem` component |
| `tweaks-panel.jsx` | Design-tweaks shell and form controls |
| `i18n.js` | English/Spanish translation dictionaries |
| `tokens.css` / `styles/tokens.css` | Design tokens (CSS custom properties) |
| `foundation.css` | Component styles for `foundation.jsx` |
| `image-slot.js` | `<image-slot>` custom element for drag-and-drop image fills |
| `brand.html` | Brand guidelines page, served at `/brand` via `vercel.json` rewrite |
| `stellar/index.html` | Redirect to demo.stellarpassport.xyz |
| `api/subscribe.js` | Vercel serverless function — Beehiiv newsletter signup |

**Design tokens**: three live-tweakable palette colors — `--sand` `#ECE0CC` (background), `--teal` `#3F8487` (primary), `--clay` `#C75A2A` (accent). Set on `<html>` by the `App` component's `useEffect`. The `TWEAK_DEFAULTS` object in `index.html` is delimited by `/*EDITMODE-BEGIN*/` … `/*EDITMODE-END*/` — the omelette design host rewrites that block on disk when tweaks are saved.

**Scroll animations**: `Reveal` wraps `useReveal` (IntersectionObserver) — `<Reveal delay={N}>` fades+slides children in on scroll (ms). `useCountUp(target, run)` drives stat counters, started by `useReveal`'s `shown` boolean.

**image-slot**: `<image-slot id="…" shape="rect|circle|rounded|pill" placeholder="…">` persists dropped images via a `.image-slots.state.json` sidecar at the project root — the write only works inside the omelette runtime; elsewhere slots are read-only display.

**Fonts**: Fraunces (`--serif`), Inter (`--sans`), JetBrains Mono (`--mono`), from Google Fonts.

### 2. Policy pages and tools

- `policies/` — static Código de Conducta and Embajadores Stellar Chile pages (ES at `/code-of-conduct`, `/programs/stellar-chile/ambassadors`; EN under `/en/...`). Shared `policy.css`/`policy.js`; the footer is identical across pages of the same language. Tests: `tests/policies.test.mjs`.
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
