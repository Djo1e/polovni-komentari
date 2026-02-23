import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsertListing = mutation({
  args: {
    listingId: v.string(),
    title: v.string(),
    price: v.string(),
    imageUrl: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("listings")
      .withIndex("by_listingId", (q) => q.eq("listingId", args.listingId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        price: args.price,
        imageUrl: args.imageUrl,
        url: args.url,
      });
      return existing._id;
    }

    return ctx.db.insert("listings", args);
  },
});
