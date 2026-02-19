# Chrome Web Store Publishing Preparation

## Goal
Prepare the extension for Chrome Web Store submission: clean up code, eliminate permissions, create required assets.

## Changes

### 1. Drop `storage` permission — switch to `localStorage`
Replace `chrome.storage.local` with `localStorage` in 3 files:
- `src/utils/anonymousId.ts` — `getItem`/`setItem` for UUID
- `src/utils/username.ts` — `getItem`/`setItem` for username + auto-generated flag (store as JSON)
- `src/components/Drawer.tsx` — `getItem`/`setItem` for drawer open state

Remove `"permissions": ["storage"]` from `manifest.json` entirely — zero permissions.

Trade-off: data lives on host domain, cleared if user clears site data. Acceptable since all values auto-regenerate and comments live server-side.

Update `src/utils/anonymousId.test.ts` to mock `localStorage` instead of `chrome.storage`.

### 2. Fix build script
Change `package.json` build to: `tsc -b && vite build && rm -f convex/*.js src/**/*.js tests/**/*.js`

### 3. Translate English error messages to Serbian
- `PostForm.tsx:59` — "Failed to post. Please try again." → Serbian
- `PostForm.tsx:73` — "Enter a username..." placeholder → Serbian
- `PostForm.tsx:109` — "Posting…" → Serbian

### 4. Extension icons
Add `icons` field to `manifest.json` pointing to 16/48/128px PNGs. User will provide or create these.

### 5. Privacy policy draft
Draft privacy policy text covering: what data is collected (anonymous ID, username, comments, votes), where stored (Convex backend), no PII collected, no tracking/analytics.

### 6. Web Store listing
Draft description text for the store listing.
