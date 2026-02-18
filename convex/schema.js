import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    comments: defineTable({
        listingId: v.string(),
        authorId: v.string(),
        text: v.string(),
        createdAt: v.number(),
    }).index("by_listing", ["listingId"]),
    votes: defineTable({
        commentId: v.id("comments"),
        voterId: v.string(),
        direction: v.union(v.literal("up"), v.literal("down")),
    })
        .index("by_comment", ["commentId"])
        .index("by_comment_voter", ["commentId", "voterId"]),
});
