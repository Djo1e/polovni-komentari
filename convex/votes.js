import { v } from "convex/values";
import { mutation } from "./_generated/server";
export const vote = mutation({
    args: {
        commentId: v.id("comments"),
        voterId: v.string(),
        direction: v.union(v.literal("up"), v.literal("down")),
    },
    handler: async (ctx, { commentId, voterId, direction }) => {
        const existing = await ctx.db
            .query("votes")
            .withIndex("by_comment_voter", (q) => q.eq("commentId", commentId).eq("voterId", voterId))
            .unique();
        if (!existing) {
            await ctx.db.insert("votes", { commentId, voterId, direction });
        }
        else if (existing.direction === direction) {
            // Same direction — toggle off
            await ctx.db.delete(existing._id);
        }
        else {
            // Different direction — switch
            await ctx.db.patch(existing._id, { direction });
        }
    },
});
