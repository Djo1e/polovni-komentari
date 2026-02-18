# Shadcn Drawer Refactor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all custom-Tailwind UI in the drawer and its child components with Shadcn/ui primitives (Sheet, Button, Textarea), while preserving Shadow DOM style isolation via a portal context.

**Architecture:** A `ShadowPortalContext` carries a reference to a dedicated `<div>` inside the shadow root. The Shadcn Sheet component reads this context and passes it as the `container` prop to the Radix Portal, ensuring all rendered content stays inside the shadow root. New `src/components/ui/` components are generated/adapted from shadcn source.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Shadcn/ui (Sheet, Button, Textarea), Radix UI, class-variance-authority, tailwindcss-animate

---

## Task 1: Install Dependencies + Configure Path Alias

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`

**Step 1: Install new packages**

```bash
cd /Users/djordje/projects/polovni-comments
npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
npm install -D tailwindcss-animate
```

**Step 2: Add `@` path alias to `vite.config.ts`**

Replace the full file:

```typescript
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'edge-runtime',
    server: { deps: { inline: ['convex-test'] } },
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
})
```

**Step 3: Add path alias + `@types/node` to `tsconfig.json`**

Replace the full file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "types": ["chrome", "vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "convex"]
}
```

**Step 4: Install `@types/node` for `path` import in vite.config**

```bash
npm install -D @types/node
```

**Step 5: Verify it compiles**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 6: Commit**

```bash
git add -A && git commit -m "chore: add shadcn dependencies and @ path alias"
```

---

## Task 2: CSS — Shadcn Variables + Animate Plugin

**Files:**
- Modify: `src/content/shadow.css`

**Step 1: Replace `src/content/shadow.css` with the full Shadcn v4 setup**

```css
@import "tailwindcss";
@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:host {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}
```

**Step 2: Verify build still works**

```bash
cd /Users/djordje/projects/polovni-comments && npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

**Step 3: Commit**

```bash
git add src/content/shadow.css && git commit -m "chore: add shadcn CSS variables and animate plugin to shadow.css"
```

---

## Task 3: `src/lib/utils.ts` — cn() helper

**Files:**
- Create: `src/lib/utils.ts`

**Step 1: Create the file**

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Step 2: Verify it type-checks**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/lib/utils.ts && git commit -m "feat: add cn() utility for shadcn"
```

---

## Task 4: Shadow Portal Context

**Files:**
- Create: `src/context/shadow-portal.tsx`
- Modify: `src/content/index.tsx`
- Modify: `src/components/App.tsx`

**Step 1: Create `src/context/shadow-portal.tsx`**

```typescript
import { createContext, useContext } from "react"

export const ShadowPortalContext = createContext<HTMLElement | null>(null)

export function useShadowPortal(): HTMLElement | null {
  return useContext(ShadowPortalContext)
}
```

**Step 2: Update `src/content/index.tsx` to create and pass a portal target**

Replace the full file:

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import { extractListingId } from "../utils/listingId";
import { getOrCreateAnonymousId } from "../utils/anonymousId";
import App from "../components/App";
import styles from "./shadow.css?inline";

async function main() {
  const listingId = extractListingId(window.location.href);
  if (!listingId) return;

  const anonymousId = await getOrCreateAnonymousId();

  const host = document.createElement("div");
  host.id = "pa-comments-host";
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = styles;
  shadow.appendChild(style);

  // Dedicated portal target for Radix UI portals (Sheet overlay etc.)
  const portalTarget = document.createElement("div");
  portalTarget.id = "pa-comments-portal";
  shadow.appendChild(portalTarget);

  const container = document.createElement("div");
  shadow.appendChild(container);

  createRoot(container).render(
    <React.StrictMode>
      <App
        listingId={listingId}
        anonymousId={anonymousId}
        portalContainer={portalTarget}
      />
    </React.StrictMode>
  );
}

main();
```

**Step 3: Update `src/components/App.tsx` to wrap with the portal context**

Replace the full file:

```typescript
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ShadowPortalContext } from "../context/shadow-portal";
import { Drawer } from "./Drawer";
import { Comment } from "./CommentItem";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

interface AppProps {
  listingId: string;
  anonymousId: string;
  portalContainer: HTMLElement;
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

  const mergedVotes = {
    ...Object.fromEntries(
      Object.entries(localVotes).filter(([, v]) => v !== null) as [string, "up" | "down"][]
    ),
  };

  return (
    <Drawer
      comments={comments}
      commentCount={comments.length}
      currentVotes={mergedVotes}
      onVote={handleVote}
      onPost={handlePost}
      error={commentsRaw === undefined ? error : null}
      onRetry={() => setError(null)}
    />
  );
}

export default function App({ listingId, anonymousId, portalContainer }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <ShadowPortalContext.Provider value={portalContainer}>
        <CommentApp listingId={listingId} anonymousId={anonymousId} />
      </ShadowPortalContext.Provider>
    </ConvexProvider>
  );
}
```

**Step 4: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/context/shadow-portal.tsx src/content/index.tsx src/components/App.tsx
git commit -m "feat: add ShadowPortalContext for Radix portal container"
```

---

## Task 5: Shadcn `Button` Component

**Files:**
- Create: `src/components/ui/button.tsx`

**Step 1: Create `src/components/ui/button.tsx`**

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Step 2: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/ui/button.tsx && git commit -m "feat: add shadcn Button component"
```

---

## Task 6: Shadcn `Textarea` Component

**Files:**
- Create: `src/components/ui/textarea.tsx`

**Step 1: Create `src/components/ui/textarea.tsx`**

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
```

**Step 2: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/ui/textarea.tsx && git commit -m "feat: add shadcn Textarea component"
```

---

## Task 7: Shadcn `Sheet` Component (with Shadow Portal)

**Files:**
- Create: `src/components/ui/sheet.tsx`

**Step 1: Create `src/components/ui/sheet.tsx`**

This is the standard shadcn Sheet adapted to use `useShadowPortal()` as the Radix Portal container:

```typescript
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useShadowPortal } from "@/context/shadow-portal"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close

function SheetPortal({ children }: { children: React.ReactNode }) {
  const container = useShadowPortal()
  return (
    <SheetPrimitive.Portal container={container}>
      {children}
    </SheetPrimitive.Portal>
  )
}

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out flex flex-col",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-[380px] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-left", className)}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
}
```

**Important:** The `children` prop is rendered twice in the above — remove the first `{children}` before the `SheetPrimitive.Close` line. The correct `SheetContent` body should be:

```typescript
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
```

**Step 2: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/ui/sheet.tsx && git commit -m "feat: add shadcn Sheet component with shadow portal support"
```

---

## Task 8: Refactor `PostForm` with Shadcn Button + Textarea

**Files:**
- Modify: `src/components/PostForm.tsx`

**Step 1: Replace `src/components/PostForm.tsx`**

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  onPost: (text: string) => Promise<void>
}

export function PostForm({ onPost }: Props) {
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    setError(null)
    try {
      await onPost(text)
      setText("")
    } catch {
      setError("Failed to post. Please try again.")
    } finally {
      setPosting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-border">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Leave a comment..."
        maxLength={1000}
        rows={3}
        className="resize-none"
        disabled={posting}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">{text.length}/1000</span>
        <Button type="submit" size="sm" disabled={!text.trim() || posting}>
          {posting ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  )
}
```

**Step 2: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/PostForm.tsx && git commit -m "refactor: PostForm uses shadcn Button and Textarea"
```

---

## Task 9: Refactor `CommentItem` Vote Buttons with Shadcn Button

**Files:**
- Modify: `src/components/CommentItem.tsx`

**Step 1: Replace `src/components/CommentItem.tsx`**

```typescript
import { Id } from "../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"

export interface Comment {
  _id: Id<"comments">
  text: string
  score: number
  createdAt: number
  authorId: string
}

interface Props {
  comment: Comment
  currentVote: "up" | "down" | null
  onVote: (direction: "up" | "down") => void
}

export function CommentItem({ comment, currentVote, onVote }: Props) {
  return (
    <div className="flex gap-2 py-3 border-b border-border last:border-0">
      <div className="flex flex-col items-center gap-0.5 pt-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${currentVote === "up" ? "text-orange-500 hover:text-orange-600" : "text-muted-foreground"}`}
          onClick={() => onVote("up")}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {comment.score}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 w-6 ${currentVote === "down" ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground"}`}
          onClick={() => onVote("down")}
          aria-label="Downvote"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground break-words">{comment.text}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(comment.createdAt)}</p>
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}
```

**Step 2: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/CommentItem.tsx && git commit -m "refactor: CommentItem vote buttons use shadcn Button"
```

---

## Task 10: Refactor `Drawer` with Shadcn Sheet

**Files:**
- Modify: `src/components/Drawer.tsx`

**Step 1: Replace `src/components/Drawer.tsx`**

```typescript
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Comment, CommentItem } from "./CommentItem"
import { PostForm } from "./PostForm"

interface Props {
  comments: Comment[]
  commentCount: number
  currentVotes: Record<string, "up" | "down">
  onVote: (commentId: string, direction: "up" | "down") => void
  onPost: (text: string) => Promise<void>
  error: string | null
  onRetry: () => void
}

const DRAWER_STATE_KEY = "paCommentsDrawerOpen"

export function Drawer({
  comments,
  commentCount,
  currentVotes,
  onVote,
  onPost,
  error,
  onRetry,
}: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(DRAWER_STATE_KEY).then((result) => {
      if (result[DRAWER_STATE_KEY] === true) setOpen(true)
    })
  }, [])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    chrome.storage.local.set({ [DRAWER_STATE_KEY]: next })
  }

  return (
    <>
      {/* Toggle tab — always visible */}
      <button
        onClick={() => handleOpenChange(!open)}
        className={`fixed top-1/2 -translate-y-1/2 z-[999999] flex flex-col items-center justify-center gap-1 bg-orange-500 text-white w-9 rounded-l-lg py-3 shadow-lg hover:bg-orange-600 transition-all duration-300 ease-in-out ${
          open ? "right-[380px]" : "right-0"
        }`}
        aria-label="Toggle comments"
      >
        <span className="text-base leading-none">💬</span>
        {commentCount > 0 && (
          <span className="text-[10px] font-bold leading-none">
            {commentCount > 99 ? "99+" : commentCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="p-0 flex flex-col top-[80px] h-[calc(100vh-80px)] w-[380px]"
        >
          <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
            <SheetTitle className="text-sm">
              Community Comments{" "}
              {commentCount > 0 && (
                <span className="text-muted-foreground font-normal">
                  ({commentCount})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="shrink-0">
            <PostForm onPost={onPost} />
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            {error ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={onRetry}
                  className="text-sm text-orange-500 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first!
              </p>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  currentVote={currentVotes[c._id] ?? null}
                  onVote={(dir) => onVote(c._id, dir)}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
```

**Step 2: Type-check**

```bash
cd /Users/djordje/projects/polovni-comments && npx tsc --noEmit 2>&1
```

Expected: no errors.

**Step 3: Build**

```bash
cd /Users/djordje/projects/polovni-comments && npm run build 2>&1 | tail -5
```

Expected: `✓ built in ...`

**Step 4: Commit**

```bash
git add src/components/Drawer.tsx && git commit -m "refactor: Drawer uses shadcn Sheet component"
```

---

## Final Check

```bash
cd /Users/djordje/projects/polovni-comments && npx vitest run 2>&1 | tail -8
```

Expected: 16/16 tests pass (tests are Convex/utility tests — no UI component tests).

Then reload the unpacked extension in Chrome and verify:
1. Toggle tab opens the drawer
2. Drawer slides in with shadcn animation
3. Overlay appears behind drawer
4. Built-in × button and toggle tab both close it
5. Textarea and Post button render with shadcn style
6. Vote buttons use ChevronUp/ChevronDown icons
