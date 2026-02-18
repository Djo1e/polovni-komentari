import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { CommentItem } from "./CommentItem";
import { PostForm } from "./PostForm";
const DRAWER_STATE_KEY = "paCommentsDrawerOpen";
export function Drawer({ comments, commentCount, currentVotes, onVote, onPost, error, onRetry, }) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        chrome.storage.local.get(DRAWER_STATE_KEY).then((result) => {
            if (result[DRAWER_STATE_KEY] === true)
                setOpen(true);
        });
    }, []);
    function toggle() {
        const next = !open;
        setOpen(next);
        chrome.storage.local.set({ [DRAWER_STATE_KEY]: next });
    }
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: toggle, className: "fixed right-0 top-1/2 -translate-y-1/2 z-[999999] flex flex-col items-center justify-center gap-1 bg-orange-500 text-white w-9 rounded-l-lg py-3 shadow-lg hover:bg-orange-600 transition-colors", "aria-label": "Toggle comments", children: [_jsx("span", { className: "text-base leading-none", children: "\uD83D\uDCAC" }), commentCount > 0 && (_jsx("span", { className: "text-[10px] font-bold leading-none", children: commentCount > 99 ? "99+" : commentCount }))] }), _jsxs("div", { className: `fixed top-[80px] right-0 bottom-0 w-[380px] z-[999998] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`, children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0", children: [_jsxs("h2", { className: "text-sm font-semibold text-gray-800", children: ["Community Comments", " ", commentCount > 0 && (_jsxs("span", { className: "text-gray-400", children: ["(", commentCount, ")"] }))] }), _jsx("button", { onClick: toggle, className: "text-gray-400 hover:text-gray-600 text-lg leading-none", "aria-label": "Close", children: "\u00D7" })] }), _jsx("div", { className: "shrink-0", children: _jsx(PostForm, { onPost: onPost }) }), _jsx("div", { className: "flex-1 overflow-y-auto px-3", children: error ? (_jsxs("div", { className: "flex flex-col items-center gap-2 py-8 text-center", children: [_jsx("p", { className: "text-sm text-gray-500", children: error }), _jsx("button", { onClick: onRetry, className: "text-sm text-orange-500 hover:underline", children: "Retry" })] })) : comments.length === 0 ? (_jsx("p", { className: "text-sm text-gray-400 text-center py-8", children: "No comments yet. Be the first!" })) : (comments.map((c) => (_jsx(CommentItem, { comment: c, currentVote: currentVotes[c._id] ?? null, onVote: (dir) => onVote(c._id, dir) }, c._id)))) })] })] }));
}
