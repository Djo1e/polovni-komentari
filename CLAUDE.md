# Project: Polovni Komentari

Chrome extension that adds community comments to car listings on polovniautomobili.com.

## Tech Stack
- **Extension**: React 18, TypeScript, Tailwind v4, Vite, CRXJS
- **Backend**: Convex (queries, mutations, actions, scheduled functions)
- **Landing**: Astro (in `landing/`)
- **Auth**: Google Sign-In via `chrome.identity`
- **Tests**: Vitest + convex-test

## Project Structure
```
extension/          # Chrome extension (main workspace)
  convex/           # Convex backend (schema, functions)
  src/
    background/     # Service worker (GA, auth, VIN proxy)
    components/     # React components (Drawer, CommentItem, etc.)
    content/        # Content script entry point
    hooks/          # React hooks (useAuth)
    utils/          # Utilities (auth, tracking, username, etc.)
  tests/            # Vitest tests
landing/            # Landing page (Astro)
```

## Build Commands
- `npm run build` — Dev build (uses .env.local → dev DB)
- `npm run build:prod` — Production build (temporarily removes .env.local → prod DB)
- `npm run zip` — Production build + zip for Chrome Web Store upload
- `npx convex dev --once` — Deploy to dev Convex (notable-goose-213)
- `npx convex deploy --yes` — Deploy to prod Convex (stoic-bee-994)
- `npx vitest run` — Run all tests

## Environment
- `.env` — Production values (VITE_CONVEX_URL=stoic-bee-994, GA keys)
- `.env.local` — Dev override (VITE_CONVEX_URL=notable-goose-213)
- `.env.local` overrides `.env` — always use `npm run build:prod` or `npm run zip` for production builds

## Critical Rules

### NEVER delete or modify production data without explicit user confirmation
- Always ask before ANY destructive operation on prod
- Convex deletions are permanent — there is no undo
- Suggest exporting/backing up data first

### After code changes
- Run `npm run build` (or `build:prod` for release)
- Delete stale JS: `rm -f convex/*.js` (tsc compiles .ts→.js which shadow sources)
- Deploy Convex: `npx convex dev --once` (dev) or `npx convex deploy --yes` (prod)

### Testing
- All tests must pass before deploying (`npx vitest run`)
- Tests use convex-test with fake timers for scheduled functions
- `createOrUpdateUser` returns `{ userId, sessionToken }` — always destructure

### Shadow DOM
- Extension renders inside Shadow DOM — some CSS/browser features behave differently
- Tailwind classes work but native `title` tooltips may not — use CSS tooltips instead
- Toggle switches need inline styles (not Tailwind transform classes)
