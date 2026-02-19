import { ChevronDown, ChevronUp, User } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

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
  anonymousId: string;
}

export function CommentItem({ comment, currentVote, onVote, anonymousId }: Props) {
  const timeAgo = formatTimeAgo(comment.createdAt);
  const isOwn = comment.authorId === anonymousId;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <User className="h-4 w-4 text-gray-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 break-words leading-snug">{comment.text}</p>

        {/* Footer: timestamp + votes */}
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400">{timeAgo}</p>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVote("up")}
              aria-label="Upvote"
              disabled={isOwn}
              className={`h-6 w-6 ${currentVote === "up" ? "text-orange-500" : "text-muted-foreground"}`}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-semibold text-gray-600 tabular-nums w-4 text-center">
              {comment.score}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onVote("down")}
              aria-label="Downvote"
              disabled={isOwn}
              className={`h-6 w-6 ${currentVote === "down" ? "text-blue-500" : "text-muted-foreground"}`}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
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
