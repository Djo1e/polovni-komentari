import { useState } from "react";

interface Props {
  onPost: (text: string) => Promise<void>;
}

export function PostForm({ onPost }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await onPost(text);
      setText("");
    } catch {
      setError("Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Leave a comment..."
        maxLength={1000}
        rows={3}
        className="w-full text-sm border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
        disabled={posting}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">{text.length}/1000</span>
        <button
          type="submit"
          disabled={!text.trim() || posting}
          className="text-sm bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
