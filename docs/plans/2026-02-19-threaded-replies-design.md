# Threaded Replies Design

## Summary

Add Reddit-style threaded replies to the comment system. Top-level comments can receive replies, creating a 2-level comment tree (top-level + 1 reply level). Depth is enforced server-side.

## Decisions

- **Max depth:** 2 levels (top-level + 1 reply)
- **Reply voting:** Yes, replies are votable
- **Reply sorting:** By score (same as top-level)
- **Reply visibility:** Always visible (no collapse/expand)
- **Approach:** Add `parentId` field to existing `comments` table

## Data Model

Add optional `parentId` to the `comments` table:

```
comments table:
  - listingId: string (indexed)
  - authorId: string
  - text: string
  - createdAt: number
  - parentId?: Id<"comments">   ← NEW
```

New index: `by_parent` on `parentId`.

Depth enforcement: `postComment` mutation rejects replies to replies (parent must be a top-level comment).

## Backend Changes

### `getComments` query

Returns nested structure:
1. Fetch all comments for listing
2. Separate top-level (no `parentId`) from replies (has `parentId`)
3. Calculate scores for all
4. Sort top-level by score, attach replies sorted by score under each parent
5. Return `{ ...topLevelComment, replies: Reply[] }[]`

### `postComment` mutation

Gains optional `parentId` parameter:
- If provided: validate parent exists, belongs to same listing, is top-level
- If parent is itself a reply, reject with error

## UI Changes

### CommentItem.tsx

- Add "Reply" text button below timestamp/votes
- When clicked, show inline reply form (textarea + submit)
- Render replies indented below parent with left border
- Reply items do NOT show a "Reply" button (enforces depth in UI)

### Visual nesting

- Replies indented ~24px with subtle left border
- Same vote controls on replies
- Slightly reduced visual weight to distinguish from top-level

### Drawer.tsx

- Comment list renders top-level comments, each followed by indented replies
- Comment count in header includes all comments (top-level + replies)
