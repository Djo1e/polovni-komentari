import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertListing = mutation({
  args: {
    listingId: v.string(),
    title: v.string(),
    price: v.string(),
    imageUrl: v.string(),
    url: v.string(),
    // Accept but ignore fields sent by older extension versions
    vin: v.optional(v.any()),
    boughtNewInSerbia: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { vin: _vin, boughtNewInSerbia: _bns, ...listingData } = args;
    const existing = await ctx.db
      .query("listings")
      .withIndex("by_listingId", (q) => q.eq("listingId", listingData.listingId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: listingData.title,
        price: listingData.price,
        imageUrl: listingData.imageUrl,
        url: listingData.url,
      });
      return existing._id;
    }

    return ctx.db.insert("listings", listingData);
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
