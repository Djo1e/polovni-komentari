import { useState, useRef, useEffect } from "react";
import { SmilePlus } from "lucide-react";

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const generalReactions = reactions.filter((r) => r.category === "general");

  useEffect(() => {
    if (!pickerOpen) return;
    const root = pickerRef.current?.getRootNode() as Document | ShadowRoot;
    function handleClick(e: Event) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    root.addEventListener("mousedown", handleClick);
    return () => root.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  const visibleReactions = LISTING_EMOJIS.filter((emoji) => {
    return generalReactions.some((r) => r.emoji === emoji);
  });

  return (
    <div className="flex items-center gap-1.5">
      {visibleReactions.map((emoji) => {
        const count = generalReactions.filter((r) => r.emoji === emoji).length;
        const isActive = generalReactions.some(
          (r) => r.emoji === emoji && r.reactorId === anonymousId
        );

        return (
          <button
            key={emoji}
            onClick={() => onReact("listing", listingId, emoji, "general")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors cursor-pointer border-solid border ${
              isActive
                ? "bg-orange-50 text-orange-600 border-orange-300"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {emoji} <span className="tabular-nums text-xs">{count}</span>
          </button>
        );
      })}

      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center justify-center w-7 h-7 rounded-full border-solid border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors cursor-pointer bg-white"
          aria-label="Add reaction"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>

        {pickerOpen && (
          <div className="absolute bottom-full left-0 mb-1 flex items-center gap-0.5 bg-white rounded-lg shadow-lg border-solid border border-gray-200 px-1 py-1 z-10">
            {LISTING_EMOJIS.map((emoji) => {
              const isActive = generalReactions.some(
                (r) => r.emoji === emoji && r.reactorId === anonymousId
              );
              return (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact("listing", listingId, emoji, "general");
                    setPickerOpen(false);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer text-base ${
                    isActive ? "bg-orange-50" : ""
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
