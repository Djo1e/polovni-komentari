import { useState, useRef, useEffect } from "react";
import { SmilePlus } from "lucide-react";

interface Props {
  commentId: string;
  reactions: Array<{emoji: string; count: number}>;
  onReact: (targetType: "listing" | "comment", targetId: string, emoji: string, category: "price" | "general") => void;
  activeEmojis: string[];
}

const COMMENT_EMOJIS = ["😄", "🤔", "👏", "😂", "❤️"];

export function CommentReactions({ commentId, reactions, onReact, activeEmojis }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  const visibleReactions = COMMENT_EMOJIS.filter((emoji) => {
    const entry = reactions.find((r) => r.emoji === emoji);
    return entry && entry.count > 0;
  });

  return (
    <div className="flex items-center gap-1">
      {visibleReactions.map((emoji) => {
        const entry = reactions.find((r) => r.emoji === emoji)!;
        const isActive = activeEmojis.includes(emoji);

        return (
          <button
            key={emoji}
            onClick={() => onReact("comment", commentId, emoji, "general")}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-base transition-colors cursor-pointer border-solid border ${
              isActive
                ? "bg-orange-100 text-orange-600 border-orange-300"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {emoji} <span className="tabular-nums text-sm">{entry.count}</span>
          </button>
        );
      })}

      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center justify-center w-7 h-7 rounded-full border-solid border border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Add reaction"
        >
          <SmilePlus className="h-4 w-4" />
        </button>

        {pickerOpen && (
          <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1 bg-white rounded-lg shadow-lg border-solid border border-gray-200 px-1.5 py-1 z-10">
            {COMMENT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact("comment", commentId, emoji, "general");
                  setPickerOpen(false);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 transition-colors cursor-pointer text-lg ${
                  activeEmojis.includes(emoji) ? "bg-orange-100" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
