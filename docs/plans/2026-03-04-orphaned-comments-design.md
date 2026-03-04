# Orphaned Comments from Deleted Listings

## Problem

Comments in the "Najnoviji" feed are truncated with CSS ellipsis. The expected flow is click → navigate to listing → read full comment. When a listing is deleted from Polovni Automobili, the link is dead and users can never read the full comment text.

## Solution

### 1. Schema change

Add `isDeleted: v.optional(v.boolean())` to the `listings` table. Optional to avoid migration — existing rows are unaffected.

### 2. Detection on click

When a user clicks a LatestFeedItem linking to a listing:
- The extension content script on the target page detects a deleted listing (Polovni's "oglas je obrisan" page or 404)
- Calls a new `markListingDeleted` mutation setting `isDeleted: true`
- Persisted for all future viewers

### 3. Query change

`getLatestComments` already returns listing data. Include `isDeleted` in the returned listing object.

### 4. UI changes in LatestFeedItem

- If `listing.isDeleted` is true: show a small "Obrisan oglas" badge next to the title
- On click when deleted: instead of navigating, expand the comment text in place (remove truncation, show full text)
- Keep showing cached title, price, and image

### What stays the same

- Comments with live listings: click → navigate (unchanged)
- Comments where `listing` is null (never cached): unchanged
- No cron jobs or periodic checks

## Files to modify

| File | Change |
|------|--------|
| `convex/schema.ts` | Add `isDeleted` to listings table |
| `convex/listings.ts` | Add `markListingDeleted` mutation |
| `convex/comments.ts` | Include `isDeleted` in `getLatestComments` response |
| `extension/src/components/LatestFeedItem.tsx` | Badge, expand-on-click, full text display |
| `extension/src/content.ts` (or equivalent) | Detect deleted listing page, call mutation |
