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
  args: { listingId: v.string(), text: v.string(), authorId: v.string() },
  handler: async (ctx, { listingId, text, authorId }) => {
    if (text.trim().length === 0) throw new Error("Comment cannot be empty");
    if (text.length > 1000) throw new Error("Comment too long");
    return ctx.db.insert("comments", {
      listingId,
      authorId,
      text: text.trim(),
      createdAt: Date.now(),
    });
  },
});
