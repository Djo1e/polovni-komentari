# Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the repo into a monorepo with `extension/` and `landing/`, then build a single-page Serbian landing page for the Chrome extension.

**Architecture:** Two independent projects under one repo. The extension moves into `extension/` untouched. The landing page is a new Vite + React + Tailwind 4 project in `landing/` — single `App.tsx`, no routing, deployed to Vercel as static files.

**Tech Stack:** Vite 6, React 18, Tailwind CSS 4, TypeScript

---

### Task 1: Create the monorepo directory structure

**Files:**
- Create: `extension/` (directory)
- Create: `landing/` (directory)

**Step 1: Create the parent directories**

```bash
mkdir -p extension landing
```

**Step 2: Commit empty structure**

No commit yet — we'll commit after moving files.

---

### Task 2: Move extension files into `extension/`

Move all extension project files (not `.git`, not `docs/`, not `node_modules/`, not `dist/`) into `extension/`.

**Step 1: Move files using git mv**

```bash
# Move all extension source/config files
git mv manifest.json extension/
git mv package.json extension/
git mv package-lock.json extension/
git mv tsconfig.json extension/
git mv tsconfig.tsbuildinfo extension/ 2>/dev/null || true
git mv vite.config.ts extension/
git mv tailwind.config.ts extension/
git mv src extension/
git mv convex extension/
git mv tests extension/
git mv public extension/
git mv .env extension/
git mv .env.local extension/
git mv PRIVACY_POLICY.md extension/
git mv STORE_LISTING.md extension/
```

**Step 2: Move `.gitignore` and update it**

```bash
git mv .gitignore extension/.gitignore
```

**Step 3: Create a new root `.gitignore`**

Create `/.gitignore`:
```
node_modules/
dist/
.env
*.local
```

**Step 4: Reinstall node_modules in the new location**

```bash
cd extension && npm install && cd ..
```

**Step 5: Verify extension still builds**

```bash
cd extension && npm run build && rm -f convex/*.js && cd ..
```

**Step 6: Verify tests pass**

```bash
cd extension && npm test -- --run && cd ..
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move extension into extension/ subdirectory"
```

---

### Task 3: Scaffold the landing page project

**Files:**
- Create: `landing/package.json`
- Create: `landing/tsconfig.json`
- Create: `landing/vite.config.ts`
- Create: `landing/index.html`
- Create: `landing/src/main.tsx`
- Create: `landing/src/App.tsx`
- Create: `landing/src/index.css`

**Step 1: Create `landing/package.json`**

```json
{
  "name": "polovni-comments-landing",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.574.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^4.2.0",
    "typescript": "^5.5.3",
    "vite": "^6.0.1"
  }
}
```

**Step 2: Create `landing/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

**Step 3: Create `landing/vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Step 4: Create `landing/index.html`**

```html
<!DOCTYPE html>
<html lang="sr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Polovni Automobili Comments</title>
    <meta name="description" content="Dodaj komentare na oglase na polovniautomobili.com" />
    <link rel="icon" type="image/png" href="/icons/icon48.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create `landing/src/index.css`**

```css
@import "tailwindcss";
```

**Step 6: Create `landing/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Step 7: Create `landing/src/App.tsx`**

Placeholder for now:

```tsx
export default function App() {
  return <div>Landing page</div>;
}
```

**Step 8: Copy the extension icon for the landing page favicon**

```bash
mkdir -p landing/public/icons
cp extension/public/icons/icon48.png landing/public/icons/
cp extension/public/icons/icon128.png landing/public/icons/
```

**Step 9: Install dependencies**

```bash
cd landing && npm install && cd ..
```

**Step 10: Verify it runs**

```bash
cd landing && npm run build && cd ..
```

**Step 11: Commit**

```bash
git add landing/
git commit -m "feat: scaffold landing page project"
```

---

### Task 4: Build the landing page UI

**Files:**
- Modify: `landing/src/App.tsx`

Use the `frontend-design` skill to build the full page. The page has these sections, all in Serbian:

**Hero section:**
- "Polovni Automobili Comments" as heading
- Tagline: "Komentari na svakom oglasu na Polovnim"
- Orange CTA button: "Preuzmi za Chrome" linking to `#` (placeholder)
- Extension icon (128px) displayed prominently

**Features section (4 cards):**
1. Komentariši oglase — Ostavi komentar na bilo koji auto oglas na polovniautomobili.com
2. Odgovori i glasaj — Odgovori na komentare drugih korisnika i glasaj za korisne
3. Bez naloga — Koristi anonimno, bez registracije ili prijavljivanja
4. U realnom vremenu — Komentari se pojavljuju odmah, bez osvežavanja stranice

**How it works section (3 steps):**
1. Instaliraj ekstenziju iz Chrome Web Store
2. Otvori bilo koji oglas na polovniautomobili.com
3. Klikni na narandžasto dugme i ostavi komentar

**Footer:**
- Politika privatnosti link (to `/privacy`)
- GitHub link (placeholder `#`)

**Visual style:**
- Dark background (#0a0a0a or similar dark gray)
- Orange accent (#f97316 — Tailwind orange-500)
- White/gray text
- Responsive — single column on mobile, grid on desktop
- Clean sans-serif typography (system font stack)
- Subtle gradients or glows for visual interest

**Step 1: Implement App.tsx with all sections**

Use the `frontend-design` skill for the actual implementation. Write the entire page as a single `App.tsx` component (no separate component files — it's a static page).

**Step 2: Verify it builds and looks correct**

```bash
cd landing && npm run build && cd ..
```

Run `cd landing && npm run dev` and check in browser.

**Step 3: Commit**

```bash
git add landing/src/App.tsx
git commit -m "feat: build landing page with hero, features, how-it-works, footer"
```

---

### Task 5: Add Vercel configuration

**Files:**
- Create: `landing/vercel.json`

**Step 1: Create Vercel config**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Step 2: Commit**

```bash
git add landing/vercel.json
git commit -m "chore: add Vercel config for landing page"
```

---

### Task 6: Move docs to root level

**Files:**
- Move: `docs/` stays at root (it's repo-level docs, not extension-specific)

The `docs/` directory contains plans that are repo-level. It's already at the root. No action needed — just verify it's still accessible and not accidentally moved.

**Step 1: Verify docs are at root**

```bash
ls docs/plans/
```

**Step 2: Commit if any changes needed**

No commit expected.
