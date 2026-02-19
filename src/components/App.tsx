import { ConvexProvider, ConvexReactClient, useQuery, useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Drawer } from "./Drawer";
import { Comment } from "./CommentItem";
import { ShadowPortalContext } from "../context/shadow-portal";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

interface AppProps {
  listingId: string;
  anonymousId: string;
  portalContainer: HTMLElement;
}

function CommentApp({ listingId, anonymousId }: Omit<AppProps, "portalContainer">) {
  const commentsRaw = useQuery(api.comments.getComments, { listingId });
  const voteMutation = useMutation(api.votes.vote);
  const postMutation = useMutation(api.comments.postComment);
  const [error, setError] = useState<string | null>(null);
  const [localVotes, setLocalVotes] = useState<Record<string, "up" | "down" | null>>({});

  const comments: Comment[] = (commentsRaw ?? []) as Comment[];

  const handleVote = useCallback(
    async (commentId: string, direction: "up" | "down") => {
      const prev = localVotes[commentId] ?? null;
      const next = prev === direction ? null : direction;
      setLocalVotes((v) => ({ ...v, [commentId]: next }));
      try {
        await voteMutation({
          commentId: commentId as Id<"comments">,
          voterId: anonymousId,
          direction,
        });
      } catch {
        setLocalVotes((v) => ({ ...v, [commentId]: prev }));
      }
    },
    [localVotes, voteMutation, anonymousId]
  );

  const handlePost = useCallback(
    async (text: string) => {
      await postMutation({ listingId, text, authorId: anonymousId });
    },
    [postMutation, listingId, anonymousId]
  );

  const mergedVotes = {
    ...Object.fromEntries(
      Object.entries(localVotes).filter(([, v]) => v !== null) as [string, "up" | "down"][]
    ),
  };

  const connectionError = commentsRaw === undefined ? error : null;

  return (
    <Drawer
      comments={comments}
      commentCount={comments.length}
      currentVotes={mergedVotes}
      onVote={handleVote}
      onPost={handlePost}
      error={connectionError}
      onRetry={() => setError(null)}
      anonymousId={anonymousId}
    />
  );
}

export default function App({ portalContainer, ...props }: AppProps) {
  return (
    <ShadowPortalContext.Provider value={portalContainer}>
      <ConvexProvider client={convex}>
        <CommentApp {...props} />
      </ConvexProvider>
    </ShadowPortalContext.Provider>
  );
}
