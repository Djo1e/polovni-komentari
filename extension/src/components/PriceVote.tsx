import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Reaction {
  emoji: string;
  category: string;
  reactorId: string;
}

interface Props {
  listingId: string;
  reactions: Reaction[];
  onReact: (targetType: "listing" | "comment", targetId: string, emoji: string, category: "price" | "general") => void;
  anonymousId: string;
}

export function PriceVote({ listingId, reactions, onReact, anonymousId }: Props) {
  const priceReactions = reactions.filter((r) => r.category === "price");
  const upCount = priceReactions.filter((r) => r.emoji === "👍").length;
  const downCount = priceReactions.filter((r) => r.emoji === "👎").length;
  const total = upCount + downCount;
  const upPercent = total > 0 ? Math.round((upCount / total) * 100) : 0;

  const userVote = priceReactions.find((r) => r.reactorId === anonymousId);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onReact("listing", listingId, "👍", "price")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer border-solid border ${
            userVote?.emoji === "👍"
              ? "bg-orange-50 text-orange-600 border-orange-300"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />{upCount > 0 && <span className="tabular-nums text-xs">{upCount}</span>}
        </button>
        <button
          onClick={() => onReact("listing", listingId, "👎", "price")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer border-solid border ${
            userVote?.emoji === "👎"
              ? "bg-blue-50 text-blue-600 border-blue-300"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />{downCount > 0 && <span className="tabular-nums text-xs">{downCount}</span>}
        </button>
      </div>
      {total > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${upPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{upPercent}%</span>
        </div>
      )}
    </div>
  );
}
