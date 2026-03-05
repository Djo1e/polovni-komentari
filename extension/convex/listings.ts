import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const getListing = query({
  args: { listingId: v.string() },
  handler: async (ctx, { listingId }) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_listingId", (q) => q.eq("listingId", listingId))
      .first();
    if (!listing) return null;
    return {
      title: listing.title,
      price: listing.price,
      imageUrl: listing.imageUrl,
      url: listing.url,
      isDeleted: listing.isDeleted ?? false,
    };
  },
});

export const markListingDeleted = mutation({
  args: { listingId: v.string() },
  handler: async (ctx, { listingId }) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_listingId", (q) => q.eq("listingId", listingId))
      .first();
    if (listing) {
      await ctx.db.patch(listing._id, { isDeleted: true });
    }
  },
});
