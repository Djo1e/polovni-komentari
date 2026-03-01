# Unified Reactions System Design

**Date:** 2026-03-01
**Status:** Approved

## Problem

The extension is in early stage (<50 users). The biggest barriers to engagement are:
1. **Empty state** — users open the drawer, see zero comments, close it
2. **Motivation** — users don't feel compelled to write anything

Writing a comment is high friction. We need low-friction interactions that let users engage with a single click.

## Solution

A unified reactions system that adds:
- **Price votes** on listings (binary: good price / overpriced)
- **General reactions** on listings (emoji reactions)
- **Emoji reactions** on comments

All stored in a single `reactions` table.

## Data Model

### New table: `reactions`

| Field | Type | Description |
|-------|------|-------------|
| `targetType` | `"listing"` \| `"comment"` | What the reaction is on |
| `targetId` | `string` | `listingId` or `comment._id` |
| `reactorId` | `string` | Anonymous UUID |
| `emoji` | `string` | The emoji character |
| `category` | `"price"` \| `"general"` | Distinguishes price votes from general reactions |

### Indexes

- `by_target`: `[targetType, targetId]`
- `by_target_reactor`: `[targetType, targetId, reactorId]`

## Emoji Palette

### Listing Reactions

| Emoji | Meaning | Category |
|-------|---------|----------|
| 👍 | Good price | price |
| 👎 | Overpriced | price |
| 😍 | Want it | general |
| ⚠️ | Suspicious | general |
| 💩 | Bad listing | general |

### Comment Reactions

| Emoji | Meaning | Category |
|-------|---------|----------|
| 😄 | Funny | general |
| 👍 | Agree | general |
| 👏 | Well said | general |

## UI Layout

### Listing Reactions (top of drawer, before comments)

```
┌─────────────────────────────────────┐
│  Cena:   [👍 12]  [👎 3]           │  ← Price section, prominent
│          ━━━━━━━━━━━━━░░░  80%      │  ← Results bar (appears after first vote)
│                                     │
│  [😍 5]  [⚠️ 2]  [💩 0]           │  ← General reactions row
├─────────────────────────────────────┤
│  Comments below...                  │
```

### Comment Reactions (on each comment)

```
┌─────────────────────────────────────┐
│  Golf472                    2 min   │
│  Dobar auto, ali cena malo visoka   │
│                                     │
│  [▲ 3 ▼]    [😄 1] [👍 2] [👏 0]  │
│              [Reply]                │
└─────────────────────────────────────┘
```

- Reaction pills sit to the right of existing vote buttons
- Zero-count reactions shown dimmed (so users know they can react)
- Active reactions highlighted with orange background

## Behavior

### Toggling
- Click a reaction to add it (highlighted)
- Click again to remove it
- Price votes are mutually exclusive: clicking 👍 when you voted 👎 switches your vote

### Identity
- Uses existing `anonymousId` from localStorage — no new identity system

### Empty State
- All reaction buttons shown with 0 counts
- The price results bar only appears once at least 1 price vote exists
- Seeing the buttons IS the prompt to engage

### Performance
- Listing reactions: new `getListingReactions(listingId)` query
- Comment reactions: joined into existing `getComments` query
- Toggle mutation: single `reactions.react()` function

### Latest Feed
- Listing reactions do NOT appear in the "Najnoviji" feed
- Comment reactions DO appear on comments shown in the feed

## New Backend Functions

| Function | Type | Purpose |
|----------|------|---------|
| `reactions.react(targetType, targetId, emoji, category, reactorId)` | mutation | Toggle/switch reaction |
| `reactions.getListingReactions(listingId)` | query | All reactions for a listing |
| Extend `comments.getComments` | query | Include comment reactions |

## New Components

| Component | Purpose |
|-----------|---------|
| `PriceVote.tsx` | Price vote UI with results bar |
| `ListingReactions.tsx` | General reaction row for listings |
| `CommentReactions.tsx` | Reaction pills for individual comments |
