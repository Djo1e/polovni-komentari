import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const react = mutation({
  args: {
    targetType: v.union(v.literal("listing"), v.literal("comment")),
    targetId: v.string(),
    reactorId: v.string(),
    emoji: v.string(),
    category: v.union(v.literal("price"), v.literal("general")),
  },
  handler: async (ctx, { targetType, targetId, reactorId, emoji, category }) => {
    const userReactions = await ctx.db
      .query("reactions")
      .withIndex("by_target_reactor", (q) =>
        q.eq("targetType", targetType).eq("targetId", targetId).eq("reactorId", reactorId)
      )
      .collect();

    const existing = userReactions.find((r) => r.emoji === emoji);

    if (existing) {
      await ctx.db.delete(existing._id);
      return;
    }

    const existingInCategory = userReactions.find((r) => r.category === category);
    if (existingInCategory) {
      await ctx.db.delete(existingInCategory._id);
    }

    await ctx.db.insert("reactions", {
      targetType,
      targetId,
      reactorId,
      emoji,
      category,
    });
  },
});

export const getListingReactions = query({
  args: { listingId: v.string() },
  handler: async (ctx, { listingId }) => {
    return ctx.db
      .query("reactions")
      .withIndex("by_target", (q) =>
        q.eq("targetType", "listing").eq("targetId", listingId)
      )
      .collect();
  },
});
