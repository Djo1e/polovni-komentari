import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CommentItem({ comment, currentVote, onVote }) {
    const timeAgo = formatTimeAgo(comment.createdAt);
    return (_jsxs("div", { className: "flex gap-2 py-3 border-b border-gray-100 last:border-0", children: [_jsxs("div", { className: "flex flex-col items-center gap-1 pt-0.5", children: [_jsx("button", { onClick: () => onVote("up"), className: `text-lg leading-none transition-colors ${currentVote === "up"
                            ? "text-orange-500"
                            : "text-gray-400 hover:text-gray-600"}`, "aria-label": "Upvote", children: "\u25B2" }), _jsx("span", { className: "text-xs font-semibold text-gray-600 tabular-nums", children: comment.score }), _jsx("button", { onClick: () => onVote("down"), className: `text-lg leading-none transition-colors ${currentVote === "down"
                            ? "text-blue-500"
                            : "text-gray-400 hover:text-gray-600"}`, "aria-label": "Downvote", children: "\u25BC" })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm text-gray-800 break-words", children: comment.text }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: timeAgo })] })] }));
}
function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1)
        return "just now";
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)
        return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
}
