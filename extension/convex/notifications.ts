import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

// Shared helper function so postComment can call it directly (not via scheduler)
export async function createNotificationsForReplyHelper(
  ctx: MutationCtx,
  args: {
    commentId: Id<"comments">;
    parentId: Id<"comments">;
    listingId: string;
    authorName: string;
    authorId: string;
  }
) {
  const { commentId, parentId, listingId, authorName, authorId } = args;

  // Find the direct parent comment
  const parent = await ctx.db.get(parentId);
  if (!parent) return;

  // Walk up to find root comment
  let root = parent;
  for (let i = 0; i < 100; i++) {
    if (!root.parentId) break;
    const next = await ctx.db.get(root.parentId);
    if (!next) break;
    root = next;
  }

  // Collect unique signed-in user IDs to notify
  const userIdsToNotify = new Set<Id<"users">>();

  // Notify parent comment author (if signed in)
  if (parent.userId) userIdsToNotify.add(parent.userId);

  // Notify root comment author (if signed in and different from parent)
  if (root.userId) userIdsToNotify.add(root.userId);

  // Don't notify the reply author themselves
  const replierUser = await ctx.db
    .query("users")
    .withIndex("by_anonymousId", (q) => q.eq("anonymousId", authorId))
    .unique();
  if (replierUser) userIdsToNotify.delete(replierUser._id);

  // Create notifications
  for (const userId of userIdsToNotify) {
    await ctx.db.insert("notifications", {
      userId,
      type: "reply",
      commentId,
      triggerAuthorName: authorName,
      listingId,
      read: false,
      emailSent: false,
      createdAt: Date.now(),
    });
  }
}

// Internal mutation wrapper (for use with ctx.runMutation from actions)
export const createNotificationsForReply = internalMutation({
  args: {
    commentId: v.id("comments"),
    parentId: v.id("comments"),
    listingId: v.string(),
    authorName: v.string(),
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    await createNotificationsForReplyHelper(ctx, args);
  },
});

export const getNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", userId).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

export const markAllRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", userId).eq("read", false)
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
  },
});

export const markEmailSent = internalMutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { emailSent: true });
  },
});
