# Threaded Replies Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Reddit-style threaded replies (2 levels: top-level + 1 reply) to the comment system.

**Architecture:** Add optional `parentId` to existing `comments` table. Backend query returns nested structure. UI renders replies indented with left border below parent. Depth enforced server-side.

**Tech Stack:** Convex (backend), React + Tailwind (UI), Chrome Extension

---

### Task 1: Add `parentId` to schema

**Files:**
- Modify: `convex/schema.ts`

**Step 1: Add parentId field and index**

In `convex/schema.ts`, add `parentId` as optional field and a `by_parent` index:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  comments: defineTable({
    listingId: v.string(),
    authorId: v.string(),
    text: v.string(),
    createdAt: v.number(),
    parentId: v.optional(v.id("comments")),
  })
    .index("by_listing", ["listingId"])
    .index("by_parent", ["parentId"]),

  votes: defineTable({
    commentId: v.id("comments"),
    voterId: v.string(),
    direction: v.union(v.literal("up"), v.literal("down")),
  })
    .index("by_comment", ["commentId"])
    .index("by_comment_voter", ["commentId", "voterId"]),
});
```

**Step 2: Push schema**

Run: `npx convex dev` (let it sync the schema change, then Ctrl+C or leave running)

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add parentId field to comments schema for threading"
```

---

### Task 2: Update `postComment` mutation to support parentId

**Files:**
- Modify: `convex/comments.ts`

**Step 1: Add parentId arg and depth validation**

Update `postComment` to accept optional `parentId` and validate the parent is top-level:

```typescript
export const postComment = mutation({
  args: {
    listingId: v.string(),
    text: v.string(),
    authorId: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, { listingId, text, authorId, parentId }) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) throw new Error("Comment cannot be empty");
    if (trimmed.length > 1000) throw new Error("Comment too long");

    if (parentId) {
      const parent = await ctx.db.get(parentId);
      if (!parent) throw new Error("Parent comment not found");
      if (parent.listingId !== listingId) throw new Error("Parent belongs to different listing");
      if (parent.parentId) throw new Error("Cannot reply to a reply");
    }

    return ctx.db.insert("comments", {
      listingId,
      authorId,
      text: trimmed,
      createdAt: Date.now(),
      ...(parentId ? { parentId } : {}),
    });
  },
});
```

**Step 2: Commit**

```bash
git add convex/comments.ts
git commit -m "feat: support parentId in postComment with depth validation"
```

---

### Task 3: Update `getComments` query to return nested structure

**Files:**
- Modify: `convex/comments.ts`

**Step 1: Return threaded comments**

Replace the `getComments` query to group replies under their parents:

```typescript
export const getComments = query({
  args: { listingId: v.string() },
  handler: async (ctx, { listingId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_listing", (q) => q.eq("listingId", listingId))
      .collect();

    const withScores = await Promise.all(
      comments.map(async (comment) => {
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
          .collect();
        const score = votes.reduce(
          (acc, v) => acc + (v.direction === "up" ? 1 : -1),
          0
        );
        return { ...comment, score };
      })
    );

    const topLevel = withScores
      .filter((c) => !c.parentId)
      .sort((a, b) => b.score - a.score);

    const repliesByParent = new Map<string, typeof withScores>();
    for (const c of withScores) {
      if (c.parentId) {
        const key = c.parentId;
        if (!repliesByParent.has(key)) repliesByParent.set(key, []);
        repliesByParent.get(key)!.push(c);
      }
    }
    for (const replies of repliesByParent.values()) {
      replies.sort((a, b) => b.score - a.score);
    }

    return topLevel.map((c) => ({
      ...c,
      replies: repliesByParent.get(c._id) ?? [],
    }));
  },
});
```

**Step 2: Verify Convex syncs without errors**

Check `npx convex dev` output — should show successful push.

**Step 3: Commit**

```bash
git add convex/comments.ts
git commit -m "feat: return threaded comments with nested replies"
```

---

### Task 4: Update CommentItem to support replies and reply form

**Files:**
- Modify: `src/components/CommentItem.tsx`

**Step 1: Update types and add reply support**

Rewrite `CommentItem.tsx`:

```tsx
import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, User } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface Comment {
  _id: Id<"comments">;
  text: string;
  score: number;
  createdAt: number;
  authorId: string;
  parentId?: Id<"comments">;
  replies: Comment[];
}

interface Props {
  comment: Comment;
  currentVotes: Record<string, "up" | "down">;
  onVote: (commentId: string, direction: "up" | "down") => void;
  onReply: (parentId: string, text: string) => Promise<void>;
  anonymousId: string;
  isReply?: boolean;
}

export function CommentItem({ comment, currentVotes, onVote, onReply, anonymousId, isReply }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const timeAgo = formatTimeAgo(comment.createdAt);
  const isOwn = comment.authorId === anonymousId;
  const currentVote = currentVotes[comment._id] ?? null;

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      await onReply(comment._id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
        {/* Avatar */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 break-words leading-snug">{comment.text}</p>

          {/* Footer: timestamp + actions + votes */}
          <div className="flex items-center justify-between mt-1.5 -mb-1">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 leading-7">{timeAgo}</p>
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <MessageSquare className="h-3 w-3" />
                  Reply
                </button>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onVote(comment._id, "up")}
                aria-label="Upvote"
                disabled={isOwn}
                className={`h-7 w-7 ${currentVote === "up" ? "text-orange-500" : "text-muted-foreground"}`}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <span className="text-xs font-semibold text-gray-600 tabular-nums w-4 text-center">
                {comment.score}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onVote(comment._id, "down")}
                aria-label="Downvote"
                disabled={isOwn}
                className={`h-7 w-7 ${currentVote === "down" ? "text-blue-500" : "text-muted-foreground"}`}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Inline reply form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                maxLength={1000}
                rows={2}
                className="resize-none text-sm"
                disabled={posting}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowReplyForm(false); setReplyText(""); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!replyText.trim() || posting}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  size="sm"
                >
                  {posting ? "Posting…" : "Reply"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-6 border-l-2 border-gray-100 pl-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentVotes={currentVotes}
              onVote={onVote}
              onReply={onReply}
              anonymousId={anonymousId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}
```

**Step 2: Commit**

```bash
git add src/components/CommentItem.tsx
git commit -m "feat: add reply button, inline reply form, and nested reply rendering"
```

---

### Task 5: Update App.tsx to handle replies and new Comment type

**Files:**
- Modify: `src/components/App.tsx`

**Step 1: Update App to pass onReply and new comment shape**

```tsx
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Drawer } from "./Drawer";
import { Comment } from "./CommentItem";
import { ShadowPortalContext } from "../context/shadow-portal";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

interface AppProps {
  listingId: string;
  anonymousId: string;
  portalContainer: HTMLElement;
}

function countAllComments(comments: Comment[]): number {
  return comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);
}

function CommentApp({ listingId, anonymousId }: Omit<AppProps, "portalContainer">) {
  const commentsRaw = useQuery(api.comments.getComments, { listingId });
  const voteMutation = useMutation(api.votes.vote);
  const postMutation = useMutation(api.comments.postComment);
  const [error, setError] = useState<string | null>(null);
  const [localVotes, setLocalVotes] = useState<Record<string, "up" | "down" | null>>({});

  const comments: Comment[] = (commentsRaw ?? []) as Comment[];

  const handleVote = useCallback(
    async (commentId: string, direction: "up" | "down") => {
      const prev = localVotes[commentId] ?? null;
      const next = prev === direction ? null : direction;
      setLocalVotes((v) => ({ ...v, [commentId]: next }));
      try {
        await voteMutation({
          commentId: commentId as Id<"comments">,
          voterId: anonymousId,
          direction,
        });
      } catch {
        setLocalVotes((v) => ({ ...v, [commentId]: prev }));
      }
    },
    [localVotes, voteMutation, anonymousId]
  );

  const handlePost = useCallback(
    async (text: string) => {
      await postMutation({ listingId, text, authorId: anonymousId });
    },
    [postMutation, listingId, anonymousId]
  );

  const handleReply = useCallback(
    async (parentId: string, text: string) => {
      await postMutation({
        listingId,
        text,
        authorId: anonymousId,
        parentId: parentId as Id<"comments">,
      });
    },
    [postMutation, listingId, anonymousId]
  );

  const mergedVotes = {
    ...Object.fromEntries(
      Object.entries(localVotes).filter(([, v]) => v !== null) as [string, "up" | "down"][]
    ),
  };

  const connectionError = commentsRaw === undefined ? error : null;

  return (
    <Drawer
      comments={comments}
      commentCount={countAllComments(comments)}
      currentVotes={mergedVotes}
      onVote={handleVote}
      onPost={handlePost}
      onReply={handleReply}
      error={connectionError}
      onRetry={() => setError(null)}
      anonymousId={anonymousId}
    />
  );
}

export default function App({ portalContainer, ...props }: AppProps) {
  return (
    <ShadowPortalContext.Provider value={portalContainer}>
      <ConvexProvider client={convex}>
        <CommentApp {...props} />
      </ConvexProvider>
    </ShadowPortalContext.Provider>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/App.tsx
git commit -m "feat: wire up reply handler and count total comments including replies"
```

---

### Task 6: Update Drawer to pass new props to CommentItem

**Files:**
- Modify: `src/components/Drawer.tsx`

**Step 1: Update Drawer props and CommentItem usage**

```tsx
import { useState, useEffect, useRef } from "react";
import { Comment, CommentItem } from "./CommentItem";
import { PostForm } from "./PostForm";
import { X } from "lucide-react";

interface Props {
  comments: Comment[];
  commentCount: number;
  currentVotes: Record<string, "up" | "down">;
  onVote: (commentId: string, direction: "up" | "down") => void;
  onPost: (text: string) => Promise<void>;
  onReply: (parentId: string, text: string) => Promise<void>;
  error: string | null;
  onRetry: () => void;
  anonymousId: string;
}

const DRAWER_STATE_KEY = "paCommentsDrawerOpen";

export function Drawer({
  comments,
  commentCount,
  currentVotes,
  onVote,
  onPost,
  onReply,
  error,
  onRetry,
  anonymousId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.local.get(DRAWER_STATE_KEY).then((result) => {
      if (result[DRAWER_STATE_KEY] === true) setOpen(true);
    });
  }, []);

  function toggle() {
    if (animating) return;
    const next = !open;
    setAnimating(true);
    setOpen(next);
    chrome.storage.local.set({ [DRAWER_STATE_KEY]: next });
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        zIndex: 2147483647,
        top: 0,
        right: 0,
        height: "100dvh",
        width: "30%",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 500ms ease-in-out",
      }}
      onTransitionEnd={() => setAnimating(false)}
    >
      {/* Toggle tab */}
      <button
        onClick={toggle}
        disabled={animating}
        style={{ transform: "translateX(-100%) translateY(-50%)" }}
        className="absolute left-0 top-1/2 flex flex-col items-center justify-center gap-1 bg-orange-500 text-white w-9 rounded-l-lg p-6 shadow-lg hover:bg-orange-600 disabled:opacity-80"
        aria-label="Toggle comments"
      >
        <span className="text-lg leading-none">💬</span>
        {commentCount > 0 && (
          <span className="text-[20px] font-bold leading-none">
            {commentCount > 99 ? "99+" : commentCount}
          </span>
        )}
      </button>

      {/* Drawer panel */}
      <div className="h-full bg-background shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Community Comments{" "}
            {commentCount > 0 && (
              <span className="text-muted-foreground font-normal">
                ({commentCount})
              </span>
            )}
          </h2>
          <button
            onClick={toggle}
            disabled={animating}
            className="rounded-sm opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0">
          <PostForm onPost={onPost} />
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {error ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={onRetry}
                className="text-sm text-orange-500 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                currentVotes={currentVotes}
                onVote={onVote}
                onReply={onReply}
                anonymousId={anonymousId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Drawer.tsx
git commit -m "feat: pass reply handler and vote map to CommentItem"
```

---

### Task 7: Build and verify

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 2: Run build**

Run: `npm run build`
Expected: successful build

**Step 3: Manual test**

1. Load extension in Chrome (`chrome://extensions` → Load unpacked → `dist/`)
2. Open a Polovni Automobili listing page
3. Post a top-level comment → should appear as before
4. Click "Reply" on the comment → inline textarea appears
5. Submit reply → reply appears indented below parent with left border
6. Vote on both top-level and reply → both work
7. Verify reply button does NOT appear on replies

**Step 4: Commit any fixes if needed, then final commit**

```bash
git add -A
git commit -m "feat: threaded replies complete"
```
