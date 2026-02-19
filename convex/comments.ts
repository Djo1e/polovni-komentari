import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getComments = query({
  args: { listingId: v.string() },
  handler: async (ctx, { listingId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_listing", (q) => q.eq("listingId", listingId))
      .collect();

    const withScores = await Promise.all(
      comments.map(async (comment) => {
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
          .collect();
        const score = votes.reduce(
          (acc, v) => acc + (v.direction === "up" ? 1 : -1),
          0
        );
        return { ...comment, score };
      })
    );

    return withScores.sort((a, b) => b.score - a.score);
  },
});

export const postComment = mutation({
  args: {
    listingId: v.string(),
    text: v.string(),
    authorId: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, { listingId, text, authorId, parentId }) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) throw new Error("Comment cannot be empty");
    if (trimmed.length > 1000) throw new Error("Comment too long");

    if (parentId) {
      const parent = await ctx.db.get(parentId);
      if (!parent) throw new Error("Parent comment not found");
      if (parent.listingId !== listingId)
        throw new Error("Parent belongs to different listing");
      if (parent.parentId) throw new Error("Cannot reply to a reply");
    }

    return ctx.db.insert("comments", {
      listingId,
      authorId,
      text: trimmed,
      createdAt: Date.now(),
      ...(parentId ? { parentId } : {}),
    });
  },
});
