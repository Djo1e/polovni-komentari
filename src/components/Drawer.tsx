import { useState, useEffect } from "react";
import { Comment, CommentItem } from "./CommentItem";
import { PostForm } from "./PostForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  comments: Comment[];
  commentCount: number;
  currentVotes: Record<string, "up" | "down">;
  onVote: (commentId: string, direction: "up" | "down") => void;
  onPost: (text: string) => Promise<void>;
  error: string | null;
  onRetry: () => void;
}

const DRAWER_STATE_KEY = "paCommentsDrawerOpen";

export function Drawer({
  comments,
  commentCount,
  currentVotes,
  onVote,
  onPost,
  error,
  onRetry,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(DRAWER_STATE_KEY).then((result) => {
      if (result[DRAWER_STATE_KEY] === true) setOpen(true);
    });
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    chrome.storage.local.set({ [DRAWER_STATE_KEY]: next });
  }

  return (
    <>
      {/* Toggle tab - outside Sheet */}
      <button
        onClick={toggle}
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

      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          chrome.storage.local.set({ [DRAWER_STATE_KEY]: v });
        }}
      >
        <SheetContent className="w-[380px] top-[80px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
            <SheetTitle>
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
                  currentVote={currentVotes[c._id] ?? null}
                  onVote={(dir) => onVote(c._id, dir)}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
