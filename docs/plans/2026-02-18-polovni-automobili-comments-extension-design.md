# Polovni Automobili Comments Chrome Extension — Design

**Date:** 2026-02-18

## Overview

A Chrome extension that injects a community comment panel into individual car listing pages on [polovniautomobili.com](https://www.polovniautomobili.com). Comments are public and shared across all users of the extension. Users are anonymous. Comments support upvoting and downvoting.

---

## Stack

| Layer | Technology |
|---|---|
| Extension | Chrome Manifest V3 |
| UI | React 18, TypeScript, Tailwind CSS |
| Build | Vite + CRXJS plugin |
| Backend | Convex (database + serverless functions) |
| Style isolation | Shadow DOM |

---

## Architecture

### Chrome Extension

- **Content script** — runs on `*.polovniautomobili.com/auto-oglasi/oglas/*` URLs. Extracts the listing ID from the URL. Creates a Shadow DOM host element appended to `document.body`. Mounts the React app inside the shadow root with Tailwind styles scoped within it.
- **`chrome.storage.local`** — stores the anonymous user UUID (generated once on first install) and the drawer open/closed state.
- **No background service worker needed for MVP.**

### Listing Identity

The `listingId` is the numeric ID extracted from the listing URL:

```
/auto-oglasi/oglas/kia-sportage-12345678.html  →  "12345678"
```

All comments are keyed to this ID.

### Anonymous Identity

A UUID v4 is generated on first use and stored in `chrome.storage.local`. This ID is the comment author and the vote identity. It is never shown to the user. If the user reinstalls the extension, a new ID is generated (known limitation for MVP).

---

## Data Model (Convex)

### `comments` table

| Field | Type | Notes |
|---|---|---|
| `listingId` | `string` | Extracted from listing URL |
| `authorId` | `string` | Anonymous UUID |
| `text` | `string` | Max 1000 characters |
| `createdAt` | `number` | Unix timestamp (ms) |

Score is computed at query time from the `votes` table.

### `votes` table

| Field | Type | Notes |
|---|---|---|
| `commentId` | `Id<"comments">` | Reference to comment |
| `voterId` | `string` | Anonymous UUID |
| `direction` | `"up" \| "down"` | Vote direction |

Unique constraint on `(commentId, voterId)` — one vote per user per comment.

### Convex Functions

- `getComments(listingId)` — real-time query; returns comments with computed score, sorted by score descending
- `postComment({ listingId, text, authorId })` — mutation; validates text length
- `vote({ commentId, voterId, direction })` — mutation; upserts vote, toggles off if same direction voted again, replaces if direction switches

---

## UI / UX

### Layout

A fixed right-side drawer overlays the page. A persistent toggle tab is anchored to the right edge of the viewport, always visible. The tab shows the current comment count as a badge.

```
                              ┌──────────────────────┐
[  page content          ] [💬]│ Community Comments   │
[  page content          ] [12]│──────────────────────│
[  page content          ]    │ [Write a comment...] │
[  page content          ]    │ [Post]               │
[  page content          ]    │                      │
[  page content          ]    │ ▲ 14  Flood damage,  │
[  page content          ]    │ ▼     check carpet.  │
[  page content          ]    │       2 days ago     │
└─────────────────────────────┴──────────────────────┘
```

### Drawer

- Fixed position, right edge, full viewport height minus top nav offset (~80px)
- Width: 380px
- Slides in/out with CSS transition
- Scrolls internally; does not affect page scroll
- State (open/closed) persisted in `chrome.storage.local`

### Comments

- Loaded via Convex real-time subscription — updates without refresh
- Sorted by score (upvotes minus downvotes) descending
- Posting is optimistic — comment appears immediately, reverts on failure
- Up/down vote buttons toggle: clicking your active vote removes it; clicking the opposite replaces it
- Your active vote is visually highlighted

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Convex unreachable | "Could not load comments" message + retry button inside drawer |
| Post fails | Optimistic comment reverts; inline error shown |
| Vote fails | Vote reverts silently to previous state |
| Content script on non-listing page | Exits early; nothing injected |

---

## Testing

- **Unit tests (Vitest):** Convex mutation logic, especially vote toggle/switch edge cases
- **Manual smoke tests:** Verify `listingId` extraction on several listing URL formats
- No E2E tests for MVP

---

## Known Limitations (MVP)

- Reinstalling the extension generates a new anonymous ID — user loses authorship of previous comments and vote history
- No spam or abuse moderation
- No comment editing or deletion
