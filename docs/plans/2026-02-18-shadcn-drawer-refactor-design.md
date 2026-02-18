# Shadcn Drawer Refactor — Design

**Date:** 2026-02-18

## Goal

Replace all custom-Tailwind UI in the drawer and its child components with Shadcn/ui primitives, while preserving the Shadow DOM style isolation.

---

## Key Challenge: Shadow DOM Portal

Shadcn's `Sheet` uses a Radix UI Portal that renders to `document.body` by default. Styles from our shadow root don't apply there. Fix: a `ShadowPortalContext` carries a reference to a dedicated portal target `<div>` inside the shadow root. The generated `sheet.tsx` reads this context and passes it as the `container` prop to the Radix Portal.

---

## Components

| Component | Shadcn replacement |
|---|---|
| Drawer slide-in panel | `Sheet` / `SheetContent` (side="right") |
| Drawer header | `SheetHeader` / `SheetTitle` |
| Close button | `SheetClose` with Shadcn `Button` (variant="ghost", size="icon") |
| Post textarea | Shadcn `Textarea` |
| Post submit button | Shadcn `Button` (default variant) |
| Vote up/down buttons | Shadcn `Button` (variant="ghost", size="icon") |
| Toggle tab | Stays custom (orange branded tab, not a Shadcn pattern) |

---

## New Files

- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/context/shadow-portal.tsx` — `ShadowPortalContext` + provider
- `src/components/ui/sheet.tsx` — Shadcn Sheet, modified to use shadow portal context
- `src/components/ui/button.tsx` — Shadcn Button
- `src/components/ui/textarea.tsx` — Shadcn Textarea

## Modified Files

- `package.json` — add `@radix-ui/react-dialog`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss-animate`
- `tsconfig.json` — add `@/*` path alias
- `vite.config.ts` — add `@` path alias resolve
- `src/content/shadow.css` — add `@plugin "tailwindcss-animate"`, `@theme inline` token mappings, `:host` CSS variable definitions
- `src/content/index.tsx` — create portal target div, pass to App
- `src/components/App.tsx` — wrap with `ShadowPortalProvider`
- `src/components/Drawer.tsx` — rewrite using Sheet
- `src/components/PostForm.tsx` — rewrite using Button + Textarea
- `src/components/CommentItem.tsx` — replace vote buttons with Button
