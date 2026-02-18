import { Id } from "../../convex/_generated/dataModel";

export interface Comment {
  _id: Id<"comments">;
  text: string;
  score: number;
  createdAt: number;
  authorId: string;
}

interface Props {
  comment: Comment;
  currentVote: "up" | "down" | null;
  onVote: (direction: "up" | "down") => void;
}

export function CommentItem({ comment, currentVote, onVote }: Props) {
  const timeAgo = formatTimeAgo(comment.createdAt);

  return (
    <div className="flex gap-2 py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <button
          onClick={() => onVote("up")}
          className={`text-lg leading-none transition-colors ${
            currentVote === "up"
              ? "text-orange-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className="text-xs font-semibold text-gray-600 tabular-nums">
          {comment.score}
        </span>
        <button
          onClick={() => onVote("down")}
          className={`text-lg leading-none transition-colors ${
            currentVote === "down"
              ? "text-blue-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 break-words">{comment.text}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
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
