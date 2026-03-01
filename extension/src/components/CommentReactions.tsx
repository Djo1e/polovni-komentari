interface Props {
  commentId: string;
  reactions: Array<{emoji: string; count: number}>;
  onReact: (targetType: "listing" | "comment", targetId: string, emoji: string, category: "price" | "general") => void;
  activeEmojis: string[];
}

const COMMENT_EMOJIS = ["😄", "👍", "👏"];

export function CommentReactions({ commentId, reactions, onReact, activeEmojis }: Props) {
  return (
    <div className="flex items-center gap-1">
      {COMMENT_EMOJIS.map((emoji) => {
        const entry = reactions.find((r) => r.emoji === emoji);
        const count = entry?.count ?? 0;
        const isActive = activeEmojis.includes(emoji);

        return (
          <button
            key={emoji}
            onClick={() => onReact("comment", commentId, emoji, "general")}
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors cursor-pointer ${
              isActive
                ? "bg-orange-100 text-orange-600 ring-1 ring-orange-300"
                : count > 0
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          >
            {emoji} <span className="tabular-nums">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
