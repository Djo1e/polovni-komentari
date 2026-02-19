# Landing Page Design — Polovni Automobili Comments

**Date:** 2026-02-19

## Monorepo restructure

```
polovni-komentari/
  extension/    ← current project files moved here
  landing/      ← new Vite + React + Tailwind project
```

Two independent projects, each with own `package.json` and build.

## Landing page

Single page, Serbian language, deployed to Vercel as static site.

### Tech stack
- Vite + React + Tailwind 4 (same versions as extension)
- Single `App.tsx` component, no routing
- `vite build` → `dist/` for Vercel

### Sections

1. **Hero** — Extension name, tagline ("Komentari na svakom oglasu na Polovnim"), orange Chrome Web Store download button, extension icon or screenshot.

2. **Features** — 3-4 cards:
   - Komentariši oglase
   - Odgovori i glasaj
   - Anonimno korišćenje (no account needed)
   - Komentari u realnom vremenu

3. **How it works** — 3 steps: Instaliraj → Otvori oglas → Komentariši

4. **Footer** — Privacy policy link, GitHub link

### Visual style
- Dark background
- Orange accent color (matching polovniautomobili.com brand)
- Clean, modern typography
- Responsive (mobile + desktop)

### Chrome Web Store link
Placeholder URL until extension is published.
