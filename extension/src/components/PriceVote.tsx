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
    <div className="px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">Cena</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onReact("listing", listingId, "👍", "price")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer ${
            userVote?.emoji === "👍"
              ? "bg-orange-100 text-orange-600 ring-1 ring-orange-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          👍 <span className="tabular-nums">{upCount}</span>
        </button>
        <button
          onClick={() => onReact("listing", listingId, "👎", "price")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer ${
            userVote?.emoji === "👎"
              ? "bg-blue-100 text-blue-600 ring-1 ring-blue-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          👎 <span className="tabular-nums">{downCount}</span>
        </button>
      </div>
      {total > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
