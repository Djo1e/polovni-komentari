import { useState, useEffect } from "react";
import { Comment, CommentItem } from "./CommentItem";
import { PostForm } from "./PostForm";

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

      <div
        className={`fixed top-[80px] right-0 bottom-0 w-[380px] z-[999998] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-800">
            Community Comments{" "}
            {commentCount > 0 && (
              <span className="text-gray-400">({commentCount})</span>
            )}
          </h2>
          <button
            onClick={toggle}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xl"
            aria-label="Close"
          >
            ×
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
                currentVote={currentVotes[c._id] ?? null}
                onVote={(dir) => onVote(c._id, dir)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
