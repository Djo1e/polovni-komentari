# Deleted Listing Modal

## Problem
When a car listing is deleted on polovniautomobili.com, users who visit the URL see an error/empty page. The extension has cached listing metadata (title, price, image) and comments in Convex, but this data isn't surfaced.

## Solution
Show an overlay modal when the extension detects a deleted listing page, displaying the cached listing info and read-only comments.

## Trigger
When `listingId` is extracted from the URL but `listingInfo` is null (page has no content), the listing is deleted. Auto-show the modal on page load.

## Data
- New `getListing` query: fetches cached listing metadata by `listingId`
- Existing `getComments` query: fetches the full comment thread

## Modal UI
- Centered overlay with semi-transparent backdrop
- X button to dismiss (user can close to see underlying page)
- Header: prominent "Obrisan oglas" badge
- Listing card: cached image, title, price
- Comment thread below: read-only display, no post form, no vote/react/reply buttons
- Fallback: if no cached listing data exists, show a simple "Oglas je obrisan" message

## Components
- `DeletedListingModal`: overlay modal component
- `CommentItem` with `readOnly` prop or simplified `ReadOnlyCommentItem`

## Wiring
- `App.tsx` detects deleted listing state (`listingId` present, `listingInfo` null)
- Renders `DeletedListingModal` which subscribes to `getListing` + `getComments`
- Drawer still works independently alongside the modal

## Scope exclusions
- No posting, voting, reacting, or replying from the modal
- No changes to drawer behavior
- No changes to "Najnoviji" feed behavior
