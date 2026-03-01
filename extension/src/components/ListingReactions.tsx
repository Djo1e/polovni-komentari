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

const LISTING_EMOJIS = ["😍", "⚠️", "💩"];

export function ListingReactions({ listingId, reactions, onReact, anonymousId }: Props) {
  const generalReactions = reactions.filter((r) => r.category === "general");

  return (
    <div className="px-4 pb-3 flex items-center gap-1.5">
      {LISTING_EMOJIS.map((emoji) => {
        const count = generalReactions.filter((r) => r.emoji === emoji).length;
        const isActive = generalReactions.some(
          (r) => r.emoji === emoji && r.reactorId === anonymousId
        );

        return (
          <button
            key={emoji}
            onClick={() => onReact("listing", listingId, emoji, "general")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer ${
              isActive
                ? "bg-orange-100 text-orange-600 ring-1 ring-orange-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {emoji} <span className="tabular-nums text-xs">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
