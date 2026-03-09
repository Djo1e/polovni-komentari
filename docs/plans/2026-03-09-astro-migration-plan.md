# Astro Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Vite+React SPA landing page with an Astro static site so crawlers get full HTML content.

**Architecture:** 3 Astro pages with a shared Base layout. All components are `.astro` files (zero client JS except analytics). Tailwind CSS 4 via `@tailwindcss/vite`. Static output deployed on Vercel.

**Tech Stack:** Astro 5, Tailwind CSS 4, @vercel/analytics, lucide-react (icons only, used in .astro templates via direct SVG or kept as React islands)

**Reference:** Design doc at `docs/plans/2026-03-09-astro-migration-design.md`

---

### Task 1: Scaffold Astro project in landing/

Replace Vite+React config with Astro. Keep `public/` and `src/` content intact for now.

**Files:**
- Delete: `landing/vite.config.ts`
- Delete: `landing/src/main.tsx`, `landing/src/main.js`
- Delete: `landing/index.html`
- Modify: `landing/package.json`
- Create: `landing/astro.config.mjs`
- Modify: `landing/tsconfig.json`

**Step 1: Install Astro and remove Vite/React deps**

```bash
cd /Users/djordje/projects/polovni-comments/landing
npm install astro @astrojs/tailwind
npm uninstall @vitejs/plugin-react react react-dom @types/react @types/react-dom vite @tailwindcss/vite
npm install -D @tailwindcss/vite tailwindcss
```

Note: We keep `lucide-react` for now — we'll replace it with inline SVGs in the components or use `astro-icon`. Decide during Task 4.

Actually — simpler: uninstall everything, then install fresh:

```bash
cd /Users/djordje/projects/polovni-comments/landing
rm -rf node_modules package-lock.json
```

Then write the new `package.json`:

```json
{
  "name": "polovni-comments-landing",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@vercel/analytics": "^1.6.1",
    "astro": "^5.10.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.0",
    "tailwindcss": "^4.2.0"
  }
}
```

Then `npm install`.

**Step 2: Create astro.config.mjs**

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Step 3: Update tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

**Step 4: Delete old entry files**

```bash
rm landing/vite.config.ts landing/index.html
rm landing/src/main.tsx landing/src/main.js
rm landing/src/App.js landing/src/PrivacyPolicy.js landing/src/TermsOfService.js
```

Keep `App.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx` as reference — delete them after porting.

**Step 5: Create directory structure**

```bash
mkdir -p landing/src/layouts landing/src/pages landing/src/components landing/src/styles
mv landing/src/index.css landing/src/styles/global.css
```

**Step 6: Verify Astro runs**

Create a minimal `landing/src/pages/index.astro`:

```astro
---
---
<html>
  <head><title>Test</title></head>
  <body><h1>Astro works</h1></body>
</html>
```

Run: `cd landing && npm run dev`
Expected: Dev server starts, page shows "Astro works" at localhost:4321

**Step 7: Commit**

```bash
git add -A landing/
git commit -m "chore: scaffold Astro project, remove Vite+React config"
```

---

### Task 2: Create Base.astro layout

Shared layout with all `<head>` content: meta tags, OG, Twitter Card, structured data, fonts, favicons. Each page passes its own title, description, and canonical path as props.

**Files:**
- Create: `landing/src/layouts/Base.astro`
- Modify: `landing/src/styles/global.css` (no changes expected, just verify import works)

**Step 1: Write Base.astro**

```astro
---
interface Props {
  title: string;
  description: string;
  path: string;
  extraHead?: string;
}

const { title, description, path, extraHead } = Astro.props;
const canonical = `https://polovnikomentari.com${path}`;
---

<!doctype html>
<html lang="sr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta name="robots" content="index, follow" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content="https://polovnikomentari.com/og-image.png" />
    <meta property="og:locale" content="sr_RS" />
    <meta property="og:site_name" content="Polovni Komentari" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content="https://polovnikomentari.com/og-image.png" />

    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

    <!-- Structured Data: SoftwareApplication (all pages) -->
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Polovni Komentari",
      "description": "Chrome ekstenzija koja dodaje komentare, recenzije i iskustva na oglase za polovne automobile.",
      "url": "https://polovnikomentari.com",
      "applicationCategory": "BrowserExtension",
      "operatingSystem": "Chrome",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RSD" },
      "installUrl": "https://chromewebstore.google.com/detail/polovni-komentari/hjaehnglllmhjbbflknfpjofpnocmnkl",
      "inLanguage": "sr"
    })} />

    <Fragment set:html={extraHead ?? ""} />
  </head>
  <body>
    <slot />
    <script>
      import { inject, track } from "@vercel/analytics";
      inject();
      document.querySelectorAll<HTMLElement>("[data-track]").forEach((el) =>
        el.addEventListener("click", () => track(el.dataset.track!))
      );
    </script>
  </body>
</html>
```

**Step 2: Verify with a test page**

Update `landing/src/pages/index.astro`:

```astro
---
import Base from "../layouts/Base.astro";
---
<Base
  title="Polovni Komentari — Iskustva i komentari za polovne automobile"
  description="Besplatna Chrome ekstenzija za komentare na oglasima za polovne automobile."
  path="/"
>
  <h1>Layout works</h1>
</Base>
```

Run: `cd landing && npm run dev`
Expected: Page loads with full `<head>` content. View source shows all meta tags.

**Step 3: Commit**

```bash
git add landing/src/layouts/Base.astro landing/src/pages/index.astro
git commit -m "feat: add Base.astro layout with SEO meta tags"
```

---

### Task 3: Port global.css

The CSS file is already moved to `src/styles/global.css`. Import it from the layout.

**Files:**
- Modify: `landing/src/styles/global.css` (minor: add Astro-compatible import)
- Modify: `landing/src/layouts/Base.astro` (add import)

**Step 1: Verify global.css content**

The file should already contain:
```css
@import "tailwindcss";

@theme { ... }

body { ... }

@keyframes fade-up { ... }
.animate-fade-up { ... }
/* etc. */
```

No changes needed to the CSS itself.

**Step 2: Import in Base.astro**

Add to the frontmatter of `Base.astro`:

```astro
---
import "../styles/global.css";
// ... rest of frontmatter
---
```

**Step 3: Verify**

Run: `cd landing && npm run dev`
Expected: Page shows styled text with Outfit font and Tailwind classes working.

**Step 4: Commit**

```bash
git add landing/src/layouts/Base.astro landing/src/styles/global.css
git commit -m "feat: wire up global CSS and Tailwind in Astro layout"
```

---

### Task 4: Create ProductDemo.astro component

Convert the React `ProductDemo`, `Comment`, and `Reply` components to a single Astro component. Replace lucide-react icons with inline SVGs.

**Files:**
- Create: `landing/src/components/ProductDemo.astro`

**Reference:** `landing/src/App.tsx:32-117` for the original React components.

**Step 1: Write ProductDemo.astro**

The lucide icons used are: `User`, `ChevronUp`, `ChevronDown`. Extract their SVG paths from lucide (or copy from the rendered React output). These are simple icons:

```astro
---
// No props needed — this is a self-contained demo component
---

<!-- Comment component as a reusable fragment -->
<div class="w-full max-w-[975px] rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#e5e5e5]">
  <div class="relative w-[145%] -ml-[40%] lg:w-full lg:ml-0">
    <img
      src="/demo.webp"
      alt="Polovni Komentari na polovniautomobili.com"
      class="block w-full h-auto"
    />

    <div
      class="absolute bg-white overflow-hidden"
      style="left: 63.5%; top: 30%; right: 0.5%; bottom: 5%"
    >
      <div class="divide-y divide-gray-100">
        <!-- Comment 1 with reply -->
        <div class="px-2 py-1.5 comment-enter comment-enter-1">
          <div class="flex gap-1.5">
            <div class="mt-2 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg class="w-2 h-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[8px] font-medium text-gray-500 leading-[16px]">Golf123</span>
              <p class="text-[9px] text-gray-800 leading-snug">Deluje solidno za te pare.</p>
              <div class="flex items-center justify-between mt-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-[7px] text-gray-400">pre 2h</span>
                  <span class="text-[7px] text-gray-400">Odgovori</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-2.5 h-2.5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  <span class="text-[8px] font-semibold text-gray-600 w-2.5 text-center">5</span>
                  <svg class="w-2.5 h-2.5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
          <!-- Reply -->
          <div class="ml-5 mt-1 pl-1.5 border-l border-gray-100">
            <div class="flex gap-1">
              <div class="w-3 h-3 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <svg class="w-1.5 h-1.5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="flex-1">
                <span class="text-[7px] font-medium text-gray-500">Audi_BG</span>
                <p class="text-[8px] text-gray-800 leading-snug">Slažem se, proverio bih motor.</p>
                <div class="flex items-center justify-between mt-0.5">
                  <span class="text-[6px] text-gray-400">pre 1h</span>
                  <div class="flex items-center">
                    <svg class="w-2 h-2 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    <span class="text-[7px] font-semibold text-gray-600 w-2 text-center">2</span>
                    <svg class="w-2 h-2 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comment 2 -->
        <div class="px-2 py-1.5 comment-enter comment-enter-2">
          <div class="flex gap-1.5">
            <div class="mt-2 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg class="w-2 h-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[8px] font-medium text-gray-500 leading-[16px]">BMW_NS</span>
              <p class="text-[9px] text-gray-800 leading-snug">Kilometraža deluje sumnjivo...</p>
              <div class="flex items-center justify-between mt-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-[7px] text-gray-400">pre 45min</span>
                  <span class="text-[7px] text-gray-400">Odgovori</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-2.5 h-2.5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  <span class="text-[8px] font-semibold text-gray-600 w-2.5 text-center">8</span>
                  <svg class="w-2.5 h-2.5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comment 3 -->
        <div class="px-2 py-1.5 comment-enter comment-enter-3">
          <div class="flex gap-1.5">
            <div class="mt-2 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg class="w-2 h-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[8px] font-medium text-gray-500 leading-[16px]">Fiat_KG</span>
              <p class="text-[9px] text-gray-800 leading-snug">Za 2018. godište korektna cena.</p>
              <div class="flex items-center justify-between mt-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-[7px] text-gray-400">pre 30min</span>
                  <span class="text-[7px] text-gray-400">Odgovori</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-2.5 h-2.5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  <span class="text-[8px] font-semibold text-gray-600 w-2.5 text-center">3</span>
                  <svg class="w-2.5 h-2.5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add landing/src/components/ProductDemo.astro
git commit -m "feat: add ProductDemo Astro component with inline SVG icons"
```

---

### Task 5: Create SectionList.astro component

Reusable component for the privacy/terms pages that renders sections with titles, content paragraphs, and bullet lists.

**Files:**
- Create: `landing/src/components/SectionList.astro`

**Reference:** `landing/src/PrivacyPolicy.tsx:124-154` for the original React component.

**Step 1: Write SectionList.astro**

```astro
---
interface Section {
  title: string;
  content?: string;
  items?: readonly string[];
}

interface Props {
  data: readonly Section[];
}

const { data } = Astro.props;
---

<div class="space-y-8">
  {data.map((section) => (
    <div>
      <h2 class="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">
        {section.title}
      </h2>
      {section.content && (
        <p class="text-[#6b7280] text-sm leading-relaxed">
          {section.content}
        </p>
      )}
      {section.items && (
        <ul class="space-y-1.5">
          {section.items.map((item) => (
            <li class="text-[#6b7280] text-sm leading-relaxed flex gap-2">
              <span class="text-[#E5A100] shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add landing/src/components/SectionList.astro
git commit -m "feat: add SectionList Astro component for privacy/terms pages"
```

---

### Task 6: Create Footer.astro component

**Files:**
- Create: `landing/src/components/Footer.astro`

**Reference:** `landing/src/App.tsx:324-335`

**Step 1: Write Footer.astro**

```astro
---
// No props
---

<footer class="px-6 pb-5">
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-col sm:flex-row items-center justify-between text-[#6b7280] text-xs border-t border-[#e5e5e5] pt-4 gap-2">
      <span>&copy; 2026 Polovni Komentari &middot; <strong>Nezavisan projekat, nije povezan sa polovniautomobili.com ili Polovni automobili doo.</strong></span>
      <div class="flex gap-3">
        <a href="/terms" class="hover:text-[#1a1a1a] transition-colors">Uslovi korišćenja</a>
        <span class="text-[#d4d4d4]">·</span>
        <a href="/privacy" class="hover:text-[#1a1a1a] transition-colors">Politika privatnosti</a>
      </div>
    </div>
  </div>
</footer>
```

**Step 2: Commit**

```bash
git add landing/src/components/Footer.astro
git commit -m "feat: add Footer Astro component"
```

---

### Task 7: Create index.astro (home page)

Port the full home page from `App.tsx`. Uses Base layout, ProductDemo, and Footer components. Includes FAQPage structured data.

**Files:**
- Create: `landing/src/pages/index.astro` (replace placeholder)

**Reference:** `landing/src/App.tsx:119-338`

**Step 1: Write index.astro**

The FAQPage JSON-LD is passed via the `extraHead` prop to `Base.astro`.

```astro
---
import Base from "../layouts/Base.astro";
import ProductDemo from "../components/ProductDemo.astro";
import Footer from "../components/Footer.astro";

const CWS_URL = "https://chromewebstore.google.com/detail/polovni-komentari/hjaehnglllmhjbbflknfpjofpnocmnkl";

const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Šta su Polovni Komentari?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Polovni Komentari su besplatna Chrome ekstenzija koja dodaje komentare na oglase za polovne automobile. Pročitajte iskustva i recenzije drugih korisnika pre kupovine."
      }
    },
    {
      "@type": "Question",
      "name": "Kako da koristim komentare na oglasima za polovne automobile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Instalirajte Polovni Komentari ekstenziju, otvorite bilo koji oglas i kliknite na narandžasto dugme sa desne strane. Odmah možete da čitate komentare i ostavljate svoja iskustva."
      }
    },
    {
      "@type": "Question",
      "name": "Da li je potrebna registracija?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ne, komentarisanje je potpuno anonimno. Automatski dobijate nadimak koji možete promeniti."
      }
    },
    {
      "@type": "Question",
      "name": "Gde mogu da pročitam recenzije oglasa za polovne automobile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Instalirajte besplatnu Chrome ekstenziju Polovni Komentari i na svakom oglasu ćete videti komentare, ocene i iskustva drugih korisnika."
      }
    },
    {
      "@type": "Question",
      "name": "Kako mogu da podelim iskustva o polovnim automobilima?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pomoću Polovni Komentari ekstenzije možete da ostavite komentar na bilo koji oglas, glasate za korisne komentare drugih korisnika, i vodite diskusiju o ceni i stanju vozila."
      }
    }
  ]
});

const steps = [
  { number: "01", text: "Instaliraj ekstenziju" },
  { number: "02", text: "Otvori oglas" },
  { number: "03", text: "Ostavi komentar" },
];
---

<Base
  title="Polovni Komentari — Iskustva i komentari za polovne automobile"
  description="Besplatna Chrome ekstenzija za komentare na oglasima za polovne automobile. Pročitajte iskustva, recenzije i mišljenja drugih korisnika pre kupovine vozila."
  path="/"
  extraHead={`<script type="application/ld+json">${faqSchema}</script>`}
>
  <div class="min-h-screen bg-white flex flex-col">
    <div class="h-1 bg-[#E5A100]"></div>

    <!-- Hero -->
    <div class="flex items-center justify-center px-6 lg:px-10 py-12 lg:py-20">
      <div class="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div class="text-center lg:text-left animate-fade-up">
          <div class="mb-5">
            <img src="/icons/icon128.png" alt="" width="56" height="56" class="mx-auto lg:mx-0" />
          </div>

          <h1 class="font-[Outfit] font-900 text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.9] mb-4">
            <span class="text-[#1a1a1a]">Polovni</span>
            <br />
            <span class="text-[#E5A100]">Komentari</span>
          </h1>

          <p class="font-[Outfit] text-lg sm:text-xl text-[#6b7280] mb-8">
            Iskustva, recenzije i komentari za polovne automobile.
            <br />
            <span class="font-600 text-[#1a1a1a]">Pročitaj šta drugi misle pre kupovine.</span>
          </p>

          <a
            href={CWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="add_extension"
            class="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Preuzmi za Chrome
          </a>
        </div>

        <div class="flex flex-1 justify-center animate-fade-up-delay-2">
          <ProductDemo />
        </div>
      </div>
    </div>

    <!-- Steps -->
    <div class="px-6 py-8 bg-[#fafafa] border-y border-[#e5e5e5]">
      <div class="max-w-5xl mx-auto flex items-center justify-center gap-3 md:gap-5">
        {steps.map((step, i) => (
          <div class="flex items-center gap-3 md:gap-5">
            <div class="flex items-center gap-2">
              <span class="font-[Outfit] font-900 text-lg text-[#E5A100]">{step.number}</span>
              <span class="text-[#1a1a1a] text-xs md:text-sm font-[Outfit] font-500">{step.text}</span>
            </div>
            {i < steps.length - 1 && <span class="text-[#d4d4d4] text-sm">→</span>}
          </div>
        ))}
      </div>
    </div>

    <!-- Features -->
    <section class="px-6 py-16 lg:py-20">
      <div class="max-w-5xl mx-auto">
        <h2 class="font-[Outfit] font-800 text-3xl sm:text-4xl text-center text-[#1a1a1a] tracking-tight mb-4">
          Zašto koristiti Polovne Komentare?
        </h2>
        <p class="font-[Outfit] text-[#6b7280] text-center max-w-2xl mx-auto mb-12">
          Kupujete polovni automobil? Pre nego što kontaktirate prodavca, pogledajte iskustva i mišljenja drugih kupaca o oglasu.
        </p>

        <div class="grid sm:grid-cols-2 gap-6">
          <div class="feature-card bg-white rounded-lg p-6 pl-7">
            <svg class="w-6 h-6 text-[#E5A100] mb-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            <h3 class="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Komentari na svakom oglasu</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Ostavite komentar, podelite iskustvo ili upozorite druge kupce. Svaki oglas za polovni automobil dobija prostor za diskusiju.
            </p>
          </div>

          <div class="feature-card bg-white rounded-lg p-6 pl-7">
            <svg class="w-6 h-6 text-[#E5A100] mb-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
            <h3 class="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Recenzije u realnom vremenu</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Vidite šta drugi misle o ceni, stanju i opisu vozila. Komentari se prikazuju u realnom vremenu čim neko ostavi recenziju.
            </p>
          </div>

          <div class="feature-card bg-white rounded-lg p-6 pl-7">
            <svg class="w-6 h-6 text-[#E5A100] mb-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            <h3 class="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Glasanje za korisne komentare</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Najkorisnija iskustva i recenzije se ističu zahvaljujući glasovima zajednice. Glasajte za komentare koji vam pomažu.
            </p>
          </div>

          <div class="feature-card bg-white rounded-lg p-6 pl-7">
            <svg class="w-6 h-6 text-[#E5A100] mb-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            <h3 class="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">Anonimno i besplatno</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Nije potrebna registracija. Komentarišite slobodno bez brige o privatnosti — ne prikupljamo lične podatke.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="px-6 py-16 lg:py-20 bg-[#fafafa] border-y border-[#e5e5e5]">
      <div class="max-w-3xl mx-auto">
        <h2 class="font-[Outfit] font-800 text-3xl sm:text-4xl text-center text-[#1a1a1a] tracking-tight mb-12">
          Česta pitanja
        </h2>

        <div class="space-y-6">
          <div>
            <h3 class="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Šta su Polovni Komentari?</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Polovni Komentari su besplatna Chrome ekstenzija koja dodaje komentare na oglase za polovne automobile. Pročitajte iskustva i recenzije drugih korisnika pre kupovine.
            </p>
          </div>

          <div>
            <h3 class="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Kako da koristim komentare na oglasima za polovne automobile?</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Instalirajte ekstenziju, otvorite bilo koji oglas i kliknite na narandžasto dugme sa desne strane ekrana. Odmah možete da čitate komentare i ostavljate svoja iskustva.
            </p>
          </div>

          <div>
            <h3 class="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Da li je potrebna registracija?</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Ne, komentarisanje je potpuno anonimno. Automatski dobijate nadimak koji možete promeniti. Nije potrebna ni email adresa ni bilo kakva registracija.
            </p>
          </div>

          <div>
            <h3 class="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Gde mogu da pročitam recenzije oglasa za polovne automobile?</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Instalirajte besplatnu Chrome ekstenziju Polovni Komentari i na svakom oglasu ćete videti komentare, ocene i iskustva drugih korisnika koji su pregledali isti oglas.
            </p>
          </div>

          <div>
            <h3 class="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Kako mogu da podelim iskustva o polovnim automobilima?</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Pomoću ekstenzije možete da ostavite komentar na bilo koji oglas, glasate za korisne komentare drugih korisnika, i vodite diskusiju o ceni i stanju vozila.
            </p>
          </div>

          <div>
            <h3 class="font-[Outfit] font-700 text-[#1a1a1a] mb-1">Da li je ova ekstenzija povezana sa sajtom za polovne automobile?</h3>
            <p class="text-sm text-[#6b7280] leading-relaxed">
              Ne. Polovni Komentari su potpuno nezavisan projekat. Nisu povezani sa, podržani od strane, niti odobreni od strane bilo kog sajta za oglašavanje vozila.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 py-16 text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="font-[Outfit] font-800 text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight mb-4">
          Proveri šta drugi kažu pre kupovine
        </h2>
        <p class="font-[Outfit] text-[#6b7280] mb-8">
          Instalirajte ekstenziju i odmah čitajte komentare, iskustva i recenzije na oglasima za polovne automobile.
        </p>
        <a
          href={CWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-track="add_extension"
          class="btn-cta inline-flex items-center gap-2.5 bg-[#E5A100] text-white font-[Outfit] font-700 text-base sm:text-lg px-7 py-3.5 rounded-lg"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Preuzmi za Chrome
        </a>
      </div>
    </section>

    <Footer />
  </div>
</Base>
```

**Step 2: Verify dev server**

Run: `cd landing && npm run dev`
Expected: Home page renders identically to the current Vite version. View source shows full HTML content.

**Step 3: Commit**

```bash
git add landing/src/pages/index.astro
git commit -m "feat: port home page to Astro with full static HTML"
```

---

### Task 8: Create privacy.astro and terms.astro

Port the privacy policy and terms of service pages using the SectionList component and Base layout.

**Files:**
- Create: `landing/src/pages/privacy.astro`
- Create: `landing/src/pages/terms.astro`

**Reference:** `landing/src/PrivacyPolicy.tsx` and `landing/src/TermsOfService.tsx`

**Step 1: Write privacy.astro**

Copy the `sections` and `sectionsEn` data arrays from `PrivacyPolicy.tsx` into the frontmatter.

```astro
---
import Base from "../layouts/Base.astro";
import SectionList from "../components/SectionList.astro";

const sections = [
  {
    title: "O ekstenziji",
    content: "Polovni Komentari su nezavisan projekat i nisu povezani sa, podržani od strane, niti odobreni od strane polovniautomobili.com ili Polovni automobili doo.",
  },
  {
    title: "Šta radi ova ekstenzija",
    content: "Polovni Komentari dodaje sekciju za komentare na stranice oglasa na polovniautomobili.com. Korisnici mogu da ostavljaju komentare, odgovaraju drugima i glasaju za komentare. Ekstenzija takođe omogućava proveru statusa uvoza vozila preko javne ABS baze.",
  },
  {
    title: "Podaci koje prikupljamo",
    items: [
      "Anonimni identifikator — nasumično generisan ID koji se čuva u lokalnoj memoriji vašeg pregledača. Nije povezan sa vašim stvarnim identitetom.",
      "Nadimak — automatski generisan (npr. \"Golf123\") ili po vašem izboru. Čuva se u lokalnoj memoriji pregledača.",
      "Komentari i glasovi — tekst koji postavljate i glasovi koje dajete se šalju na naš server i vidljivi su svim korisnicima ekstenzije.",
      "Rezultati provere VIN broja — kada koristite opciju provere broja šasije, VIN se šalje na abs.gov.rs (javni servis Agencije za bezbednost saobraćaja). Rezultat se čuva na našem serveru kako bi naredne provere istog VIN-a bile trenutne.",
      "Anonimna analitika korišćenja — prikupljamo anonimne podatke o tome kako koristite ekstenziju (npr. otvaranje panela, postavljanje komentara, glasanje) putem Google Analytics-a. Ovi podaci ne sadrže lične informacije i koriste se isključivo za unapređenje ekstenzije.",
    ],
  },
  {
    title: "Podaci koje NE prikupljamo",
    items: [
      "Nikakve lične podatke (ime, email, telefon, itd.)",
      "Istoriju pretraživanja",
      "Sadržaj stranica sa polovniautomobili.com",
      "Kolačiće ili piksele za praćenje",
    ],
  },
  {
    title: "Gde se podaci čuvaju",
    items: [
      "Lokalni podaci (anonimni ID, nadimak, podešavanja) se čuvaju u vašem pregledaču koristeći localStorage na domenu polovniautomobili.com.",
      "Komentari i glasovi se čuvaju na Convex (convex.dev), cloud bazi podataka.",
    ],
  },
  {
    title: "Dozvole",
    content: "Ova ekstenzija zahteva pristup sajtu abs.gov.rs za funkciju provere broja šasije, pristup sajtu google-analytics.com za slanje anonimne analitike, i dozvolu za skladištenje podataka (storage) za čuvanje ID-a sesije analitike.",
  },
  {
    title: "Servisi trećih strana",
    content: "Koristimo Convex (convex.dev) za čuvanje i prikazivanje komentara, glasova i keširanih rezultata provere VIN-a. Politika privatnosti Convex-a se odnosi na podatke koji se čuvaju na njihovim serverima. Funkcija provere VIN-a koristi abs.gov.rs, javni servis Agencije za bezbednost saobraćaja. Zahtev se šalje samo kada korisnik klikne na dugme za proveru. Koristimo Google Analytics 4 za prikupljanje anonimne statistike korišćenja. Politika privatnosti Google-a se odnosi na te podatke.",
  },
  {
    title: "Brisanje podataka",
    items: [
      "Da biste obrisali lokalne podatke, obrišite podatke sajta za polovniautomobili.com u podešavanjima pregledača.",
      "Komentari i glasovi su javni i trenutno ih korisnici ne mogu sami obrisati. Kontaktirajte nas ako želite da uklonite komentar.",
    ],
  },
  {
    title: "Čuvanje podataka",
    content: "Komentari i glasovi se čuvaju neograničeno osim ako se ne zatraži brisanje. Osnovni podaci o oglasu (naslov, cena, URL slike) se čuvaju kako bi se prikazali u fidu najnovijih komentara. Ovi podaci su javno dostupni na polovniautomobili.com.",
  },
];

const sectionsEn = [
  {
    title: "About this extension",
    content: "Polovni Komentari is an independent project and is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.",
  },
  {
    title: "What this extension does",
    content: "Polovni Komentari adds a community comment section to car listing pages on polovniautomobili.com. Users can post comments, reply to others, and vote on comments. The extension also allows users to check vehicle import status via the public VIN lookup provided by Serbia's Agency for Traffic Safety (ABS).",
  },
  {
    title: "Data we collect",
    items: [
      "Anonymous identifier — a randomly generated ID stored in your browser's local storage. Not linked to your real identity.",
      "Username — either auto-generated (e.g. \"Golf123\") or chosen by you. Stored in your browser's local storage.",
      "Comments and votes — text you post and votes you cast are sent to our server and visible to all users of the extension.",
      "VIN check results — when you use the VIN check feature, the chassis number (VIN) from the listing is sent to abs.gov.rs (a public government service) to check vehicle import status. The result is cached on our server so that subsequent checks for the same VIN load instantly.",
      "Anonymous usage analytics — we collect anonymous data about how you use the extension (e.g. opening the panel, posting comments, voting) via Google Analytics. This data contains no personal information and is used solely to improve the extension.",
    ],
  },
  {
    title: "Data we do NOT collect",
    items: [
      "No personal information (name, email, phone, etc.)",
      "No browsing history",
      "No page content from polovniautomobili.com",
      "No cookies or tracking pixels",
    ],
  },
  {
    title: "Where data is stored",
    items: [
      "Local data (anonymous ID, username, preferences) is stored in your browser using localStorage on the polovniautomobili.com domain.",
      "Comments and votes are stored on Convex (convex.dev), a cloud database service.",
    ],
  },
  {
    title: "Permissions",
    content: "This extension requests host access to abs.gov.rs for the VIN check feature, access to google-analytics.com for sending anonymous analytics, and the storage permission for persisting analytics session IDs.",
  },
  {
    title: "Third-party services",
    content: "We use Convex (convex.dev) to store and serve comments, votes, and cached VIN check results. Convex's privacy policy applies to data stored on their servers. The VIN check feature queries abs.gov.rs, a public service of Serbia's Agency for Traffic Safety. This request is only made when the user clicks the check button. We use Google Analytics 4 to collect anonymous usage statistics. Google's privacy policy applies to that data.",
  },
  {
    title: "Data deletion",
    items: [
      "To delete your local data, clear your browser's site data for polovniautomobili.com.",
      "Comments and votes are public and cannot currently be deleted by users. Contact us if you need a comment removed.",
    ],
  },
  {
    title: "Data retention",
    content: "Comments and votes are retained indefinitely unless deletion is requested. Basic listing data (title, price, image URL) is stored to display in the latest comments feed. This data is publicly available on polovniautomobili.com.",
  },
];
---

<Base
  title="Politika privatnosti — Polovni Komentari"
  description="Politika privatnosti Chrome ekstenzije Polovni Komentari. Saznajte koje podatke prikupljamo i kako ih koristimo."
  path="/privacy"
>
  <div class="min-h-screen bg-white">
    <div class="h-1 bg-[#E5A100]"></div>

    <div class="max-w-2xl mx-auto px-6 py-12">
      <a href="/" class="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors text-sm mb-8">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Nazad
      </a>

      <h1 class="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">Politika privatnosti</h1>
      <p class="text-[#6b7280] text-sm mb-10">Poslednje ažuriranje: 6. mart 2026.</p>

      <SectionList data={sections} />

      <div class="mt-16 pt-8 border-t border-[#e5e5e5]">
        <h1 class="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">Privacy Policy</h1>
        <p class="text-[#6b7280] text-sm mb-10">Last updated: March 6, 2026</p>

        <SectionList data={sectionsEn} />
      </div>

      <div class="mt-12 pt-6 border-t border-[#e5e5e5] text-[#6b7280] text-xs">
        &copy; 2026 Polovni Komentari
      </div>
    </div>
  </div>
</Base>
```

**Step 2: Write terms.astro**

Same pattern — copy `sections` and `sectionsEn` from `TermsOfService.tsx`.

```astro
---
import Base from "../layouts/Base.astro";
import SectionList from "../components/SectionList.astro";

const sections = [
  {
    title: "O servisu",
    content: "Polovni Komentari su nezavisan projekat koji dodaje komentare na stranice oglasa na polovniautomobili.com. Nisu povezani sa, podržani od strane, niti odobreni od strane polovniautomobili.com ili Polovni automobili doo.",
  },
  {
    title: "Korisnički sadržaj",
    items: [
      "Korisnici su odgovorni za sadržaj koji postavljaju.",
      "Zabranjeni su: govor mržnje, spam, nezakonit sadržaj, lični napadi i deljenje ličnih podataka drugih lica.",
      "Zadržavamo pravo da uklonimo bilo koji komentar bez prethodnog obaveštenja.",
    ],
  },
  {
    title: "Odricanje od odgovornosti",
    items: [
      "Servis se pruža \"kakav jeste\" bez ikakvih garancija.",
      "Ne garantujemo dostupnost, tačnost ili pouzdanost servisa.",
      "Servis može biti izmenjen ili ukinut u bilo kom trenutku bez prethodnog obaveštenja.",
    ],
  },
  {
    title: "Ograničenje odgovornosti",
    content: "Ni u kom slučaju nećemo biti odgovorni za bilo kakvu direktnu, indirektnu, slučajnu ili posledičnu štetu nastalu korišćenjem ovog servisa.",
  },
  {
    title: "Privatnost",
    content: "Korišćenjem servisa prihvatate našu Politiku privatnosti. Za više informacija posetite stranicu /privacy.",
  },
  {
    title: "Merodavno pravo",
    content: "Na ove Uslove korišćenja primenjuje se pravo Republike Srbije.",
  },
];

const sectionsEn = [
  {
    title: "About the service",
    content: "Polovni Komentari is an independent project that adds comments to listing pages on polovniautomobili.com. It is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.",
  },
  {
    title: "User content",
    items: [
      "Users are responsible for the content they post.",
      "Prohibited: hate speech, spam, illegal content, personal attacks, and sharing personal information of others.",
      "We reserve the right to remove any comment without prior notice.",
    ],
  },
  {
    title: "Disclaimer of warranties",
    items: [
      "The service is provided \"as is\" without any warranties.",
      "We do not guarantee availability, accuracy, or reliability of the service.",
      "The service may be modified or discontinued at any time without prior notice.",
    ],
  },
  {
    title: "Limitation of liability",
    content: "In no event shall we be liable for any direct, indirect, incidental, or consequential damages arising from the use of this service.",
  },
  {
    title: "Privacy",
    content: "By using the service you accept our Privacy Policy. For more information visit /privacy.",
  },
  {
    title: "Governing law",
    content: "These Terms of Service are governed by the laws of the Republic of Serbia.",
  },
];
---

<Base
  title="Uslovi korišćenja — Polovni Komentari"
  description="Uslovi korišćenja Chrome ekstenzije Polovni Komentari."
  path="/terms"
>
  <div class="min-h-screen bg-white">
    <div class="h-1 bg-[#E5A100]"></div>

    <div class="max-w-2xl mx-auto px-6 py-12">
      <a href="/" class="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors text-sm mb-8">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Nazad
      </a>

      <h1 class="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">Uslovi korišćenja</h1>
      <p class="text-[#6b7280] text-sm mb-10">Poslednje ažuriranje: 27. februar 2026.</p>

      <SectionList data={sections} />

      <div class="mt-16 pt-8 border-t border-[#e5e5e5]">
        <h1 class="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">Terms of Service</h1>
        <p class="text-[#6b7280] text-sm mb-10">Last updated: February 27, 2026</p>

        <SectionList data={sectionsEn} />
      </div>

      <div class="mt-12 pt-6 border-t border-[#e5e5e5] text-[#6b7280] text-xs">
        &copy; 2026 Polovni Komentari
      </div>
    </div>
  </div>
</Base>
```

**Step 3: Verify all three pages**

Run: `cd landing && npm run dev`
- Visit `/` — home page with all sections
- Visit `/privacy` — full privacy policy
- Visit `/terms` — full terms of service
- View source on each — all content visible in HTML

**Step 4: Commit**

```bash
git add landing/src/pages/privacy.astro landing/src/pages/terms.astro
git commit -m "feat: port privacy and terms pages to Astro"
```

---

### Task 9: Update vercel.json and clean up

Remove rewrites (Astro handles routing), keep www redirect. Delete old React source files.

**Files:**
- Modify: `landing/vercel.json`
- Delete: `landing/src/App.tsx`, `landing/src/PrivacyPolicy.tsx`, `landing/src/TermsOfService.tsx`

**Step 1: Update vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "redirects": [
    {
      "source": "/:path(.*)",
      "has": [{ "type": "host", "value": "www.polovnikomentari.com" }],
      "destination": "https://polovnikomentari.com/:path",
      "permanent": true
    }
  ]
}
```

**Step 2: Delete old React files**

```bash
rm landing/src/App.tsx landing/src/PrivacyPolicy.tsx landing/src/TermsOfService.tsx
```

**Step 3: Verify build**

```bash
cd landing && npm run build
```

Expected: Build succeeds, `dist/` contains:
- `index.html` — full home page HTML
- `privacy/index.html` — full privacy page HTML
- `terms/index.html` — full terms page HTML

Verify HTML content:
```bash
head -50 landing/dist/index.html
```
Expected: Full HTML with meta tags and body content (not just `<div id="root">`).

**Step 4: Commit**

```bash
git add -A landing/
git commit -m "chore: clean up old React files, simplify vercel.json"
```

---

### Task 10: Final verification

Run the production build and preview it. Verify all pages, links, and view-source.

**Step 1: Build and preview**

```bash
cd landing && npm run build && npm run preview
```

**Step 2: Check each page**

- `http://localhost:4321/` — home page loads, animations work, CTA links to Chrome Web Store
- `http://localhost:4321/privacy` — privacy policy loads, back link works
- `http://localhost:4321/terms` — terms load, back link works
- View source on each page — full HTML content visible (the whole point of this migration)

**Step 3: Check meta tags in source**

Each page should have:
- Correct `<title>`
- Correct `<meta name="description">`
- Correct `<link rel="canonical">`
- OG and Twitter Card tags
- Structured data JSON-LD

**Step 4: Commit final state**

```bash
git add -A landing/
git commit -m "feat: complete Astro migration — all pages render as static HTML"
```
