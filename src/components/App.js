import { jsx as _jsx } from "react/jsx-runtime";
import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Drawer } from "./Drawer";
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
function CommentApp({ listingId, anonymousId }) {
    const commentsRaw = useQuery(api.comments.getComments, { listingId });
    const voteMutation = useMutation(api.votes.vote);
    const postMutation = useMutation(api.comments.postComment);
    const [error, setError] = useState(null);
    const [localVotes, setLocalVotes] = useState({});
    const comments = (commentsRaw ?? []);
    const handleVote = useCallback(async (commentId, direction) => {
        const prev = localVotes[commentId] ?? null;
        const next = prev === direction ? null : direction;
        setLocalVotes((v) => ({ ...v, [commentId]: next }));
        try {
            await voteMutation({
                commentId: commentId,
                voterId: anonymousId,
                direction,
            });
        }
        catch {
            setLocalVotes((v) => ({ ...v, [commentId]: prev }));
        }
    }, [localVotes, voteMutation, anonymousId]);
    const handlePost = useCallback(async (text) => {
        await postMutation({ listingId, text, authorId: anonymousId });
    }, [postMutation, listingId, anonymousId]);
    const mergedVotes = {
        ...Object.fromEntries(Object.entries(localVotes).filter(([, v]) => v !== null)),
    };
    const connectionError = commentsRaw === undefined ? error : null;
    return (_jsx(Drawer, { comments: comments, commentCount: comments.length, currentVotes: mergedVotes, onVote: handleVote, onPost: handlePost, error: connectionError, onRetry: () => setError(null) }));
}
export default function App(props) {
    return (_jsx(ConvexProvider, { client: convex, children: _jsx(CommentApp, { ...props }) }));
}
