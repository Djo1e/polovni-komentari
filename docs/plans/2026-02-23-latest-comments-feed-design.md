# Latest Comments Feed — Design

## Overview

Add a global "Latest Comments" feed to the Chrome extension so users can browse recent comments across all car listings, not just the one they're currently viewing.

## Data Model

### New `listings` table

```typescript
{
  _id: Id<"listings">
  listingId: string       // same ID used in comments table
  title: string           // car title (e.g. "BMW 320d 2018")
  price: string           // displayed price (e.g. "12.500 €")
  imageUrl: string        // first photo URL
  url: string             // full listing URL
}
```

Index: `by_listingId` on `listingId`.

### New index on `comments` table

`by_createdAt` on `createdAt` — enables fetching recent comments globally.

## Backend

### `getLatestComments` query

- Queries `comments` ordered by `createdAt` descending
- Returns 50 most recent top-level comments (excludes replies)
- Joins with `listings` table by `listingId` to attach car preview data
- Real-time via Convex `useQuery`

### `upsertListing` mutation

- Called when a comment is posted on a listing
- If listing doesn't exist by `listingId`, inserts scraped metadata
- If it exists, no-op (or update if data changed)

## Content Script Changes

### Broader match pattern

Change from `https://www.polovniautomobili.com/auto-oglasi/*/*` to `https://www.polovniautomobili.com/*`. Extension loads on all pages.

### DOM scraping

On listing detail pages, extract title, price, and image URL from the page. Send alongside comment post to populate the `listings` table.

### Non-listing pages

Mount the drawer but only show the "Latest" tab (no listing context available).

## UI

### Tab navigation in drawer header

- **"Овај оглас"** — current listing's comments. Only shown on listing detail pages.
- **"Најновије"** — global feed of recent comments. Available on all pages.

### Default tab

- Listing detail page → "Овај оглас"
- Any other page → "Најновије"

### Latest feed comment card

- Car mini-preview: image thumbnail, title, price (clickable → opens listing)
- Comment text, username, relative timestamp
- Read-only — no voting or replying

### Toggle button

- Listing pages: shows comment count (current behavior)
- Non-listing pages: generic icon/label

## Out of Scope

- Pagination / infinite scroll (capped at 50)
- Filtering or search
- Trending / most discussed views
- User profiles or comment history
- Notifications
