import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByVin = query({
  args: { vin: v.string() },
  handler: async (ctx, { vin }) => {
    return ctx.db
      .query("vinChecks")
      .withIndex("by_vin", (q) => q.eq("vin", vin))
      .first();
  },
});

export const saveCheck = mutation({
  args: {
    vin: v.string(),
    found: v.boolean(),
    statusLines: v.array(v.string()),
  },
  handler: async (ctx, { vin, found, statusLines }) => {
    const existing = await ctx.db
      .query("vinChecks")
      .withIndex("by_vin", (q) => q.eq("vin", vin))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { found, statusLines, checkedAt: Date.now() });
      return existing._id;
    }

    return ctx.db.insert("vinChecks", { vin, found, statusLines, checkedAt: Date.now() });
  },
});
