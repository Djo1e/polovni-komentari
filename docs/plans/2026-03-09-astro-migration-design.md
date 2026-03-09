# Astro Migration Design

## Problem

The landing page is a Vite+React SPA. Crawlers see an empty `<div id="root"></div>` — all content renders client-side after JS executes. Google can't index the body content.

## Solution

Migrate to Astro static site generator. Astro outputs pure HTML at build time — crawlers get full content with zero JS required.

## Architecture

```
landing/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/                    ← unchanged (icons, demo.webp, og-image, favicons, robots.txt, sitemap.xml)
├── src/
│   ├── layouts/
│   │   └── Base.astro         ← shared <html><head> with meta/OG/structured data
│   ├── pages/
│   │   ├── index.astro        ← home page
│   │   ├── privacy.astro      ← privacy policy
│   │   └── terms.astro        ← terms of service
│   ├── components/
│   │   ├── ProductDemo.astro  ← comment overlay demo (pure HTML/CSS)
│   │   ├── SectionList.astro  ← reusable section renderer for privacy/terms
│   │   └── Footer.astro       ← shared footer
│   └── styles/
│       └── global.css         ← existing CSS animations, mostly unchanged
```

## Key Decisions

### No React dependency

All components convert to `.astro` files. Nothing needs client-side interactivity:
- CSS animations (fade-up, comment-enter, feature-card hover) work natively
- Analytics click tracking uses inline `<script>`

### Per-page `<head>` via layout props

`Base.astro` layout accepts props for title, description, canonical path, and optional structured data. Each page passes its own values — no more `useCanonical()` hook.

### Structured data

JSON-LD blocks move into `Base.astro`. The FAQPage schema is passed as a prop only from `index.astro`.

### Vercel Analytics

Use `@vercel/analytics` as a `<script>` tag or the Astro Vercel integration. CTA click tracking becomes:
```html
<script>
import { track } from "@vercel/analytics";
document.querySelectorAll("[data-track]").forEach(el =>
  el.addEventListener("click", () => track(el.dataset.track))
);
</script>
```

### Simplified vercel.json

No more rewrites — Astro generates `/privacy/index.html` and `/terms/index.html` natively. Only the www redirect remains.

### Tailwind CSS 4

Stays as-is via `@tailwindcss/vite` — Astro uses Vite under the hood.

## What stays the same

- All static assets in `public/`
- Tailwind CSS 4 styling
- All visual design, animations, content — pixel-identical output
- Vercel deployment
- Domain config and www redirect

## What gets removed

- `main.tsx` entry point
- `react`, `react-dom`, `@vitejs/plugin-react` dependencies
- `useCanonical()` hook
- Client-side routing via `window.location.pathname`
- `vercel.json` rewrites for `/privacy` and `/terms`

## Migration strategy

Convert existing React components to Astro template syntax. The content and class names are identical — only the JSX → Astro template syntax changes (e.g., `className` → `class`, remove `{}` around string props, convert `.map()` to Astro `{items.map()}` blocks).
